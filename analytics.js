// AIMasterTools Analytics — GA4 + Meta Pixel + Google Ads retargeting + local API
// GA4 Measurement ID: G-VGLTKQ98V7 (aimastertools.com property, activated 2026-04-22)
// Meta Pixel: PLACEHOLDER — set NEXT_PUBLIC_META_PIXEL_ID env var and redeploy to activate
// Google Ads: PLACEHOLDER — set NEXT_PUBLIC_GOOGLE_ADS_ID env var and redeploy to activate

(function () {
  var GA4_ID = 'G-VGLTKQ98V7';
  var GA4_READY = true; // ID is live

  // ── Retargeting pixel IDs (replace placeholders when ad accounts are ready) ──
  // To activate: set window.META_PIXEL_ID before this script loads, or deploy with real ID below.
  var META_PIXEL_ID = window.META_PIXEL_ID || 'PLACEHOLDER_META_PIXEL_ID';
  var GOOGLE_ADS_ID = window.GOOGLE_ADS_ID || 'AW-PLACEHOLDER_GOOGLE_ADS_ID';
  var META_READY = META_PIXEL_ID !== 'PLACEHOLDER_META_PIXEL_ID';
  var GOOGLE_ADS_READY = GOOGLE_ADS_ID !== 'AW-PLACEHOLDER_GOOGLE_ADS_ID';

  // ── Load GA4 gtag.js (shared with Google Ads) ─────────────────────────────
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
  // Google Ads Global Site Tag — shares the same gtag.js loader as GA4
  if (GOOGLE_ADS_READY) {
    gtag('config', GOOGLE_ADS_ID);
  }

  // ── Load Meta Pixel ───────────────────────────────────────────────────────
  if (META_READY) {
    !function(f,b,e,v,n,t,s){
      if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)
    }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', META_PIXEL_ID);
    fbq('track', 'PageView');
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

  // ── Helper: send Meta Pixel event ─────────────────────────────────────────
  function sendMeta(eventName, params) {
    if (META_READY && typeof fbq === 'function') {
      fbq('track', eventName, params || {});
    }
  }

  // ── Helper: send Google Ads conversion ────────────────────────────────────
  function sendGoogleAdsConversion(conversionLabel, params) {
    if (GOOGLE_ADS_READY && typeof gtag === 'function') {
      gtag('event', 'conversion', Object.assign({ send_to: GOOGLE_ADS_ID + '/' + conversionLabel }, params || {}));
    }
  }

  // ── Page view ─────────────────────────────────────────────────────────────
  // GA4 sends page_view automatically via config above.
  // Meta Pixel PageView sent via fbq('track', 'PageView') during init above.
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

  // ── Purchase detection: PayPal return URL ─────────────────────────────────
  // PayPal returns to aimastertools.com/crypto-signals/?subscription=success
  // This fires when the board wires up the live PayPal subscription flow.
  var searchParams = new URLSearchParams(location.search);
  if (searchParams.get('subscription') === 'success' || searchParams.get('purchase') === 'confirmed') {
    var purchaseValue = parseFloat(searchParams.get('value') || '0') || 0;
    var purchaseCurrency = searchParams.get('currency') || 'USD';
    sendLocal('purchase', { value: purchaseValue, currency: purchaseCurrency });
    sendGA4('purchase', {
      currency: purchaseCurrency,
      value: purchaseValue,
      items: [{ item_name: 'crypto_signals_pro', item_category: 'subscription' }]
    });
    sendMeta('Purchase', { value: purchaseValue, currency: purchaseCurrency });
    // Google Ads: replace 'PURCHASE_LABEL' with real conversion label from Google Ads UI
    sendGoogleAdsConversion('PURCHASE_LABEL', { value: purchaseValue, currency: purchaseCurrency, transaction_id: searchParams.get('txn') || '' });
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

    // ── InitiateCheckout: crypto-signals checkout CTAs ───────────────────────
    // Fires on any CTA that leads toward the subscription flow on /crypto-signals
    if (isCryptoSignals) {
      var isCheckoutCTA = (
        el.classList.contains('btn-pricing-primary') ||
        el.classList.contains('btn-primary') ||
        el.classList.contains('email-submit') ||
        href.includes('paypal') ||
        href.includes('checkout') ||
        href.includes('subscribe') ||
        text.toLowerCase().includes('get pro') ||
        text.toLowerCase().includes('start pro') ||
        text.toLowerCase().includes('upgrade') ||
        text.toLowerCase().includes('get early access') ||
        text.toLowerCase().includes('join')
      );
      if (isCheckoutCTA) {
        sendLocal('initiate_checkout', { text: text, href: href });
        sendGA4('begin_checkout', {
          currency: 'USD',
          items: [{ item_name: 'crypto_signals_pro', item_category: 'subscription' }],
          button_text: text
        });
        sendMeta('InitiateCheckout', {
          content_name: 'crypto_signals_pro',
          content_category: 'subscription',
          currency: 'USD'
        });
        // Google Ads: replace 'CHECKOUT_LABEL' with real conversion label from Google Ads UI
        sendGoogleAdsConversion('CHECKOUT_LABEL');
      }
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
      // Meta Pixel Lead event — fires on any email capture form across the site
      sendMeta('Lead', {
        content_name: isCryptoSignals ? 'crypto_signals_early_access' : isPricing ? 'pricing_lead' : 'email_capture',
        content_category: 'lead_generation'
      });
      // Google Ads: replace 'LEAD_LABEL' with real conversion label from Google Ads UI
      sendGoogleAdsConversion('LEAD_LABEL');
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
      sendMeta('InitiateCheckout', {
        content_name: plan,
        content_category: 'subscription',
        currency: 'USD'
      });
    }, true);
  }
})();
