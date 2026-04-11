/**
 * AIMasterTools A/B Testing Engine
 * Persistent variant assignment, conversion tracking, and auto-winner selection.
 * Data is stored in localStorage for per-device tracking.
 * Events are optionally forwarded to AIMT_AB_CONFIG.analyticsEndpoint if configured.
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'aimt_ab';
  var VERSION = 1;

  // ── Helpers ────────────────────────────────────────────────────────────────

  function loadStore() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.v === VERSION) return parsed;
      }
    } catch (e) { /* ignore */ }
    return { v: VERSION, tests: {} };
  }

  function saveStore(store) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch (e) { /* ignore */ }
  }

  function rand() {
    if (crypto && crypto.getRandomValues) {
      var arr = new Uint32Array(1);
      crypto.getRandomValues(arr);
      return arr[0] / 4294967296;
    }
    return Math.random();
  }

  // ── Chi-square significance (2-variant) ────────────────────────────────────
  // Returns p-value approximation using Wilson–Hilferty normal approximation.
  function chiSquarePValue(impressionsA, conversionsA, impressionsB, conversionsB) {
    if (impressionsA < 1 || impressionsB < 1) return 1;
    var rA = conversionsA / impressionsA;
    var rB = conversionsB / impressionsB;
    var n = impressionsA + impressionsB;
    var p = (conversionsA + conversionsB) / n;
    if (p === 0 || p === 1) return 1;
    var chi2 = n * Math.pow(rA - rB, 2) / (p * (1 - p));
    // Normal approximation of chi2 CDF (df=1) via Wilson–Hilferty
    var x = Math.pow(chi2 / 1, 1 / 3);
    var mu = 1 - 2 / 9;
    var sigma = Math.sqrt(2 / 9);
    var z = (x - mu) / sigma;
    // Standard normal CDF approximation
    var p_val = 1 - stdNormCDF(z);
    return Math.min(1, Math.max(0, p_val));
  }

  function stdNormCDF(z) {
    // Abramowitz & Stegun approximation
    var t = 1 / (1 + 0.2316419 * Math.abs(z));
    var poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    var pdf = Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
    var cdf = 1 - pdf * poly;
    return z >= 0 ? cdf : 1 - cdf;
  }

  // ── Core A/B engine ────────────────────────────────────────────────────────

  var AB = {
    /**
     * Assign (or recall) a variant for a test on this page.
     * @param {string} testId - unique test identifier e.g. "crypto-hero-headline"
     * @param {string[]} variants - e.g. ["control", "variant-b"]
     * @returns {string} variant name
     */
    assign: function (testId, variants) {
      var store = loadStore();
      var test = store.tests[testId] || (store.tests[testId] = { variant: null, winner: null, impressions: {}, conversions: {} });

      // If a winner has been auto-selected, always serve it
      if (test.winner) return test.winner;

      // If already assigned, return that
      if (test.variant && variants.indexOf(test.variant) !== -1) return test.variant;

      // New assignment
      var chosen = variants[Math.floor(rand() * variants.length)];
      test.variant = chosen;
      saveStore(store);
      return chosen;
    },

    /**
     * Record an impression (page view of the variant).
     */
    impression: function (testId) {
      var store = loadStore();
      var test = store.tests[testId];
      if (!test || !test.variant) return;
      test.impressions[test.variant] = (test.impressions[test.variant] || 0) + 1;
      saveStore(store);
      AB._maybeCheckSignificance(testId, store);
      AB._sendEvent(testId, test.variant, 'impression');
    },

    /**
     * Record a conversion event (signup, purchase, click-to-action, etc.)
     * @param {string} testId
     * @param {string} [conversionType] - e.g. "email_signup", "cta_click"
     */
    conversion: function (testId, conversionType) {
      var store = loadStore();
      var test = store.tests[testId];
      if (!test || !test.variant) return;
      var key = conversionType ? (test.variant + ':' + conversionType) : test.variant;
      test.conversions[key] = (test.conversions[key] || 0) + 1;
      // Also track total
      test.conversions[test.variant] = (test.conversions[test.variant] || 0) + 1;
      saveStore(store);
      AB._maybeCheckSignificance(testId, store);
      AB._sendEvent(testId, test.variant, 'conversion', conversionType);
    },

    /**
     * Get all stored test data (for admin dashboard).
     */
    getAll: function () {
      return loadStore().tests;
    },

    /**
     * Get data for a specific test.
     */
    getTest: function (testId) {
      return loadStore().tests[testId] || null;
    },

    /**
     * Force a winner for a test (called by admin override).
     */
    setWinner: function (testId, variant) {
      var store = loadStore();
      if (!store.tests[testId]) return;
      store.tests[testId].winner = variant;
      store.tests[testId].variant = variant;
      saveStore(store);
    },

    /**
     * Reset a test (clear assignment and stats for this device).
     */
    resetTest: function (testId) {
      var store = loadStore();
      delete store.tests[testId];
      saveStore(store);
    },

    // ── Internal ────────────────────────────────────────────────────────────

    _maybeCheckSignificance: function (testId, store) {
      var cfg = (global.AIMT_AB_TESTS || {})[testId];
      if (!cfg) return;

      var test = store.tests[testId];
      var variants = cfg.variants;
      if (!variants || variants.length !== 2) return;

      var vA = variants[0], vB = variants[1];
      var impA = test.impressions[vA] || 0, impB = test.impressions[vB] || 0;
      var convA = test.conversions[vA] || 0, convB = test.conversions[vB] || 0;

      var minConversions = cfg.minConversions || 20;
      var significance = cfg.significance || 0.95;

      if (convA + convB < minConversions) return; // not enough data

      var pVal = chiSquarePValue(impA, convA, impB, convB);
      var confidence = 1 - pVal;

      if (confidence >= significance) {
        var winner = (convA / Math.max(impA, 1)) >= (convB / Math.max(impB, 1)) ? vA : vB;
        test.winner = winner;
        saveStore(store);
        if (global.console) console.info('[AB] Winner detected for ' + testId + ': ' + winner + ' (confidence: ' + (confidence * 100).toFixed(1) + '%)');
      }
    },

    _sendEvent: function (testId, variant, eventType, subType) {
      var endpoint = (global.AIMT_AB_CONFIG || {}).analyticsEndpoint;
      if (!endpoint) return;
      try {
        var payload = { testId: testId, variant: variant, eventType: eventType, page: location.pathname, ts: Date.now() };
        if (subType) payload.subType = subType;
        navigator.sendBeacon
          ? navigator.sendBeacon(endpoint, JSON.stringify(payload))
          : fetch(endpoint, { method: 'POST', body: JSON.stringify(payload), keepalive: true }).catch(function () {});
      } catch (e) { /* ignore */ }
    }
  };

  global.AIMT_AB = AB;

})(window);
