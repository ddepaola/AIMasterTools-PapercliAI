/**
 * AIMasterTools Dynamic Pricing Engine
 * Detects user segment, injects tailored offers on pricing page,
 * and tracks conversions per segment via the existing A/B engine.
 *
 * Segments:
 *   referred     – arrived via ?ref= link (highest priority)
 *   first_visit  – never visited site before
 *   high_intent  – multiple page views in session or visited pricing before
 *   returning    – 2+ prior visits (default fallback)
 */
(function (window) {
  'use strict';

  var STORAGE_KEY = 'aimt_pe';
  var SESSION_KEY = 'aimt_pe_session';
  var REF_KEY     = 'aim_referred_by'; // written by referral.js
  var VERSION     = 1;

  // ── Storage helpers ───────────────────────────────────────────────────────

  function loadStore() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.v === VERSION) return parsed;
      }
    } catch (e) { /* ignore */ }
    return { v: VERSION, visits: 0, pricingViews: 0, segments: {}, conversionsBySegment: {} };
  }

  function saveStore(store) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch (e) { /* ignore */ }
  }

  function loadSession() {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : { pageviews: 0 };
    } catch (e) { return { pageviews: 0 }; }
  }

  function saveSession(sess) {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(sess)); } catch (e) { /* ignore */ }
  }

  // ── Segment detection ─────────────────────────────────────────────────────

  function detectSegment(store, session) {
    var referredBy = '';
    try { referredBy = localStorage.getItem(REF_KEY) || ''; } catch (e) { /* ignore */ }
    try {
      var params = new URLSearchParams(window.location.search);
      var urlRef = (params.get('ref') || '').replace(/[^a-zA-Z0-9\-]/g, '').substring(0, 32);
      if (urlRef) referredBy = urlRef;
    } catch (e) { /* ignore */ }
    if (referredBy) return 'referred';
    if (store.pricingViews >= 1 || session.pageviews >= 4) return 'high_intent';
    if (store.visits <= 1) return 'first_visit';
    return 'returning';
  }

  // ── Offer catalogue ───────────────────────────────────────────────────────
  // detail is an array of {type, text} nodes: type = 'text' | 'strong' | 'em'

  var OFFERS = {
    first_visit: {
      label: 'Welcome Offer',
      icon: '\uD83C\uDF89',
      headline: 'First Visit? Get 20% off Pro for your first month.',
      detail: [
        { type: 'text', text: 'Use code\u00a0' },
        { type: 'strong', text: 'WELCOME20' },
        { type: 'text', text: '\u00a0at checkout. No commitment \u2014 cancel any time.' },
      ],
      ctaText: 'Claim 20% Off',
      ctaHref: '#stripe-pro',
      urgency: false,
      proMonthlyDisplay: '$23',
      proMonthlyNote: 'first month, then $29/mo',
      badgeText: '20% OFF',
    },
    returning: {
      label: 'Welcome Back',
      icon: '\uD83D\uDC4B',
      headline: 'Welcome back! Grab the Pro + Enterprise bundle.',
      detail: [
        { type: 'text', text: 'Upgrade to Pro and unlock 1 free month of Enterprise features \u2014 all for\u00a0' },
        { type: 'strong', text: '$39/mo' },
        { type: 'text', text: '.' },
      ],
      ctaText: 'Get the Bundle',
      ctaHref: '#stripe-pro',
      urgency: false,
      proMonthlyDisplay: '$39',
      proMonthlyNote: 'bundle deal (reg. $29+$99)',
      badgeText: 'BUNDLE',
    },
    referred: {
      label: 'Referral Reward',
      icon: '\uD83E\uDD1D',
      headline: 'You were referred \u2014 claim your free month of Pro.',
      detail: [
        { type: 'text', text: 'Your friend shared a link. Both of you get rewarded. Use code\u00a0' },
        { type: 'strong', text: 'REF1FREE' },
        { type: 'text', text: '\u00a0at checkout.' },
      ],
      ctaText: 'Claim Free Month',
      ctaHref: '#stripe-pro',
      urgency: false,
      proMonthlyDisplay: '$0',
      proMonthlyNote: 'first month free, then $29/mo',
      badgeText: '1 MONTH FREE',
    },
    high_intent: {
      label: 'Limited Offer',
      icon: '\u26A1',
      headline: 'High demand right now \u2014 Pro at $24/mo for the next 2 hours.',
      detail: [
        { type: 'text', text: 'Only\u00a0' },
        { type: 'strong', text: '3 spots', id: 'aimt-pe-spots' },
        { type: 'text', text: '\u00a0at this price. Offer expires when the timer hits zero.' },
      ],
      ctaText: 'Lock In $24/mo',
      ctaHref: '#stripe-pro',
      urgency: true,
      proMonthlyDisplay: '$24',
      proMonthlyNote: 'limited-time (reg. $29/mo)',
      badgeText: 'LIMITED',
    },
  };

  // ── Countdown timer ───────────────────────────────────────────────────────

  var TIMER_KEY = 'aimt_pe_timer_end';

  function getOrCreateTimerEnd() {
    var end;
    try { end = parseInt(localStorage.getItem(TIMER_KEY), 10); } catch (e) { end = NaN; }
    if (!end || end < Date.now()) {
      end = Date.now() + 2 * 60 * 60 * 1000;
      try { localStorage.setItem(TIMER_KEY, String(end)); } catch (e) { /* ignore */ }
    }
    return end;
  }

  function startCountdown(timerEnd, timerEl) {
    function tick() {
      var remaining = timerEnd - Date.now();
      if (remaining <= 0) { timerEl.textContent = '00:00:00'; return; }
      var h = Math.floor(remaining / 3600000);
      var m = Math.floor((remaining % 3600000) / 60000);
      var s = Math.floor((remaining % 60000) / 1000);
      timerEl.textContent =
        (h < 10 ? '0' : '') + h + ':' +
        (m < 10 ? '0' : '') + m + ':' +
        (s < 10 ? '0' : '') + s;
    }
    tick();
    setInterval(tick, 1000);
  }

  // ── Safe DOM helpers ──────────────────────────────────────────────────────

  function el(tag, cls) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    return node;
  }

  function text(str) {
    return document.createTextNode(str);
  }

  function buildDetailNodes(nodes) {
    var frag = document.createDocumentFragment();
    nodes.forEach(function (n) {
      if (n.type === 'strong') {
        var s = document.createElement('strong');
        s.textContent = n.text;
        if (n.id) s.id = n.id;
        frag.appendChild(s);
      } else if (n.type === 'em') {
        var em = document.createElement('em');
        em.textContent = n.text;
        frag.appendChild(em);
      } else {
        frag.appendChild(document.createTextNode(n.text));
      }
    });
    return frag;
  }

  // ── DOM injection ─────────────────────────────────────────────────────────

  function injectBanner(segment, offer) {
    var existing = document.getElementById('aimt-pe-banner');
    if (existing) existing.parentNode.removeChild(existing);

    var banner = el('div');
    banner.id = 'aimt-pe-banner';
    banner.setAttribute('data-segment', segment);

    var inner   = el('div', 'aimt-pe-inner');
    var badge   = el('span', 'aimt-pe-badge');
    var icon    = el('span', 'aimt-pe-icon');
    var textDiv = el('div', 'aimt-pe-text');
    var headline = el('strong', 'aimt-pe-headline');
    var detail   = el('span', 'aimt-pe-detail');
    var cta      = el('a', 'aimt-pe-cta');
    var dismiss  = el('button', 'aimt-pe-dismiss');

    badge.textContent   = offer.badgeText;
    icon.textContent    = offer.icon;
    headline.textContent = offer.headline;
    detail.appendChild(buildDetailNodes(offer.detail));
    cta.textContent = offer.ctaText;
    cta.href        = offer.ctaHref;
    cta.setAttribute('data-pe-cta', '');
    cta.setAttribute('data-segment', segment);
    dismiss.textContent = '\u2715';
    dismiss.setAttribute('aria-label', 'Dismiss offer');
    dismiss.setAttribute('data-pe-dismiss', '');

    textDiv.appendChild(headline);
    textDiv.appendChild(detail);
    inner.appendChild(badge);
    inner.appendChild(icon);
    inner.appendChild(textDiv);

    if (offer.urgency) {
      var countdown = el('div', 'aimt-pe-countdown');
      var cdLabel   = el('span', 'aimt-pe-countdown-label');
      var cdTimer   = el('span', 'aimt-pe-timer');
      cdTimer.id    = 'aimt-pe-timer';
      cdLabel.textContent = 'Offer expires in';
      cdTimer.textContent = '02:00:00';
      countdown.appendChild(cdLabel);
      countdown.appendChild(cdTimer);
      inner.appendChild(countdown);
    }

    inner.appendChild(cta);
    inner.appendChild(dismiss);
    banner.appendChild(inner);

    var pricingSection = document.querySelector('section[aria-label="Pricing plans"]');
    if (pricingSection) {
      pricingSection.parentNode.insertBefore(banner, pricingSection);
    } else {
      document.body.insertBefore(banner, document.body.firstChild);
    }

    if (offer.urgency) {
      var timerEl = document.getElementById('aimt-pe-timer');
      if (timerEl) startCountdown(getOrCreateTimerEnd(), timerEl);
    }

    dismiss.addEventListener('click', function () {
      banner.style.display = 'none';
      try { localStorage.setItem('aimt_pe_dismissed', '1'); } catch (e) { /* ignore */ }
    });

    return banner;
  }

  function updatePriceCards(offer) {
    var proAmountEl = document.querySelector('.pricing-card.popular .amount');
    var proNoteEl   = document.querySelector('.pricing-card.popular .period');
    if (proAmountEl && offer.proMonthlyDisplay) {
      proAmountEl.setAttribute('data-original-monthly', proAmountEl.dataset.monthly || proAmountEl.textContent);
      proAmountEl.setAttribute('data-monthly', offer.proMonthlyDisplay);
      proAmountEl.textContent = offer.proMonthlyDisplay;
    }
    if (proNoteEl && offer.proMonthlyNote) {
      proNoteEl.setAttribute('data-original-text', proNoteEl.textContent);
      proNoteEl.textContent = offer.proMonthlyNote;
    }
    var popularBadge = document.querySelector('.popular-badge');
    if (popularBadge) {
      popularBadge.textContent = offer.badgeText + ' \u2014 ' + offer.label;
    }
  }

  // ── Conversion tracking ───────────────────────────────────────────────────

  function trackConversion(segment) {
    var store = loadStore();
    store.conversionsBySegment[segment] = (store.conversionsBySegment[segment] || 0) + 1;
    saveStore(store);
    if (window.AIMT_AB) {
      window.AIMT_AB.conversion('dynamic-pricing-engine', 'cta_click:' + segment);
    }
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'pricing_offer_click', {
        event_category: 'dynamic_pricing',
        event_label: segment,
        segment: segment,
      });
    }
  }

  // ── Styles ────────────────────────────────────────────────────────────────

  function injectStyles() {
    var s = document.createElement('style');
    s.id = 'aimt-pe-styles';
    s.textContent = [
      '#aimt-pe-banner{background:linear-gradient(135deg,#0d1f4a 0%,#1a0f3a 100%);border-bottom:1px solid rgba(108,99,255,.35);padding:.85rem 1rem;position:relative;z-index:50;}',
      '#aimt-pe-banner .aimt-pe-inner{display:flex;align-items:center;gap:.75rem;flex-wrap:wrap;max-width:1080px;margin:0 auto;}',
      '.aimt-pe-badge{background:var(--accent,#6c63ff);color:#fff;font-size:.7rem;font-weight:800;letter-spacing:.07em;padding:3px 8px;border-radius:99px;white-space:nowrap;flex-shrink:0;}',
      '.aimt-pe-icon{font-size:1.35rem;flex-shrink:0;}',
      '.aimt-pe-text{flex:1;min-width:180px;}',
      '.aimt-pe-headline{display:block;color:#fff;font-weight:700;font-size:.97rem;margin-bottom:.15rem;}',
      '.aimt-pe-detail{color:rgba(255,255,255,.72);font-size:.85rem;line-height:1.45;}',
      '.aimt-pe-countdown{display:flex;flex-direction:column;align-items:center;gap:.1rem;flex-shrink:0;}',
      '.aimt-pe-countdown-label{color:rgba(255,255,255,.55);font-size:.7rem;text-transform:uppercase;letter-spacing:.07em;}',
      '.aimt-pe-timer{color:#facc15;font-weight:800;font-size:1.15rem;font-variant-numeric:tabular-nums;letter-spacing:.04em;}',
      '.aimt-pe-cta{background:var(--accent,#6c63ff);color:#fff;padding:.55rem 1.2rem;border-radius:var(--radius,8px);font-weight:700;font-size:.9rem;text-decoration:none;white-space:nowrap;flex-shrink:0;transition:opacity .15s;}',
      '.aimt-pe-cta:hover{opacity:.85;}',
      '.aimt-pe-dismiss{background:transparent;border:none;color:rgba(255,255,255,.4);cursor:pointer;font-size:1rem;padding:.25rem .5rem;flex-shrink:0;line-height:1;transition:color .15s;}',
      '.aimt-pe-dismiss:hover{color:rgba(255,255,255,.9);}',
      '@media(max-width:600px){.aimt-pe-text{min-width:100%;order:2;}.aimt-pe-countdown{order:3;}.aimt-pe-cta{order:4;width:100%;text-align:center;}.aimt-pe-dismiss{position:absolute;top:.5rem;right:.5rem;}}',
    ].join('');
    document.head.appendChild(s);
  }

  // ── Public report ─────────────────────────────────────────────────────────

  function getReport() {
    var store = loadStore();
    return {
      currentSegment: store._lastSegment || 'unknown',
      visits: store.visits,
      pricingViews: store.pricingViews,
      conversionsBySegment: store.conversionsBySegment,
      segmentHistory: store.segments,
    };
  }

  // ── Main init ─────────────────────────────────────────────────────────────

  function init() {
    var store   = loadStore();
    var session = loadSession();

    session.pageviews = (session.pageviews || 0) + 1;
    saveSession(session);

    if (!session.counted) {
      store.visits = (store.visits || 0) + 1;
      session.counted = true;
      saveSession(session);
    }

    var isPricingPage = /pricing/i.test(window.location.pathname) ||
                        /pricing\.html/i.test(window.location.href);
    if (isPricingPage) {
      store.pricingViews = (store.pricingViews || 0) + 1;
    }

    var segment = detectSegment(store, session);
    store._lastSegment = segment;
    store.segments[segment] = (store.segments[segment] || 0) + 1;
    saveStore(store);

    if (!isPricingPage) return;

    try {
      if (localStorage.getItem('aimt_pe_dismissed') === '1') {
        try { localStorage.removeItem('aimt_pe_dismissed'); } catch (e) { /* ignore */ }
        return;
      }
    } catch (e) { /* ignore */ }

    var offer = OFFERS[segment];
    if (!offer) return;

    injectBanner(segment, offer);
    updatePriceCards(offer);

    if (window.AIMT_AB) {
      window.AIMT_AB.impression('dynamic-pricing-engine');
    }
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'pricing_offer_shown', {
        event_category: 'dynamic_pricing',
        event_label: segment,
        segment: segment,
      });
    }

    document.querySelectorAll('[data-pe-cta]').forEach(function (ctaEl) {
      ctaEl.addEventListener('click', function () {
        trackConversion(segment);
      });
    });
  }

  // ── Bootstrap ─────────────────────────────────────────────────────────────

  injectStyles();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.AIMT_PRICING = {
    getReport: getReport,
    OFFERS: OFFERS,
    detectSegment: function () {
      return detectSegment(loadStore(), loadSession());
    },
  };

})(window);
