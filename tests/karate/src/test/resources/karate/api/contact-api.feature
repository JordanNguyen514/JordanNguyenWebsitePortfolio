# ============================================================
#  tests/karate/src/test/resources/karate/api/contact-api.feature
#
#  Tests for the Contact Form AWS Lambda API endpoint.
#  Endpoint: POST https://yx8x3by1x5.execute-api.ca-central-1.amazonaws.com/prod/submit
#
#  CONCEPT — Contract Testing vs Functional API Testing
#  ─────────────────────────────────────────────────────
#  Contract testing verifies that a service BEHAVES according
#  to an agreed interface. For this Lambda:
#    - POST valid JSON → 200 + success message
#    - POST missing fields → 400/422/500
#    - CORS headers must be present
#
#  These tests catch backend regressions BEFORE deploying the
#  frontend — true Shift Left in action.
# ============================================================

Feature: Contact Form Lambda API
  Validates the AWS Lambda endpoint behind the portfolio contact form.

  Background:
    * url contactApiUrl
    * configure headers = defaultHeaders

  # ── Happy Path ──────────────────────────────────────────────────────────────

  Scenario: Valid contact form submission returns success
    Given request validContact
    When  method POST
    Then  status 200

  Scenario: Response time is acceptable for a contact form
    Given request validContact
    When  method POST
    Then  status 200
    # Lambda cold start ≤ 5s, warm ≤ 1s — 10s is a generous upper bound
    * assert responseTime < 10000

  # ── CORS Headers ────────────────────────────────────────────────────────────

  Scenario: POST response includes CORS allow-origin header
    Given request validContact
    When  method POST
    Then  status 200
    * def allowOrigin = responseHeaders['Access-Control-Allow-Origin']
    * assert allowOrigin != null

  # ── Input Validation ────────────────────────────────────────────────────────

  Scenario: Missing email field returns a client or server error
    Given request { firstName: 'Test', lastName: 'User', Message: 'No email' }
    When  method POST
    # 400 = Lambda validates explicitly, 500 = uncaught validation error
    # Both indicate the server rejected the invalid payload
    Then  status != 200

  Scenario: Empty body returns a non-200 response
    Given request {}
    When  method POST
    Then  status != 200

  # ── Data-Driven Testing ─────────────────────────────────────────────────────

  Scenario Outline: Valid submissions with different purpose types are accepted
    Given request
      """
      {
        "firstName": "Jordan",
        "lastName":  "Test",
        "email":     "test@test.com",
        "number":    "5141234567",
        "Purpose":   "<purpose>",
        "Message":   "Testing purpose: <label>"
      }
      """
    When  method POST
    Then  status 200

    Examples:
      | purpose | label        |
      | A       | Academics    |
      | P       | Professional |
      | O       | Others       |
