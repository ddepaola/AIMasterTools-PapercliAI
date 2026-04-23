# Retargeting Setup Guide — AIMasterTools

Pixel infrastructure is installed and collecting audience data in **silent mode**.
The pixels fire their tracking events but are initialized with placeholder IDs, so no data
reaches Meta or Google Ads until you replace the placeholders with real IDs.

This design means you can create your ad accounts at any point and immediately have
30+ days of historical audience data already collected when you're ready to run campaigns.

---

## What Is Installed

| Platform     | Status       | Event coverage                                      |
|--------------|--------------|-----------------------------------------------------|
| Meta Pixel   | PLACEHOLDER  | PageView, Lead, InitiateCheckout, Purchase          |
| Google Ads   | PLACEHOLDER  | Config, Lead conversion, Checkout conversion, Purchase conversion |
| GA4          | ✅ LIVE      | All events (already active, no action needed)       |

All pixel code lives in `/analytics.js` — loaded on every page.

---

## Step 1: Create a Meta (Facebook/Instagram) Ad Account

1. Go to [business.facebook.com](https://business.facebook.com) → **Pixels** → Create Pixel
2. Name it "AIMasterTools" — linked to aimastertools.com
3. Copy your **Pixel ID** (a 15–16 digit number, e.g. `123456789012345`)
4. Skip the "Install with partner" step — the pixel code is already installed

---

## Step 2: Activate the Meta Pixel

SSH into the VPS and update `analytics.js`:

```bash
ssh root@168.231.67.244
cd /var/www/aimastertools.com
```

Edit `analytics.js` — find this line near the top:

```js
var META_PIXEL_ID = window.META_PIXEL_ID || 'PLACEHOLDER_META_PIXEL_ID';
```

Replace it with your real pixel ID:

```js
var META_PIXEL_ID = window.META_PIXEL_ID || '123456789012345';
```

Also update the `META_READY` flag line so it evaluates correctly if you keep a custom placeholder:

```js
var META_READY = META_PIXEL_ID !== 'PLACEHOLDER_META_PIXEL_ID';
```

Then commit and push:

```bash
git add analytics.js
git commit -m "feat: activate Meta Pixel 123456789012345"
git push
```

**Verify:** Open [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/) in Chrome, visit https://aimastertools.com — you should see PageView firing.

---

## Step 3: Create a Google Ads Account and Conversion Actions

1. Go to [ads.google.com](https://ads.google.com) → Create account → link to aimastertools.com
2. Navigate to **Tools → Conversions → New conversion action → Website**
3. Create three conversion actions:

   | Conversion Name           | Category       | Value  |
   |---------------------------|----------------|--------|
   | Email Lead Signup         | Lead           | —      |
   | Crypto Signals Checkout   | Begin checkout | —      |
   | Subscription Purchase     | Purchase       | Dynamic|

4. For each action, Google Ads gives you a **Conversion Label** (e.g. `AbCdEfGhIjKlMnOp`).
   Also copy your **Google Ads Conversion ID** (format: `AW-1234567890`).

---

## Step 4: Activate Google Ads Tags

Edit `analytics.js` on the VPS:

```bash
ssh root@168.231.67.244
cd /var/www/aimastertools.com
```

Replace the Google Ads placeholder ID near the top:

```js
// Before:
var GOOGLE_ADS_ID = window.GOOGLE_ADS_ID || 'AW-PLACEHOLDER_GOOGLE_ADS_ID';

// After (your real ID):
var GOOGLE_ADS_ID = window.GOOGLE_ADS_ID || 'AW-1234567890';
```

Also update the three conversion labels — search `analytics.js` for these strings and replace:

| Placeholder string    | Replace with your label       |
|-----------------------|-------------------------------|
| `'LEAD_LABEL'`        | `'AbCdEfGhIjKlMnOp'`         |
| `'CHECKOUT_LABEL'`    | `'XyZAbCdEfGhIjKl'`          |
| `'PURCHASE_LABEL'`    | `'MnOpQrStUvWxYz0'`          |

Commit and deploy:

```bash
git add analytics.js
git commit -m "feat: activate Google Ads AW-1234567890 with conversion labels"
git push
```

---

## Step 5: PayPal Purchase Confirmation Tracking

When the live PayPal subscription is wired up, configure the PayPal **Return URL** after a
successful subscription to include these query parameters:

```
https://aimastertools.com/crypto-signals/?subscription=success&value=29&currency=USD&txn=PAYPAL_TXNID
```

The `analytics.js` already detects `?subscription=success` and fires:
- GA4 `purchase` event
- Meta `Purchase` event
- Google Ads purchase conversion

Replace `29` with the actual plan price. The `txn` param is optional (used for dedup).

---

## Events Fired By Page

| Page                        | Events fired                                                   |
|-----------------------------|----------------------------------------------------------------|
| All pages                   | PageView (Meta), GA4 page_view, local pageview                 |
| Any email form submit        | Lead (Meta), GA4 generate_lead, Google Ads LEAD_LABEL          |
| /crypto-signals CTA click   | InitiateCheckout (Meta), GA4 begin_checkout, Google Ads CHECKOUT_LABEL |
| /pricing CTA click           | InitiateCheckout (Meta), GA4 add_to_cart                       |
| ?subscription=success URL   | Purchase (Meta), GA4 purchase, Google Ads PURCHASE_LABEL       |

---

## Verification Tools

- **Meta Pixel Helper** (Chrome extension) — shows events firing in real time
- **Google Tag Assistant** (Chrome extension) — shows gtag events
- **Meta Events Manager** — [business.facebook.com/events_manager](https://business.facebook.com/events_manager) — shows pixel activity
- **Google Ads → Conversions** — shows conversion recording status (takes 24h after activation)

---

## Audience Building (Do This Immediately After Activation)

In **Meta Ads Manager → Audiences → Create Audience → Website**:
- "All website visitors" — last 180 days
- "Visited /crypto-signals" — last 60 days (hot retargeting pool)
- "Email form submitters" — based on Lead event, last 30 days

In **Google Ads → Tools → Audience Manager → Website visitors**:
- "All visitors" — 180 days
- "Crypto signals page" — URL contains /crypto-signals, 60 days

The longer these run before you launch campaigns, the larger the warm audience.
