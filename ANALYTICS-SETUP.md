# Analytics Setup Guide — AIMasterTools

## Step 1: Create GA4 Property (requires Google Account)

1. Go to https://analytics.google.com
2. Admin → Create → Property
3. Property name: "AIMasterTools"
4. Timezone: US Eastern, Currency: USD
5. Business category: Computers and Electronics
6. Create Web data stream:
   - URL: https://aimastertools.com
   - Stream name: AIMasterTools Main Site
7. Copy the **Measurement ID** (format: G-XXXXXXXXXX)

## Step 2: Deploy Measurement ID

```bash
ssh root@168.231.67.244
cd /var/www/aimastertools.com
./ga4-deploy.sh G-YOUR_MEASUREMENT_ID
git add analytics.js
git commit -m "feat: activate GA4 measurement ID"
git push
```

## Step 3: Google Search Console

1. Go to https://search.google.com/search-console
2. Add property → URL prefix → https://aimastertools.com
3. Verification method: **HTML file**
4. Download the verification file (e.g. `googleABCDEF123456.html`)
5. Upload to VPS:
   ```bash
   scp googleABCDEF123456.html root@168.231.67.244:/var/www/aimastertools.com/
   ```
6. Click Verify in Search Console
7. Submit sitemap: https://aimastertools.com/sitemap.xml

## Step 4: Configure GA4 Conversion Events

After property creation, in GA4 Admin:
1. Events → Mark these as Conversions:
   - `button_click` (buttons on pricing/crypto-signals pages)
   - `form_submit` (email signups)
   - `generate_lead` (email list signups)
   - `begin_checkout` (plan selection CTAs)
2. Set up Audience: "Pricing page visitors" (users who visited /pricing*)
3. Set up Audience: "Crypto signals visitors" (users who visited /crypto-signals*)

## Step 5: GA4 Dashboard Setup

In GA4, Reports → Library → Create new collection:
- Sessions (Acquisition > Overview)
- Top pages (Engagement > Pages and screens)
- Traffic sources (Acquisition > Traffic acquisition)
- Conversions (Engagement > Conversions)

Or use Looker Studio:
1. Go to https://lookerstudio.google.com
2. Create report → Add data → Google Analytics 4
3. Connect AIMasterTools property
4. Add charts: Sessions by source, Top pages, Conversion rate

## Tracking Already Implemented

The site analytics.js fires these GA4 events when measurement ID is set:
- `page_view` — all pages; enhanced on /pricing and /crypto-signals
- `button_click` — all buttons/CTAs
- `form_submit` — form submissions with email fields
- `generate_lead` — email signups
- `begin_checkout` — sign-up CTAs and plan selection
- `add_to_cart` — plan selection on pricing page
- `select_item` — pricing link clicks
- `click` — affiliate link outbound clicks

## Sitemap

Already live at: https://aimastertools.com/sitemap.xml
Submit this URL in Search Console after verification.
