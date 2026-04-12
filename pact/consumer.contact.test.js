/**
 * ============================================================
 *  CONTRACT TESTING (Consumer)  —  pact/consumer.contact.test.js
 * ============================================================
 *
 *  CONCEPT — What is Contract Testing?
 *  --------------------------------------
 *  In a microservices / serverless architecture (like yours —
 *  frontend → API Gateway → Lambda), integration tests are
 *  brittle: they need both sides running at the same time.
 *
 *  Contract Testing solves this with a "contract" — a formal
 *  agreement between the CONSUMER (your JS frontend) and the
 *  PROVIDER (your AWS Lambda) about what requests and responses
 *  look like.
 *
 *  The flow:
 *    1. Consumer writes tests defining what it EXPECTS from the API
 *    2. Pact generates a "pact file" (JSON contract)
 *    3. Provider runs verification against that contract
 *    4. Both sides can be tested INDEPENDENTLY — no live backend needed!
 *
 *  This is especially powerful for:
 *    • Testing frontend against a mocked backend (fast, no AWS costs)
 *    • Catching breaking API changes before they hit production
 *    • Documenting API contracts as living, executable specifications
 *
 *  Pact vs Integration Tests:
 *    Integration test: "Does the real Lambda accept this request?"  (slow, costly)
 *    Contract test:    "Does our frontend call the API correctly?"  (fast, isolated)
 *
 *  Run with:
 *    npx jest pact/consumer.contact.test.js
 *
 *  Output: pact/pacts/PortfolioFrontend-ContactLambda.json
 *
 * ============================================================
 */

const { PactV3, MatchersV3 } = require('@pact-foundation/pact');
const { like, string, eachLike } = MatchersV3;
const path = require('path');

// ── What is the "Consumer"? ───────────────────────────────────
// The consumer is the CALLER of the API — in your case, the
// contact form JavaScript in contacting.html / contact_form_handler.js
//
// The consumer defines what IT NEEDS from the API, not what
// the API provides. This is the key insight of consumer-driven
// contract testing.

const provider = new PactV3({
  consumer: 'PortfolioFrontend',          // your JS frontend
  provider:  'ContactLambda',             // your AWS Lambda function
  dir:       path.resolve('pact/pacts'),  // where to write the contract file
  logLevel:  'warn',
});

// ── Simulated frontend function ────────────────────────────────
// This mirrors your actual contact_form_handler.js logic.
// In real usage you'd import the actual function.
async function submitContactForm(apiUrl, formData) {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  return response.json();
}

// ── Contract Definitions ───────────────────────────────────────

describe('Contact Form API — Consumer Contract', () => {

  // ── Interaction 1: Successful form submission ───────────────
  it('returns success when all required fields are provided', () => {
    return provider
      .addInteraction({
        // Human-readable description — becomes the contract clause
        uponReceiving: 'a valid contact form submission',

        // What the consumer will send
        withRequest: {
          method: 'POST',
          path: '/prod',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            // Use matchers so the contract is flexible:
            // "any string" not "exactly this string"
            firstName: string('Jordan'),
            lastName:  string('Nguyen'),
            email:     string('test@example.com'),
            message:   string('Hello from the contact form'),
            // type is either 'P' (Professional) or 'O' (Other)
            type: like('P'),
          },
        },

        // What the consumer NEEDS in the response (minimum viable)
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': like('application/json'),
          },
          body: {
            // Consumer only needs to know the submission succeeded
            message: string('Message sent successfully!'),
          },
        },
      })
      .executeTest(async (mockProvider) => {
        // ✅ Test against the Pact mock server (no real Lambda needed!)
        const result = await submitContactForm(mockProvider.url + '/prod', {
          firstName: 'Jordan',
          lastName:  'Nguyen',
          email:     'test@example.com',
          message:   'Hello from the contact form',
          type:      'P',
        });

        expect(result.message).toBe('Message sent successfully!');
      });
  });

  // ── Interaction 2: Missing required fields ──────────────────
  it('returns an error when email is missing', () => {
    return provider
      .addInteraction({
        uponReceiving: 'a contact form submission without an email',

        withRequest: {
          method: 'POST',
          path: '/prod',
          headers: { 'Content-Type': 'application/json' },
          body: {
            firstName: string('Jordan'),
            lastName:  string('Nguyen'),
            // No email field — intentionally missing
            message:   string('Test message'),
          },
        },

        willRespondWith: {
          status: 400,
          body: {
            error: string('Missing required field: email'),
          },
        },
      })
      .executeTest(async (mockProvider) => {
        const result = await submitContactForm(mockProvider.url + '/prod', {
          firstName: 'Jordan',
          lastName:  'Nguyen',
          message:   'Test message',
        });

        // Consumer handles the 400 gracefully
        expect(result.error).toContain('email');
      });
  });

});

/**
 * After running this test, a file is generated at:
 *   pact/pacts/PortfolioFrontend-ContactLambda.json
 *
 * This JSON file IS the contract. Share it with your Lambda
 * team (or run provider verification — see pact/provider.test.js)
 * to verify both sides agree.
 *
 * In a CI pipeline you'd publish this to a Pact Broker:
 *   npx pact-broker publish pact/pacts \
 *     --broker-base-url https://your-pact-broker.com \
 *     --consumer-app-version $GIT_SHA
 */
