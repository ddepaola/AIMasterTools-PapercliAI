/**
 * AIMasterTools PWA Bootstrap
 * - Registers service worker
 * - Handles install prompt (A2HS)
 * - Manages push notification subscription
 */

(function () {
  'use strict';

  // ─── Service Worker Registration ────────────────────────────────────────────

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          // Check for updates every hour
          setInterval(() => reg.update(), 60 * 60 * 1000);
        })
        .catch((err) => console.warn('[PWA] SW registration failed:', err));
    });
  }

  // ─── Install Prompt (A2HS) ───────────────────────────────────────────────────

  let deferredPrompt = null;
  const INSTALL_DISMISSED_KEY = 'aimastertools-install-dismissed';
  const INSTALL_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    const dismissed = localStorage.getItem(INSTALL_DISMISSED_KEY);
    if (dismissed && Date.now() - parseInt(dismissed, 10) < INSTALL_COOLDOWN_MS) return;

    // Only show on mobile/tablet
    if (window.innerWidth > 1024) return;

    showInstallBanner();
  });

  function createBannerBase(id) {
    const banner = document.createElement('div');
    banner.id = id;
    banner.setAttribute('role', 'banner');

    const inner = document.createElement('div');
    inner.className = 'pwa-banner-inner';
    banner.appendChild(inner);
    return { banner, inner };
  }

  function createBannerText(strong, span) {
    const wrap = document.createElement('div');
    wrap.className = 'pwa-banner-text';
    const s = document.createElement('strong');
    s.textContent = strong;
    const p = document.createElement('span');
    p.textContent = span;
    wrap.appendChild(s);
    wrap.appendChild(p);
    return wrap;
  }

  function createActionBtn(label, text, className) {
    const btn = document.createElement('button');
    btn.className = className;
    btn.setAttribute('aria-label', label);
    btn.textContent = text;
    return btn;
  }

  function showInstallBanner() {
    if (document.getElementById('pwa-install-banner')) return;

    const { banner, inner } = createBannerBase('pwa-install-banner');

    const icon = document.createElement('img');
    icon.src = '/icons/icon-72x72.png';
    icon.alt = 'AIMasterTools icon';
    icon.className = 'pwa-banner-icon';

    const text = createBannerText(
      'Add to Home Screen',
      'Get faster access to AI reviews & crypto signals'
    );

    const installBtn = createActionBtn('Install AIMasterTools app', 'Install', 'pwa-banner-install');
    const closeBtn = createActionBtn('Dismiss install banner', '\u00d7', 'pwa-banner-close');

    inner.appendChild(icon);
    inner.appendChild(text);
    inner.appendChild(installBtn);
    inner.appendChild(closeBtn);

    installBtn.addEventListener('click', () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
          trackEvent('pwa_install_accepted');
        } else {
          localStorage.setItem(INSTALL_DISMISSED_KEY, Date.now().toString());
        }
        deferredPrompt = null;
        banner.remove();
      });
    });

    closeBtn.addEventListener('click', () => {
      localStorage.setItem(INSTALL_DISMISSED_KEY, Date.now().toString());
      banner.remove();
    });

    document.body.appendChild(banner);

    // Auto-dismiss after 15 seconds
    setTimeout(() => banner.remove(), 15000);
  }

  window.addEventListener('appinstalled', () => {
    trackEvent('pwa_installed');
    const banner = document.getElementById('pwa-install-banner');
    if (banner) banner.remove();
  });

  // ─── Push Notifications ──────────────────────────────────────────────────────

  // VAPID public key — replace with your push server's real key
  const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
  }

  async function subscribeToPush() {
    if (!('PushManager' in window) || !('serviceWorker' in navigator)) return null;

    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();

    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    return sub;
  }

  async function requestNotificationPermission() {
    if (!('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    return Notification.requestPermission();
  }

  // Exposed for opt-in buttons on the page
  window.AIMasterToolsPWA = {
    async enableNotifications() {
      const permission = await requestNotificationPermission();
      if (permission !== 'granted') return { success: false, reason: permission };

      try {
        const subscription = await subscribeToPush();
        if (!subscription) return { success: false, reason: 'no_subscription' };

        await fetch('/api/push-subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription,
            preferences: { newPosts: true, cryptoSignals: true, weeklyDigest: true },
          }),
        }).catch(() => null);

        localStorage.setItem('aimastertools-push-enabled', '1');
        trackEvent('push_notifications_enabled');
        return { success: true };
      } catch (err) {
        console.warn('[PWA] Push subscription failed:', err);
        return { success: false, reason: 'error' };
      }
    },

    async disableNotifications() {
      if (!('serviceWorker' in navigator)) return;
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        localStorage.removeItem('aimastertools-push-enabled');
        trackEvent('push_notifications_disabled');
      }
    },

    get notificationsEnabled() {
      return (
        Notification.permission === 'granted' &&
        localStorage.getItem('aimastertools-push-enabled') === '1'
      );
    },
  };

  function maybeShowNotificationPrompt() {
    const NOTIF_KEY = 'aimastertools-notif-prompt-seen';
    if (localStorage.getItem(NOTIF_KEY)) return;
    if (!('Notification' in window) || Notification.permission !== 'default') return;

    setTimeout(() => {
      if (document.getElementById('pwa-notif-banner')) return;

      const { banner, inner } = createBannerBase('pwa-notif-banner');

      const emoji = document.createElement('span');
      emoji.className = 'pwa-banner-emoji';
      emoji.textContent = '\uD83D\uDD14';

      const text = createBannerText(
        'Stay ahead of the market',
        'Get notified about new AI reviews & crypto signals'
      );

      const enableBtn = createActionBtn('Enable notifications', 'Enable', 'pwa-banner-install pwa-notif-allow');
      const dismissBtn = createActionBtn('Dismiss notification prompt', '\u00d7', 'pwa-banner-close pwa-notif-dismiss');

      inner.appendChild(emoji);
      inner.appendChild(text);
      inner.appendChild(enableBtn);
      inner.appendChild(dismissBtn);

      enableBtn.addEventListener('click', async () => {
        localStorage.setItem(NOTIF_KEY, '1');
        const result = await window.AIMasterToolsPWA.enableNotifications();
        banner.remove();
        if (result.success) showToast('Notifications enabled!');
      });

      dismissBtn.addEventListener('click', () => {
        localStorage.setItem(NOTIF_KEY, '1');
        banner.remove();
      });

      document.body.appendChild(banner);
      localStorage.setItem(NOTIF_KEY, '1');
    }, 30000);
  }

  // ─── Toast Utility ──────────────────────────────────────────────────────────

  function showToast(message, durationMs = 3000) {
    const existing = document.getElementById('pwa-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'pwa-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('pwa-toast-visible');
      setTimeout(() => {
        toast.classList.remove('pwa-toast-visible');
        setTimeout(() => toast.remove(), 300);
      }, durationMs);
    });
  }

  // ─── Analytics helper ───────────────────────────────────────────────────────

  function trackEvent(name, params) {
    if (typeof gtag === 'function') {
      gtag('event', name, params || {});
    }
  }

  // ─── Init ────────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', () => {
    maybeShowNotificationPrompt();
  });
})();
