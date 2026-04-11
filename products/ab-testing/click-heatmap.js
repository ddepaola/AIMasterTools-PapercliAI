/**
 * AIMasterTools Click Heatmap Tracker
 * Records click coordinates and element selectors to localStorage.
 * Heatmap data is visualised on the /admin/ab-tests.html dashboard.
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'aimt_heatmap';
  var MAX_CLICKS = 2000; // cap to avoid localStorage bloat

  function loadClicks(page) {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var store = raw ? JSON.parse(raw) : {};
      return store[page] || [];
    } catch (e) { return []; }
  }

  function saveClicks(page, clicks) {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var store = raw ? JSON.parse(raw) : {};
      store[page] = clicks.slice(-MAX_CLICKS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) { /* ignore */ }
  }

  function getSelector(el) {
    if (!el || el === document.body) return 'body';
    var tag = el.tagName.toLowerCase();
    var id = el.id ? '#' + el.id : '';
    var cls = el.className && typeof el.className === 'string'
      ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
      : '';
    return tag + id + cls;
  }

  function getAllClicks() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }

  function clearAll() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  }

  var HEATMAP = {
    init: function (options) {
      var page = (options && options.page) || location.pathname;
      var endpoint = (global.AIMT_AB_CONFIG || {}).analyticsEndpoint;

      document.addEventListener('click', function (e) {
        var scrollX = window.scrollX || window.pageXOffset;
        var scrollY = window.scrollY || window.pageYOffset;
        var vw = window.innerWidth;
        var vh = window.innerHeight;

        var click = {
          // Normalized coordinates (0–1) relative to viewport
          xp: Math.round((e.clientX / vw) * 1000) / 1000,
          yp: Math.round((e.clientY / vh) * 1000) / 1000,
          // Absolute page position
          x: e.clientX + scrollX,
          y: e.clientY + scrollY,
          sel: getSelector(e.target),
          ts: Date.now()
        };

        var clicks = loadClicks(page);
        clicks.push(click);
        saveClicks(page, clicks);

        // Forward to analytics if configured
        if (endpoint) {
          var payload = { type: 'click', page: page, click: click };
          try {
            navigator.sendBeacon
              ? navigator.sendBeacon(endpoint, JSON.stringify(payload))
              : fetch(endpoint, { method: 'POST', body: JSON.stringify(payload), keepalive: true }).catch(function () {});
          } catch (ex) { /* ignore */ }
        }
      }, { passive: true });
    },

    getAllClicks: getAllClicks,

    getPageClicks: function (page) {
      return loadClicks(page || location.pathname);
    },

    clearAll: clearAll
  };

  global.AIMT_HEATMAP = HEATMAP;

})(window);
