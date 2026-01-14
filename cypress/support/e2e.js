// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
import './commands'

Cypress.on('uncaught:exception', (err, runnable) => {
   return false;
});