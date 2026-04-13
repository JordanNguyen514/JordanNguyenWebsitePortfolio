// 1. MUST BE FIRST: Load .env before anything else runs
require('dotenv').config();

const { defineConfig } = require('cypress');

// 2. Wrap the entire config once with the Applitools plugin
module.exports = require('@applitools/eyes-cypress')(defineConfig({
  e2e: {
    // Consolidated your settings here
    baseUrl: 'http://localhost:8080',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    
    setupNodeEvents(on, config) {
      // 3. Bridge the .env key to the Cypress environment
      config.env.APPLITOOLS_API_KEY = process.env.APPLITOOLS_API_KEY;
      
      return config;
    },
  },
}));
