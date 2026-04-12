const { defineConfig } = require('cypress');

// Cypress requires this file at the project root.
// Do NOT move it — Cypress v15 auto-discovers cypress.config.js from root only.
module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    setupNodeEvents(on, config) {},
  },
});


require('@applitools/eyes-cypress')(module);
