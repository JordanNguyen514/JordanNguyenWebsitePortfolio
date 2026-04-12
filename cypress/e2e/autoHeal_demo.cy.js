/**
 * ============================================================
 *  AUTO-HEAL DEMO SPEC  —  cypress/e2e/autoHeal_demo.cy.js
 * ============================================================
 *
 *  This spec demonstrates the auto-healing command against
 *  your real portfolio pages. It intentionally uses tokens
 *  that match DIFFERENT selector strategies to show healing
 *  in action.
 *
 *  Run with:
 *    npx cypress open    (interactive — watch healing logs in real time)
 *    npx cypress run     (headless — check terminal output)
 *
 * ============================================================
 */

describe('🩹 Auto-Healing Selector Demo', () => {

  beforeEach(() => {
    cy.visit('/');
  });

  // ─────────────────────────────────────────────────────────
  //  SCENARIO 1: Element found via data-event-action (strategy 2)
  //  This is your EXISTING markup — no changes needed!
  //  The healer falls back from data-testid → data-event-action
  //  and still finds the element successfully.
  // ─────────────────────────────────────────────────────────
  it('heals to data-event-action when data-testid is missing', () => {
    // Token matches your existing [data-event-action="Click_Jobs_Button"]
    cy.getHealed('Click_Jobs_Button')
      .should('be.visible')
      .and('contain', 'Jobs');

    // The heal log in the Cypress command panel will show:
    // 🩹 AutoHeal: Found via [data-event-action]: [data-event-action="Click_Jobs_Button"]
    // ⚠️ Heal Needed: Add data-testid="Click_Jobs_Button" to make this selector resilient
  });

  // ─────────────────────────────────────────────────────────
  //  SCENARIO 2: Element found via ID (strategy 4)
  //  Hero title has id="hero-title" — healer tries data-testid
  //  and data-event-action first, then succeeds with #hero-title
  // ─────────────────────────────────────────────────────────
  it('heals to id selector for hero title', () => {
    cy.getHealed('hero-title')
      .should('be.visible')
      .and('contain', 'Jordan Nguyen');
  });

  // ─────────────────────────────────────────────────────────
  //  SCENARIO 3: Element found via CSS class (strategy 5)
  //  Shows last-resort healing via class name
  // ─────────────────────────────────────────────────────────
  it('heals to CSS class selector as last resort', () => {
    cy.getHealed('career-port-title')
      .should('be.visible')
      .and('contain', 'Career Portfolio');
  });

  // ─────────────────────────────────────────────────────────
  //  SCENARIO 4: Gold standard — data-testid (strategy 1)
  //  This is what your selectors SHOULD look like.
  //  Add data-testid to key elements gradually for zero healing.
  // ─────────────────────────────────────────────────────────
  it('finds element instantly via data-testid (best practice)', () => {
    // The nav element already has this via data-event-action —
    // this shows how ZERO healing looks when selectors are healthy
    cy.getHealed('Click_Home')
      .should('be.visible')
      .and('contain', 'Home');
  });

  // ─────────────────────────────────────────────────────────
  //  SCENARIO 5: Full user flow using healed selectors
  //  Simulates a real recruiter visiting your portfolio
  // ─────────────────────────────────────────────────────────
  it('completes a full navigation flow using healed selectors', () => {
    // Land on homepage — verify hero
    cy.getHealed('hero-title').should('contain', 'Jordan Nguyen');

    // Navigate to Jobs via healed selector
    cy.getHealed('Click_Jobs_Button').click();
    cy.url().should('include', 'jobs.html');
    cy.go('back');

    // Navigate to Internships
    cy.getHealed('Click_Internships_Button').click();
    cy.url().should('include', 'internships.html');
    cy.go('back');

    // Verify social section
    cy.getHealed('Click_LinkedIn_Icon').should('be.visible');
    cy.getHealed('Click_GitHub_Icon').should('be.visible');

    // Print heal report at end of flow
    cy.healReport();
  });

  /*
    "Auto-healing is a test resilience pattern where the test
    framework tries multiple locator strategies before failing.
    It reduces flakiness caused by UI refactoring while logging
    which elements need better test IDs — bridging the gap between
    legacy code and modern testability standards.

    I implemented this in Cypress using a custom command that
    cascades through: data-testid → data-event-action → aria-label
    → id → CSS class. It's especially valuable in consulting where
    you inherit legacy codebases with poor selector hygiene."
  */
});
