/**
 * ============================================================
 *  LIGHTHOUSE CI CONFIG  —  lighthouserc.js
 * ============================================================
 *
 *  CONCEPT — What is Performance Testing with Lighthouse CI?
 *  ----------------------------------------------------------
 *  Lighthouse is Google's open-source tool that audits pages
 *  for Performance, Accessibility, Best Practices, and SEO.
 *
 *  Lighthouse CI (LHCI) runs it automatically in your pipeline
 *  and FAILS the build if scores drop below your thresholds.
 *  This is "performance as a quality gate" — the same principle
 *  you'll apply to client projects at Deloitte.
 *
 *  The 5 Lighthouse categories:
 *    🚀 Performance    — load speed, Core Web Vitals (LCP, FID, CLS)
 *    ♿ Accessibility   — WCAG compliance, ARIA, contrast ratios
 *    ✅ Best Practices — HTTPS, no console errors, modern APIs
 *    🔍 SEO            — meta tags, crawlability, mobile-friendly
 *    📱 PWA            — installability, offline support
 *
 *  Key metrics to know for interviews:
 *    LCP (Largest Contentful Paint) — how fast main content loads  < 2.5s = good
 *    FID (First Input Delay)        — how fast UI responds         < 100ms = good
 *    CLS (Cumulative Layout Shift)  — visual stability             < 0.1 = good
 *
 * ============================================================
 */

module.exports = {
  ci: {

    // ── What to test ────────────────────────────────────────
    collect: {
      // Run Lighthouse 3 times per URL and take the median
      // (reduces variance from network/CPU fluctuation)
      numberOfRuns: 3,

      url: [
        // Test your most important pages
        'https://d2kmkdebgfkxyh.cloudfront.net/',
        'https://d2kmkdebgfkxyh.cloudfront.net/assets/html/jobs.html',
        'https://d2kmkdebgfkxyh.cloudfront.net/assets/html/certifications.html',
        'https://d2kmkdebgfkxyh.cloudfront.net/assets/html/sdet.html',
      ],

      // Simulate a mid-range mobile device on 4G (realistic user conditions)
      settings: {
        preset: 'desktop',          // switch to 'perf' for mobile throttling
        chromeFlags: '--no-sandbox', // required in GitHub Actions (no display)
      },
    },

    // ── Quality gates (build fails if scores drop below these) ──
    assert: {
      preset: 'lighthouse:no-pwa', // skip PWA checks (not a PWA)

      assertions: {
        // Performance — your CloudFront + S3 setup should score well
        'categories:performance':     ['warn',  { minScore: 0.80 }], // warn at 80
        'categories:accessibility':   ['error', { minScore: 0.90 }], // fail at 90
        'categories:best-practices':  ['error', { minScore: 0.90 }], // fail at 90
        'categories:seo':             ['warn',  { minScore: 0.80 }], // warn at 80

        // Core Web Vitals — Google's user experience signals
        'largest-contentful-paint':   ['warn',  { maxNumericValue: 3000 }], // < 3s
        'cumulative-layout-shift':    ['error', { maxNumericValue: 0.15 }], // < 0.15
        'total-blocking-time':        ['warn',  { maxNumericValue: 500 }],  // < 500ms

        // Specific checks valuable for a QA portfolio
        'uses-https':                 ['error', { minScore: 1 }], // must be HTTPS
        'errors-in-console':          ['warn',  { maxLength: 0 }], // no JS errors
        'image-alt':                  ['error', { minScore: 1 }], // all imgs have alt
      },
    },

    // ── Where to store reports ───────────────────────────────
    upload: {
      // 'temporary-public-storage' uploads to Google's LHCI server
      // Free, reports expire after 30 days, shareable URL returned
      target: 'temporary-public-storage',

      // Alternatively, self-host:
      // target: 'lhci',
      // serverBaseUrl: 'https://your-lhci-server.com',
      // token: process.env.LHCI_TOKEN,
    },
  },
};
