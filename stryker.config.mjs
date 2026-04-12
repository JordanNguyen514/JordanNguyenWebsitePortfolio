/**
 * ============================================================
 *  MUTATION TESTING — StrykerJS
 *  stryker.config.mjs
 * ============================================================
 *
 *  CONCEPT — What is Mutation Testing?
 *  --------------------------------------
 *  Code coverage tells you WHICH lines are executed by tests.
 *  Mutation testing tells you whether your tests actually DETECT bugs.
 *
 *  Stryker works by automatically introducing small bugs ("mutations")
 *  into your source code — one at a time — then running your tests.
 *  If your tests CATCH the mutation (fail) → the mutation is "killed" ✅
 *  If your tests MISS the mutation (pass)  → the mutation "survived" ⚠️
 *
 *  Example mutations:
 *    i < 10   →  i <= 10   (boundary condition change)
 *    return true  →  return false
 *    x + y  →  x - y
 *    if (a && b)  →  if (a || b)
 *
 *  Mutation Score = killed / total mutations
 *  A score of 80%+ means your tests are genuinely effective.
 *
 *  This is the gold standard for test quality measurement.
 *  It answers: "Could I ship a bug past these tests?"
 *
 *  Run with:
 *    npx stryker run              (full mutation test)
 *    npx stryker run --reporters html  (with HTML report)
 *
 *  Output: reports/mutation/mutation.html
 *
 *  What to tell Deloitte:
 *  "I use mutation testing to validate the QUALITY of my unit tests,
 *   not just their quantity. A 95% line coverage means nothing if
 *   the tests don't assert on the right things. Mutation score above
 *   80% gives me confidence the tests would catch real bugs."
 *
 * ============================================================
 */

/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress', 'dashboard'],
  testRunner: 'jest',

  // ── What to mutate ─────────────────────────────────────────────────────────
  // Only mutate our own utility functions, not vendor/framework code
  mutate: [
    // The unit test file re-defines the functions inline,
    // so we point Stryker at the test file itself to mutate the logic.
    // In a real refactor you'd extract to utils.js and point here instead.
    '__tests__/portfolio.unit.test.js',
  ],

  // ── Jest configuration ─────────────────────────────────────────────────────
  jest: {
    projectType: 'custom',
    configFile: 'package.json',  // Jest config is in package.json
    enableFindRelatedTests: true,
  },

  // ── Thresholds ──────────────────────────────────────────────────────────────
  thresholds: {
    high: 80,    // >= 80% = green (good)
    low:  60,    // >= 60% = yellow (acceptable)
    break: 50,   // < 50% = red (fails the run — tests are too weak)
  },

  // ── Timeouts ────────────────────────────────────────────────────────────────
  timeoutMS: 10000,  // Kill a mutant test after 10s (infinite loop protection)
  timeoutFactor: 1.5,

  // ── Dashboard (optional) ────────────────────────────────────────────────────
  // Publish results to stryker-mutator.io dashboard for tracking over time.
  // Add STRYKER_DASHBOARD_API_KEY to GitHub Secrets to enable.
  // dashboard: {
  //   project: 'github.com/JordanNguyen514/JordanNguyenWebsitePortfolio',
  //   version: 'master',
  // },

  // ── What NOT to mutate ──────────────────────────────────────────────────────
  ignorePatterns: [
    'node_modules',
    'cypress',
    'playwright',
    'pact',
    '_site',
    'assets/js/jquery-3.5.0.js',
  ],

  // ── Mutation types to apply ─────────────────────────────────────────────────
  // Default: all. Listed here for documentation.
  // ArithmeticOperator: + - * / %  →  swap operators
  // BooleanLiteral: true/false  →  flip
  // ConditionalExpression: if conditions  →  always-true/false
  // EqualityOperator: === !==  →  swap
  // LogicalOperator: && ||  →  swap
  // StringLiteral: 'text'  →  ''  (empty string)
  // BlockStatement: { ... }  →  { }  (remove function body)
};
