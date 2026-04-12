/**
 * ============================================================
 *  VISUAL REGRESSION — APPLITOOLS EYES
 *  cypress/e2e/visual_regression.cy.js
 * ============================================================
 *
 *  CONCEPT — What is Applitools Eyes?
 *  ------------------------------------
 *  Applitools is an AI-powered visual testing platform.
 *  Unlike pixel-by-pixel screenshot diffs, it uses Visual AI
 *  to distinguish real UI regressions from rendering noise
 *  (anti-aliasing, font differences, dynamic content).
 *
 *  HOW APPLITOOLS WORKS WITH CYPRESS
 *  ------------------------------------
 *  Applitools does NOT use imports. It injects Cypress commands
 *  (cy.eyesOpen, cy.eyesCheckWindow, cy.eyesClose) globally
 *  via a one-time setup command. This is different from most
 *  libraries — do NOT import it in spec files.
 *
 *  ONE-TIME SETUP (run these once in your terminal):
 *  -------------------------------------------------
 *  1. Sign up free: https://applitools.com
 *     (Free tier = 100 checkpoints/month — enough for this portfolio)
 *
 *  2. Install the package:
 *       npm install @applitools/eyes-cypress --save-dev
 *
 *  3. Run the setup wizard (modifies cypress/support/e2e.js automatically):
 *       npx eyes-setup
 *
 *  4. Add your API key — two options:
 *     a) Local .env file (create this file, already in .gitignore):
 *          APPLITOOLS_API_KEY=your_key_here
 *     b) GitHub Secret for CI:
 *          Settings -> Secrets -> APPLITOOLS_API_KEY
 *
 *  5. Run visual tests:
 *       npm run test:visual
 *
 *  AFTER SETUP, THIS SPEC WILL RUN AUTOMATICALLY.
 *  The cy.eyes* commands below will be available globally.
 *
 *  WHY IT SKIPS GRACEFULLY
 *  -------------------------
 *  If APPLITOOLS_API_KEY is not set, each test skips with a
 *  clear message rather than failing the entire CI run.
 *  This lets the rest of the Cypress suite pass normally.
 *
 * ============================================================
 */

// NOTE: No import needed — Applitools commands are injected
// globally by `npx eyes-setup` into cypress/support/e2e.js.
// If you see "cy.eyesOpen is not a function", run: npx eyes-setup

describe('Visual Regression — Applitools Eyes', () => {

  // Skip all tests if API key is not configured
  before(function () {
    if (!Cypress.env('APPLITOOLS_API_KEY')) {
      Cypress.log({
        name: '⚠️ Applitools',
        message: 'APPLITOOLS_API_KEY not set — skipping visual tests. Run: npx eyes-setup',
      });
      this.skip();
    }
  });

  beforeEach(() => {
    cy.eyesOpen({
      appName: 'Jordan Nguyen Portfolio',
      browser: [
        { width: 1280, height: 800, name: 'chrome' },
        { width: 1280, height: 800, name: 'firefox' },
        { width: 390,  height: 844, name: 'chrome', deviceName: 'iPhone 14 Pro' },
      ],
    });
  });

  afterEach(() => {
    cy.eyesClose();
  });

  // ── Full page snapshots ─────────────────────────────────────

  it('Homepage — full page visual check', () => {
    cy.visit('/');
    cy.get('#hero-title').should('be.visible');
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

  // ── Component snapshots ─────────────────────────────────────

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
    cy.get('.toggle-button').first().click();
    cy.get('.project-summary').first().should('be.visible');
    cy.eyesCheckWindow({
      tag: 'Job Card — Expanded',
      target: 'region',
      selector: '#nationalbank-card',
    });
  });

});
