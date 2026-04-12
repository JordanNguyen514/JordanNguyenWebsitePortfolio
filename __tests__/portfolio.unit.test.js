/**
 * ============================================================
 *  UNIT TESTS  —  __tests__/portfolio.unit.test.js
 * ============================================================
 *
 *  CONCEPT — Unit Tests vs E2E Tests
 *  ------------------------------------
 *  Unit tests test LOGIC in isolation — no browser, no network,
 *  no DOM. They run in milliseconds and give instant feedback.
 *
 *  The Testing Pyramid (know this for Deloitte interviews):
 *
 *          /\
 *         /E2E\        ← Few, slow, expensive (your Cypress tests)
 *        /──────\
 *       /Integr. \     ← Some (API, component tests)
 *      /────────── \
 *     /  Unit Tests \  ← Many, fast, cheap (this file)
 *    /______________  \
 *
 *  Shift Left means having a WIDE base of unit tests so that
 *  E2E tests only need to verify the "happy path" integration —
 *  not re-test every edge case in a slow browser.
 *
 *  Run with:
 *    npx jest                    (run all tests)
 *    npx jest --watch            (watch mode — re-runs on save)
 *    npx jest --coverage         (coverage report)
 *
 * ============================================================
 */

// ── Utility functions extracted from your main.js ────────────
// In a real refactor you'd move these to a utils.js and import them.
// For now we redefine them here to show the testing pattern.

/**
 * Pads a time integer with a leading zero if < 10.
 * Extracted from your main.js checkTime() function.
 */
function checkTime(i) {
  if (i < 10) return '0' + i;
  return i;
}

/**
 * Formats a visitor count for display.
 * E.g. 1234 → "1,234 visitors"
 */
function formatVisitorCount(count) {
  if (typeof count !== 'number' || isNaN(count)) return 'N/A';
  if (count < 0) return 'N/A';
  return count.toLocaleString() + ' visitor' + (count === 1 ? '' : 's');
}

/**
 * Validates an email address format.
 * Used in contact/email forms.
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Sanitizes user input to prevent XSS injection.
 * Any form submission should pass through this before display.
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Builds the correct relative URL for a Jekyll page.
 * Replicates the logic of Jekyll's relative_url filter.
 */
function buildPageUrl(basePath, page) {
  const base = basePath.endsWith('/') ? basePath : basePath + '/';
  return base + page.replace(/^\//, '');
}


// ════════════════════════════════════════════════════════════
//  TEST SUITES
// ════════════════════════════════════════════════════════════

describe('checkTime() — time formatting utility', () => {

  test('pads single digit numbers with a leading zero', () => {
    expect(checkTime(5)).toBe('05');
    expect(checkTime(0)).toBe('00');
    expect(checkTime(9)).toBe('09');
  });

  test('does not pad double digit numbers', () => {
    expect(checkTime(10)).toBe(10);
    expect(checkTime(23)).toBe(23);
    expect(checkTime(59)).toBe(59);
  });

  test('handles boundary value at exactly 10', () => {
    // 10 is the first number that should NOT be padded
    expect(checkTime(10)).toBe(10);
    expect(checkTime(9)).toBe('09');
  });
});


describe('formatVisitorCount() — visitor counter display', () => {

  test('formats a number with commas', () => {
    expect(formatVisitorCount(1234)).toBe('1,234 visitors');
    expect(formatVisitorCount(1000000)).toBe('1,000,000 visitors');
  });

  test('uses singular "visitor" for count of 1', () => {
    expect(formatVisitorCount(1)).toBe('1 visitor');
  });

  test('returns N/A for invalid inputs', () => {
    expect(formatVisitorCount(null)).toBe('N/A');
    expect(formatVisitorCount('abc')).toBe('N/A');
    expect(formatVisitorCount(NaN)).toBe('N/A');
    expect(formatVisitorCount(-1)).toBe('N/A');
  });

  test('handles zero visitors', () => {
    expect(formatVisitorCount(0)).toBe('0 visitors');
  });
});


describe('isValidEmail() — contact form validation', () => {

  test('accepts valid email formats', () => {
    expect(isValidEmail('jordan@example.com')).toBe(true);
    expect(isValidEmail('j.nguyen+test@deloitte.ca')).toBe(true);
    expect(isValidEmail('user123@mail.co.uk')).toBe(true);
  });

  test('rejects invalid email formats', () => {
    expect(isValidEmail('notanemail')).toBe(false);
    expect(isValidEmail('missing@tld')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
    expect(isValidEmail('spaces in@email.com')).toBe(false);
  });

  test('rejects empty and null inputs', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
  });

  test('trims whitespace before validating', () => {
    expect(isValidEmail('  jordan@example.com  ')).toBe(true);
  });
});


describe('sanitizeInput() — XSS prevention', () => {

  test('escapes HTML special characters', () => {
    expect(sanitizeInput('<script>alert("xss")</script>'))
      .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  test('escapes ampersands', () => {
    expect(sanitizeInput('cats & dogs')).toBe('cats &amp; dogs');
  });

  test('escapes single quotes', () => {
    expect(sanitizeInput("it's fine")).toBe('it&#039;s fine');
  });

  test('returns empty string for non-string inputs', () => {
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(42)).toBe('');
    expect(sanitizeInput(undefined)).toBe('');
  });

  test('leaves clean text unchanged', () => {
    expect(sanitizeInput('Jordan Nguyen SDET')).toBe('Jordan Nguyen SDET');
  });
});


describe('buildPageUrl() — URL construction', () => {

  test('combines base path and page correctly', () => {
    expect(buildPageUrl('/portfolio/', 'jobs.html'))
      .toBe('/portfolio/jobs.html');
  });

  test('handles missing trailing slash on base', () => {
    expect(buildPageUrl('/portfolio', 'jobs.html'))
      .toBe('/portfolio/jobs.html');
  });

  test('handles leading slash on page', () => {
    expect(buildPageUrl('/portfolio/', '/jobs.html'))
      .toBe('/portfolio/jobs.html');
  });
});
