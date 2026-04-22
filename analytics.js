// AIMasterTools Analytics — GA4 + local API dual tracking
// GA4 Measurement ID: replace G-XXXXXXXXXX once you create the property at analytics.google.com
// To deploy with real ID: sed -i "s/G-XXXXXXXXXX/G-YOUR_REAL_ID/g" /var/www/aimastertools.com/analytics.js
(function () {
  var GA4_ID = 'G-XXXXXXXXXX';
  var GA4_READY = GA4_ID !== 'G-XXXXXXXXXX';

  // ── Load GA4 gtag.js ──────────────────────────────────────────────────────
  if (GA4_READY) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
    document.head.appendChild(s);
  }
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  if (GA4_READY) {
    gtag('js', new Date());
    gtag('config', GA4_ID, {
      send_page_view: true,
      cookie_flags: 'SameSite=None;Secure'
    });
  }

  // ── Helper: send to local API ─────────────────────────────────────────────
  function sendLocal(event, props) {
    try {
      navigator.sendBeacon('/api/track', JSON.stringify({
        event: event,
        page: location.pathname,
        props: Object.assign({ referrer: document.referrer || '', title: document.title }, props || {})
      }));
    } catch (e) {}
  }

  // ── Helper: send to GA4 ───────────────────────────────────────────────────
  function sendGA4(eventName, params) {
    if (GA4_READY && typeof gtag === 'function') {
      gtag('event', eventName, params || {});
    }
  }

  // ── Page view ─────────────────────────────────────────────────────────────
  // GA4 sends page_view automatically via config above.
  // Local API needs explicit call.
  sendLocal('pageview');

  // Enhanced page_view for high-value pages
  var path = location.pathname;
  var isPricing = path.includes('/pricing');
  var isCryptoSignals = path.includes('/crypto-signals');
  if (isPricing || isCryptoSignals) {
    var pageCategory = isPricing ? 'pricing' : 'crypto_signals';
    sendGA4('page_view', {
      page_title: document.title,
      page_location: location.href,
      page_category: pageCategory
    });
  }

  // ── Button & link click tracking ──────────────────────────────────────────
  document.addEventListener('click', function (e) {
    var el = e.target.closest('a[href], button');
    if (!el) return;
    var href = el.getAttribute('href') || '';
    var text = (el.innerText || el.textContent || '').trim().slice(0, 80);
    var tag = el.tagName.toLowerCase();

    // Fire generic button_click conversion for buttons and CTAs
    if (tag === 'button' || el.classList.contains('btn') || el.classList.contains('cta')) {
      sendLocal('button_click', { text: text, href: href });
      sendGA4('button_click', {
        button_text: text,
        button_href: href,
        page_path: path
      });
    }

    if (href.includes('pricing') || href.includes('/crypto-signals')) {
      sendLocal('pricing_click', { text: text, href: href });
      sendGA4('select_item', {
        item_list_name: 'pricing_page',
        items: [{ item_name: text, item_category: 'pricing' }]
      });
    } else if (href.includes('signup') || href.includes('subscribe') ||
               text.toLowerCase().includes('sign up') || text.toLowerCase().includes('get started') ||
               text.toLowerCase().includes('start free')) {
      sendLocal('signup_click', { text: text, href: href });
      sendGA4('begin_checkout', { item_name: text });
    } else if (href.includes('affiliate') || href.includes('ref=')) {
      sendLocal('affiliate_click', { text: text, href: href });
      sendGA4('click', { link_text: text, link_url: href, outbound: true, event_category: 'affiliate' });
    } else if (href.includes('gumroad') || href.includes('buy')) {
      sendLocal('purchase_intent', { text: text, href: href });
      sendGA4('begin_checkout', { item_name: text, event_category: 'purchase_intent' });
    }
  }, true);

  // ── Form submission tracking ──────────────────────────────────────────────
  document.addEventListener('submit', function (e) {
    var form = e.target;
    var action = form.getAttribute('action') || '';
    var formId = form.id || form.getAttribute('name') || 'unknown';
    if (action.includes('subscribe') || action.includes('email') || form.querySelector('[type=email]')) {
      sendLocal('email_signup', { form_action: action });
      sendGA4('form_submit', {
        form_id: formId,
        form_action: action,
        event_category: 'lead_generation',
        event_label: isPricing ? 'pricing_page' : isCryptoSignals ? 'crypto_signals_page' : 'other'
      });
      sendGA4('generate_lead', {
        currency: 'USD',
        event_category: 'email_signup'
      });
    }
  }, true);

  // ── Pricing plan CTA: mark as conversion ─────────────────────────────────
  if (isPricing) {
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-plan], .cta-btn, .btn-primary');
      if (!el) return;
      var plan = el.getAttribute('data-plan') || el.closest('[data-plan]') && el.closest('[data-plan]').getAttribute('data-plan') || 'unknown';
      var text = (el.innerText || '').trim().slice(0, 60);
      sendGA4('add_to_cart', {
        currency: 'USD',
        items: [{ item_name: plan, item_category: 'subscription' }],
        event_label: text
      });
      sendGA4('conversion', { send_to: GA4_ID, event_category: 'pricing_cta', plan: plan });
    }, true);
  }
})();
