// 1. MUST BE FIRST: Load .env before anything else runs
require('dotenv').config();

const { defineConfig } = require('cypress');

// 2. Wrap the entire config once with the Applitools plugin
module.exports = require('@applitools/eyes-cypress')(defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',

    // ── Multi-reporter setup ──────────────────────────────────────────────
    // cypress-multi-reporters lets us run two reporters simultaneously:
    //   - spec:        human-readable output in the CI log (default Cypress reporter)
    //   - mochawesome: JSON output consumed by the Flaky Test Detector agent
    reporter: 'cypress-multi-reporters',
    reporterOptions: {
      reporterEnabled: 'spec, mochawesome',
      mochawesomeReporterOptions: {
        reportDir: 'cypress/results',
        overwrite: false,   // keep one file per spec so merge works correctly
        html: false,        // JSON only — keeps artifact size small
        json: true,
      },
    },

    setupNodeEvents(on, config) {
      // 3. Bridge the .env key to the Cypress environment
      config.env.APPLITOOLS_API_KEY = process.env.APPLITOOLS_API_KEY;

      return config;
    },
  },
}));