/**
 * AIMasterTools A/B Test Configuration
 *
 * Each test entry defines:
 *   variants      - ordered list; first is always the control
 *   minConversions - minimum total conversions before significance check fires
 *   significance  - required confidence level (default 0.95 = 95%)
 *   description   - human-readable label shown in the admin dashboard
 *
 * The AIMT_AB_CONFIG object is optional but allows configuring a server-side
 * analytics endpoint for cross-device aggregation.
 *
 * Usage on a page:
 *   1. Include ab-testing.js and ab-config.js before </body>
 *   2. Call AIMT_AB.assign('test-id', AIMT_AB_TESTS['test-id'].variants)
 *   3. Apply the variant (swap headline, etc.)
 *   4. Call AIMT_AB.impression('test-id')
 *   5. On conversion event: AIMT_AB.conversion('test-id', 'email_signup')
 */

window.AIMT_AB_CONFIG = {
  // Optional: POST click + conversion events to a server endpoint.
  // Set to null/undefined to disable (localStorage only).
  analyticsEndpoint: null
};

window.AIMT_AB_TESTS = {

  // ── Crypto Signals landing page ──────────────────────────────────────────
  'crypto-hero-headline': {
    description: 'Crypto Signals – Hero Headline',
    page: '/crypto-signals/',
    conversionGoal: 'email_signup',
    variants: ['control', 'variant-b'],
    variantContent: {
      'control': {
        headline: 'Let AI Detect\nCrypto Arbitrage\nBefore You Blink',
        headlineHTML: 'Let AI Detect<br/><span class="highlight">Crypto Arbitrage</span><br/>Before You Blink'
      },
      'variant-b': {
        headline: 'Stop Losing to Bots — Your AI Edge for Crypto Markets',
        headlineHTML: 'Stop Losing to Bots —<br/><span class="highlight">Your AI Edge</span><br/>for Crypto Markets'
      }
    },
    minConversions: 20,
    significance: 0.95
  },

  // ── Pricing / Services page ──────────────────────────────────────────────
  'pricing-hero-headline': {
    description: 'Pricing – Hero Headline',
    page: '/pricing.html',
    conversionGoal: 'cta_click',
    variants: ['control', 'variant-b'],
    variantContent: {
      'control': {
        headline: 'Simple, Transparent Pricing',
        sub: 'Start free. Upgrade when the signals start paying.'
      },
      'variant-b': {
        headline: 'Join 1,000+ Traders Getting AI Crypto Signals',
        sub: 'First month free on Pro. Cancel anytime. No exchange API keys required.'
      }
    },
    minConversions: 20,
    significance: 0.95
  },

  // ── AI Prompt Library / Prompt Marketplace ────────────────────────────────
  'prompts-hero-headline': {
    description: 'Prompt Library – Hero Headline',
    page: '/ai-prompt-library.html',
    conversionGoal: 'email_signup',
    variants: ['control', 'variant-b'],
    variantContent: {
      'control': {
        headline: 'Free AI Prompt Library',
        sub: 'Browse 150+ hand-curated prompts for ChatGPT, Claude, Midjourney, and more.'
      },
      'variant-b': {
        headline: 'Steal 150+ AI Prompts That Actually Work',
        sub: 'Copy-paste prompts used by 10,000+ creators, coders, and marketers. Free to browse.'
      }
    },
    minConversions: 20,
    significance: 0.95
  }
};
