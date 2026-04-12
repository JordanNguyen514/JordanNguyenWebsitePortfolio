/**
 * ============================================================
 *  AUTO-HEALING SELECTORS  —  cypress/support/autoHeal.js
 * ============================================================
 *
 *  CONCEPT — What is Auto-Healing?
 *  --------------------------------
 *  Tests break most often not because the feature is broken,
 *  but because a developer renamed a CSS class, changed an id,
 *  or restructured HTML. Auto-healing solves this by trying
 *  MULTIPLE selector strategies in priority order and using
 *  the first one that finds the element — then logging which
 *  selector "won" so you can update your tests later.
 *
 *  Priority order (most stable → least stable):
 *    1. data-testid        ← best: survives refactors
 *    2. data-event-action  ← your existing tracking attrs
 *    3. aria-label         ← accessibility attributes
 *    4. id                 ← stable but can change
 *    5. CSS class          ← fragile, last resort
 *
 *  Usage in your specs:
 *    cy.getHealed('hero-title')          // tries #hero-title, [data-testid="hero-title"], etc.
 *    cy.getHealed('Click_Jobs_Button')   // matches your data-event-action attrs
 *
 * ============================================================
 */

const SELECTOR_STRATEGIES = [
  // Strategy 1 — Explicit test ID (gold standard for testability)
  (token) => `[data-testid="${token}"]`,

  // Strategy 2 — Your existing event-tracking attributes (already on your elements!)
  (token) => `[data-event-action="${token}"]`,

  // Strategy 3 — Aria labels (accessibility + testability win)
  (token) => `[aria-label="${token}"]`,

  // Strategy 4 — ID attribute
  (token) => `#${token}`,

  // Strategy 5 — CSS class (least preferred)
  (token) => `.${token}`,
];

/**
 * Attempts each selector strategy in order.
 * Returns the first element found, logs the winning strategy.
 *
 * @param {string} token - The identifier to search for
 * @param {object} options - Cypress options (timeout, etc.)
 *
 * ── Why the fix? ────────────────────────────────────────────
 * The original implementation used $body.find(selector) — a
 * SYNCHRONOUS, one-shot DOM check. After cy.go('back') or any
 * page navigation, Cypress fires the check before the DOM has
 * fully re-painted, so every strategy returns empty even though
 * the element exists. This is a classic race condition.
 *
 * The fix uses cy.get(combinedSelector) with ALL strategies
 * joined as a single CSS selector (e.g. "[data-testid='x'], #x, .x").
 * cy.get() has Cypress's built-in RETRY ENGINE — it polls the DOM
 * until the element appears or the timeout expires. Once found,
 * we check which specific strategy won and log it.
 * ────────────────────────────────────────────────────────────
 */
Cypress.Commands.add('getHealed', (token, options = {}) => {
  const timeout = options.timeout ?? Cypress.config('defaultCommandTimeout');

  const STRATEGY_NAMES = [
    'data-testid',
    'data-event-action',
    'aria-label',
    'id',
    'css-class',
  ];

  // Build all selectors upfront
  const allSelectors = SELECTOR_STRATEGIES.map((s) => s(token));

  // ── Key fix: join ALL selectors into one cy.get() call ──────
  // CSS multi-selector syntax: "sel1, sel2, sel3"
  // cy.get() retries the ENTIRE expression until any match appears.
  // This survives page transitions, lazy rendering, and JS-driven DOM.
  const combinedSelector = allSelectors.join(', ');

  return cy.get(combinedSelector, { timeout }).then(($el) => {
    // Element is in the DOM — now determine which strategy won
    const winningIndex = allSelectors.findIndex((sel) => {
      try { return $el.is(sel); } catch { return false; }
    });

    const strategyName = STRATEGY_NAMES[winningIndex] ?? 'unknown';
    const winningSelector = allSelectors[winningIndex] ?? combinedSelector;

    Cypress.log({
      name: '🩹 AutoHeal',
      message: `Found via [${strategyName}]: ${winningSelector}`,
      consoleProps: () => ({
        Token: token,
        'Winning Strategy': strategyName,
        Selector: winningSelector,
        'Strategies Tried': winningIndex + 1,
        Element: $el[0],
      }),
    });

    // Warn if we fell back past strategy 2 — prompt to add data-testid
    if (winningIndex > 1) {
      Cypress.log({
        name: '⚠️ Heal Needed',
        message: `Add data-testid="${token}" to make this selector resilient`,
      });
    }

    return $el.first();
  });
});

/**
 * healReport()
 * ------------
 * Call at the end of a test run to print a summary of which
 * elements needed healing (i.e., were found via fallback selectors).
 * In a real CI pipeline this would write to a JSON report.
 */
const healLog = [];

Cypress.Commands.add('healReport', () => {
  if (healLog.length === 0) {
    cy.log('✅ AutoHeal: No healing needed — all selectors are healthy!');
  } else {
    cy.log(`⚠️ AutoHeal Report: ${healLog.length} element(s) needed healing`);
    healLog.forEach((entry) => {
      cy.log(`  • "${entry.token}" → healed via ${entry.strategy} (${entry.selector})`);
    });
  }
});
