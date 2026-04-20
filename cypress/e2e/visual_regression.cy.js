/**
 * ============================================================
 *  VISUAL REGRESSION — APPLITOOLS EYES
 *  cypress/e2e/visual_regression.cy.js
 * ============================================================
 *
 *  PREREQUISITES (run once in your terminal):
 *    npm install @applitools/eyes-cypress dotenv --save-dev
 *    npx eyes-setup
 *    Create .env at project root: APPLITOOLS_API_KEY=your_key_here
 *
 *  Your cypress.config.js already has the correct setup:
 *    require('dotenv').config()
 *    module.exports = require('@applitools/eyes-cypress')(defineConfig({...}))
 *    config.env.APPLITOOLS_API_KEY = process.env.APPLITOOLS_API_KEY
 *
 *  Run visual tests:
 *    npm run test:visual
 * ============================================================
 */

describe('Visual Regression — Applitools Eyes', () => {

  // Track whether eyesOpen succeeded so afterEach can guard eyesClose.
  // Without this flag, if eyesOpen throws, afterEach will call eyesClose
  // on a non-open instance and cause a cascading "Eyes not opened" error.
  let eyesOpened = false;

  before(function () {
    // Applitools reads APPLITOOLS_API_KEY from process.env via dotenv.
    // Your cypress.config.js bridges it to Cypress.env too.
    // We check both so the skip works regardless of how the key was loaded.
    const apiKey = Cypress.env('APPLITOOLS_API_KEY') || process.env.APPLITOOLS_API_KEY;

    if (!apiKey) {
      cy.log('⚠️ APPLITOOLS_API_KEY not set — skipping visual tests.');
      cy.log('Create a .env file at project root with: APPLITOOLS_API_KEY=your_key_here');
      this.skip();
    }
  });

  beforeEach(() => {
    eyesOpened = false; // Reset flag before each test

    cy.eyesOpen({
      appName: 'Jordan Nguyen Portfolio',
      batchName: 'Portfolio UI Regression',
      // ── FIX: Do NOT pass testName here ─────────────────────────────
      // Applitools automatically uses the it() description as the test name.
      // Passing Cypress.currentTest.title in beforeEach is unreliable —
      // currentTest may be undefined depending on Cypress/Applitools version,
      // which causes eyesOpen to throw and leaves Eyes in a broken state.
      browser: [
        { width: 1280, height: 800, name: 'chrome'   },
        { width: 1280, height: 800, name: 'firefox'  },
        { width: 390,  height: 844, name: 'chrome', deviceName: 'iPhone 15' },
      ],
    }).then(() => {
      eyesOpened = true; // Only set true after eyesOpen resolves successfully
    });
  });

  afterEach(() => {
    // Only call eyesClose if eyesOpen actually succeeded.
    // If eyesOpen threw, calling eyesClose on a non-open instance causes a
    // cascading "Eyes not opened" error that hides the real failure.
    if (eyesOpened) {
      cy.eyesClose();
      eyesOpened = false;
    }
  });

  // FIX: afterAll batch finalisation.
  // Applitools collects all test results into a batch and closes it
  // in an internal afterAll hook. If that hook runs before our tests
  // have finished, or if no tests opened Eyes, it throws an "after all
  // hook failed" error. Explicitly calling eyesGetAllTestResults()
  // here finalises the batch cleanly and prevents the hook crash.
  after(() => {
    // eyesGetAllTestResults is only available after npx eyes-setup.
    // Guard against it being undefined if Applitools is not configured.
    if (typeof cy.eyesGetAllTestResults === 'function') {
      cy.eyesGetAllTestResults();
    }
  });

  // ── Full page snapshots ─────────────────────────────────────────────

  it('Homepage — full page visual check', () => {
    cy.visit('/');
    cy.get('#hero-title').should('be.visible');
    cy.get('.career-port-title').should('be.visible');
    cy.eyesCheckWindow({ tag: 'Homepage', fully: true });
  });

  it('Jobs page — full page visual check', () => {
    cy.visit('/assets/html/jobs.html');
    cy.get('.timeline-container').should('be.visible');
    cy.eyesCheckWindow({ tag: 'Jobs Page', fully: true });
  });

  it('SDET Showcase — full page visual check', () => {
    cy.visit('/assets/html/sdet.html');
    cy.get('.skills-matrix-grid').should('be.visible');
    cy.eyesCheckWindow({ tag: 'SDET Showcase', fully: true });
  });

  it('Certifications — full page visual check', () => {
    cy.visit('/assets/html/certifications.html');
    cy.get('.badge-container').should('be.visible');
    cy.eyesCheckWindow({ tag: 'Certifications', fully: true });
  });

  // ── Component snapshots ─────────────────────────────────────────────

  it('Navigation bar — component visual check', () => {
    cy.visit('/');
    cy.get('.topnav').should('be.visible');
    cy.eyesCheckWindow({
      tag: 'Navigation Bar',
      target: 'region',
      selector: '.topnav',
    });
  });

  it('Job card — expanded details state', () => {
    cy.visit('/assets/html/jobs.html');
    cy.get('#nationalbank-card .toggle-button').click();
    cy.get('#nationalbank-card .project-summary').should('be.visible');
    cy.eyesCheckWindow({
      tag: 'Job Card — Expanded',
      target: 'region',
      selector: '#nationalbank-card',
    });
  });

});
