const { defineConfig } = require("cypress");

// 1. Wrap the entire export in the Applitools function
module.exports = require('@applitools/eyes-cypress')(defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    setupNodeEvents(on, config) {
      // 2. This is where Applitools hooks into the test lifecycle
      // implement node event listeners here
    },
  },
}));
