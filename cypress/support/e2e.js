// ***********************************************************
// This support/e2e.js is loaded automatically before test files.
// ***********************************************************

import '@applitools/eyes-cypress/commands'

import './commands'

// Suppress uncaught exceptions from the app under test.
// The leading underscores tell ESLint these params are intentionally unused
// (standard Cypress pattern — we return false regardless of the error).
Cypress.on('uncaught:exception', (_err, _runnable) => {
  return false;
});
