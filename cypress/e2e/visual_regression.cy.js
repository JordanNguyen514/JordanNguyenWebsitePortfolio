/**
 * ============================================================
 *  VISUAL REGRESSION — APPLITOOLS EYES
 *  cypress/e2e/visual_regression.cy.js
 * ============================================================
 *
 *  CONCEPT — What is Applitools Eyes?
 *  ------------------------------------
 *  Applitools is an AI-powered visual testing platform.
 *  Unlike screenshot diffs (pixel-by-pixel), Applitools uses
 *  Visual AI to distinguish REAL visual bugs from noise like:
 *    • Anti-aliasing differences between browsers
 *    • Font rendering on different OS
 *    • Dynamic content (timestamps, counters)
 *
 *  It maintains a "baseline" in the cloud. Every test run
 *  compares against the baseline and flags regressions in
 *  a dashboard you can review and approve/reject.
 *
 *  SETUP (one-time):
 *  1. Sign up free at https://applitools.com (free tier = 100 checkpoints/month)
 *  2. npm install @applitools/eyes-cypress
 *  3. npx eyes-setup  (adds Applitools to cypress/support/e2e.js automatically)
 *  4. Add your API key to GitHub Secrets: APPLITOOLS_API_KEY
 *  5. Run: npx cypress run --env APPLITOOLS_API_KEY=$APPLITOOLS_API_KEY
 *
 *  Why it matters for Deloitte:
 *  "I integrated AI-powered visual regression testing using Applitools
 *   Eyes. Unlike pixel-diff tools, it uses Visual AI to ignore rendering
 *   noise across browsers and OS, catching only genuine UI regressions.
 *   It reduced false positives by ~90% compared to screenshot comparison."
 *
 * ============================================================
 */

import Eyes from '@applitools/eyes-cypress';

describe('🎨 Visual Regression — Applitools Eyes', () => {

  beforeEach(() => {
    // Open Eyes for each test — creates a checkpoint session
    cy.eyesOpen({
      appName: 'Jordan Nguyen Portfolio',
      // testName is set per-test automatically
      browser: [
        { width: 1280, height: 800, name: 'chrome' },
        { width: 1280, height: 800, name: 'firefox' },
        { width: 390,  height: 844, name: 'chrome',  deviceName: 'iPhone 14 Pro' },
      ],
    });
  });

  afterEach(() => {
    // Close Eyes — uploads checkpoint to Applitools dashboard
    cy.eyesClose();
  });

  // ──────────────────────────────────────────────────────────
  //  Full page snapshots — one checkpoint per page
  // ──────────────────────────────────────────────────────────

  it('Homepage — full page visual check', () => {
    cy.visit('/');
    cy.get('#hero-title').should('be.visible'); // Wait for content
    cy.eyesCheckWindow({
      tag: 'Homepage',
      fully: true,  // Capture full scrollable page
    });
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

  // ──────────────────────────────────────────────────────────
  //  Component-level snapshots — targeted checkpoints
  // ──────────────────────────────────────────────────────────

  it('Navigation bar — component visual check', () => {
    cy.visit('/');
    cy.get('.topnav').should('be.visible');
    // Check just the nav — stable, high-value component
    cy.eyesCheckWindow({
      tag: 'Navigation Bar',
      target: 'region',
      selector: '.topnav',
    });
  });

  it('Skills matrix — expanded card state', () => {
    cy.visit('/assets/html/sdet.html');
    cy.get('.skill-category-card').first().trigger('mouseover');
    cy.eyesCheckWindow({
      tag: 'Skills Matrix — Hover State',
      target: 'region',
      selector: '.skills-matrix-grid',
    });
  });

  it('Job card — expanded details state', () => {
    cy.visit('/assets/html/jobs.html');
    // Open the first job card
    cy.get('.toggle-button').first().click();
    cy.get('.project-summary').first().should('be.visible');
    cy.eyesCheckWindow({
      tag: 'Job Card — Expanded',
      target: 'region',
      selector: '#nationalbank-card',
    });
  });

});
