/**
 * AIMasterTools Referral Program — Shared Tracking Library
 * Include this script on any page where you want to:
 *   1. Capture incoming ?ref= params and store them
 *   2. Display "Share with a friend" CTA widgets
 *   3. Fire referral conversion events to analytics
 *
 * Usage: <script src="/campaigns/referral-program/referral.js"></script>
 *
 * To render a share widget, add this attribute to any element:
 *   <div data-aim-share></div>
 *   <div data-aim-share="compact"></div>
 */

(function (window) {
  'use strict';

  var STORAGE_KEY_CODE     = 'aim_ref_code';
  var STORAGE_KEY_REFERRED = 'aim_referred_by';
  var BASE_SITE_URL        = 'https://aimastertools.com';
  var REFER_PAGE           = BASE_SITE_URL + '/refer.html';

  /* ── Helpers ── */
  function getOrCreateMyCode() {
    var code = localStorage.getItem(STORAGE_KEY_CODE);
    if (!code) {
      code = 'AMT' + Math.random().toString(36).substr(2, 8).toUpperCase();
      localStorage.setItem(STORAGE_KEY_CODE, code);
    }
    return code;
  }

  function captureIncomingRef() {
    var params = new URLSearchParams(window.location.search);
    var ref = params.get('ref');
    if (ref) {
      // Sanitize: only allow alphanumeric + hyphens, max 32 chars
      ref = ref.replace(/[^a-zA-Z0-9\-]/g, '').substring(0, 32);
      if (ref) {
        localStorage.setItem(STORAGE_KEY_REFERRED, ref);
        fireAnalyticsEvent('referral_landed', { ref_code: ref });
      }
    }
    return ref;
  }

  function fireAnalyticsEvent(name, props) {
    props = props || {};
    // GA4
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, props);
    }
    // Plausible
    if (typeof window.plausible === 'function') {
      var label = name.replace(/_/g, ' ').replace(/\b\w/g, function(c){ return c.toUpperCase(); });
      window.plausible(label, { props: props });
    }
    // Matomo
    if (window._paq) {
      window._paq.push(['trackEvent', 'Referral', name, JSON.stringify(props)]);
    }
    // Umami
    if (typeof window.umami === 'object' && window.umami && window.umami.track) {
      window.umami.track(name, props);
    }
  }

  /* ── Track referral conversion (call when user signs up or completes a goal) ── */
  function trackConversion(userId) {
    var referredBy = localStorage.getItem(STORAGE_KEY_REFERRED);
    var myCode     = getOrCreateMyCode();
    fireAnalyticsEvent('referral_converted', {
      ref_code:  referredBy || 'direct',
      user_code: myCode,
      user_id:   userId || 'anonymous'
    });
    return referredBy;
  }

  /* ── Build a referral URL for the current user ── */
  function getMyReferralUrl() {
    return BASE_SITE_URL + '/?ref=' + encodeURIComponent(getOrCreateMyCode());
  }

  /* ── Create a DOM element with styles applied ── */
  function el(tag, styles, attrs) {
    var node = document.createElement(tag);
    if (styles) Object.assign(node.style, styles);
    if (attrs) {
      Object.keys(attrs).forEach(function(k) {
        if (k === 'textContent') {
          node.textContent = attrs[k];
        } else {
          node.setAttribute(k, attrs[k]);
        }
      });
    }
    return node;
  }

  /* ── Inject a Share CTA widget into any element ── */
  function injectShareCTA(targetEl, options) {
    if (!targetEl) return;
    options = options || {};
    var refUrl  = getMyReferralUrl();
    var heading = options.heading || 'Share with a Friend — You Both Earn $5';
    var subtext = options.subtext || 'Give your link, get credit when they sign up.';
    var compact = options.compact || false;

    // Build share URLs using encodeURIComponent — never interpolated as HTML
    var tweetText    = 'Just found the best AI tool reviews + crypto signals at @AIMasterTools. Use my link for $5 credit: ' + refUrl;
    var redditTitle  = 'AIMasterTools — best independent AI tool reviews. Referral for $5 credit:';
    var emailSubject = 'Check out AIMasterTools — we both get $5 credit';
    var emailBody    = 'Hey!\n\nI\'ve been using AIMasterTools — great AI tool reviews and a crypto signal scanner.\n\nSign up through my link and we both get $5 credit:\n\n' + refUrl;

    var twitterHref  = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(tweetText);
    var redditHref   = 'https://www.reddit.com/submit?url=' + encodeURIComponent(refUrl) + '&title=' + encodeURIComponent(redditTitle);
    var emailHref    = 'mailto:?subject=' + encodeURIComponent(emailSubject) + '&body=' + encodeURIComponent(emailBody);

    // Build widget with DOM methods
    var widget = el('div', {
      background: '#111827', border: '1px solid #2563eb', borderRadius: '12px',
      padding: compact ? '1rem' : '1.75rem', margin: '1.5rem 0',
      fontFamily: 'system-ui,sans-serif'
    });

    if (!compact) {
      var h3 = el('h3', { margin: '0 0 0.4rem', fontSize: '1.05rem', color: '#e2e8f0' });
      h3.textContent = heading;
      widget.appendChild(h3);

      var p = el('p', { margin: '0 0 1rem', fontSize: '0.88rem', color: '#94a3b8' });
      p.textContent = subtext;
      widget.appendChild(p);
    }

    // Link row
    var row = el('div', { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.75rem' });

    var input = el('input', { flex: '1', minWidth: '0', padding: '0.6rem 0.8rem', background: '#0d1528', border: '1px solid #1e2d45', borderRadius: '8px', color: '#e2e8f0', fontSize: '0.85rem' }, { type: 'text', readonly: '', value: refUrl });
    input.id = 'aim-ref-input-' + Math.random().toString(36).substr(2, 5);

    var copyBtn = el('button', { padding: '0.6rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', whiteSpace: 'nowrap' });
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', function() {
      navigator.clipboard.writeText(refUrl).then(function() {
        copyBtn.textContent = 'Copied!';
        copyBtn.style.background = '#10b981';
        setTimeout(function() { copyBtn.textContent = 'Copy'; copyBtn.style.background = '#2563eb'; }, 2000);
        fireAnalyticsEvent('referral_link_copied');
      });
    });

    row.appendChild(input);
    row.appendChild(copyBtn);
    widget.appendChild(row);

    // Share buttons row
    var btnRow = el('div', { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' });

    function shareLink(href, label, bg, fg) {
      var a = el('a', {
        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
        padding: '0.5rem 0.9rem', background: bg, color: fg,
        borderRadius: '8px', fontSize: '0.82rem', fontWeight: '600',
        textDecoration: 'none'
      }, { href: href, target: '_blank', rel: 'noopener' });
      a.textContent = label;
      return a;
    }

    btnRow.appendChild(shareLink(twitterHref, '𝕏 Post', '#000', '#fff'));
    btnRow.appendChild(shareLink(redditHref, 'Reddit', '#ff4500', '#fff'));

    var emailA = el('a', {
      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
      padding: '0.5rem 0.9rem', background: '#1e2d45', color: '#e2e8f0',
      borderRadius: '8px', fontSize: '0.82rem', fontWeight: '600',
      textDecoration: 'none'
    }, { href: emailHref });
    emailA.textContent = 'Email';
    btnRow.appendChild(emailA);

    var learnA = el('a', {
      display: 'inline-flex', alignItems: 'center',
      padding: '0.5rem 0.9rem', background: 'transparent', color: '#3b82f6',
      border: '1px solid #2563eb', borderRadius: '8px', fontSize: '0.82rem',
      fontWeight: '600', textDecoration: 'none'
    }, { href: REFER_PAGE });
    learnA.textContent = 'Learn more →';
    btnRow.appendChild(learnA);

    widget.appendChild(btnRow);

    // Clear target and append
    while (targetEl.firstChild) targetEl.removeChild(targetEl.firstChild);
    targetEl.appendChild(widget);
  }

  /* ── Auto-inject into any element with data-aim-share attribute ── */
  function autoInject() {
    captureIncomingRef();
    var els = document.querySelectorAll('[data-aim-share]');
    for (var i = 0; i < els.length; i++) {
      var node = els[i];
      injectShareCTA(node, {
        compact: node.getAttribute('data-aim-share') === 'compact',
        heading: node.getAttribute('data-aim-heading') || undefined,
        subtext: node.getAttribute('data-aim-subtext') || undefined
      });
    }
  }

  /* ── Public API ── */
  window.AIMReferral = {
    getMyCode:       getOrCreateMyCode,
    getMyUrl:        getMyReferralUrl,
    captureRef:      captureIncomingRef,
    trackConversion: trackConversion,
    injectShareCTA:  injectShareCTA,
    fireEvent:       fireAnalyticsEvent
  };

  /* Auto-init when DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInject);
  } else {
    autoInject();
  }

})(window);
