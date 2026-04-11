# AIMasterTools Referral Program

Give $5, Get $5 referral mechanics for AIMasterTools.com.

## Files

| File | Purpose |
|------|---------|
| `referral.js` | Shared tracking library — include on any page |
| `social-card.html` | 1200×630 OG card for screenshot → `og-referral.png` |
| `README.md` | This file |

The public-facing referral page is at `/refer.html` (site root).

## How Referral Tracking Works

This is a **client-side, analytics-backed** implementation suitable for a static site.

1. Each visitor gets a unique code (`AMT` + 8 random chars) stored in `localStorage`.
2. When they share their link (`?ref=THEIR_CODE`), the param is captured on landing and stored in the referree's `localStorage`.
3. On conversion (newsletter signup, pricing page CTA), call `AIMReferral.trackConversion()` — it fires an event to GA4 / Plausible / Matomo / Umami.
4. Credits ($5) must be issued manually via your email platform (Listmonk) or a future backend when a conversion event fires.

### Upgrading to server-side tracking

When a backend is available, POST to your API on conversion:

```js
// After signup form submit
var referredBy = AIMReferral.trackConversion(userId);
if (referredBy) {
  fetch('/api/referral-conversion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ referredBy: referredBy, userId: userId })
  });
}
```

## Adding Share CTAs to Existing Pages

### Option A — Auto-inject (zero code)

Add this to any HTML page:

```html
<script src="/campaigns/referral-program/referral.js"></script>

<!-- Place where you want the widget to appear -->
<div data-aim-share></div>

<!-- Compact inline version -->
<div data-aim-share="compact"></div>

<!-- With custom text -->
<div
  data-aim-share
  data-aim-heading="Enjoying our crypto signals?"
  data-aim-subtext="Share with a friend and you both get $5 credit."
></div>
```

### Option B — Manual JS call

```js
AIMReferral.injectShareCTA(document.getElementById('my-cta-slot'), {
  compact: false,
  heading: 'Share AIMasterTools',
  subtext: 'You and your friend both get $5 credit.'
});
```

## Pages Where CTAs Are Added

- [ ] **Crypto Signals dashboard** — add before the footer (compact mode)
- [ ] **Tool review pages** — add after the verdict/rating section
- [ ] **Email sequences** — include referral URL in welcome email and 7-day follow-up (use `?ref=EMAIL_CODE` with user-specific codes generated server-side)
- [ ] **Pricing page** — add below the plan comparison table
- [ ] **Thank-you / confirmation pages** — highest-intent moment for sharing

## Generating `og-referral.png`

```bash
npx playwright screenshot \
  campaigns/referral-program/social-card.html \
  --viewport 1200x630 \
  --output campaigns/referral-program/og-referral.png
```

Or use any headless browser. Upload the PNG to `/campaigns/referral-program/og-referral.png` on the server.

## Analytics Events

| Event | When fired |
|-------|-----------|
| `referral_landed` | Visitor arrives via `?ref=` link |
| `referral_link_copied` | User clicks Copy on the share widget |
| `referral_converted` | `AIMReferral.trackConversion()` is called |

All events fire to GA4, Plausible, Matomo, and Umami if present.
