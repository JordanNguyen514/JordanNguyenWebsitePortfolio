# ============================================================
#  tests/karate/src/test/resources/karate/api/email-api.feature
#
#  Tests for the Email Form AWS Lambda API endpoint.
#  Endpoint: POST https://88vzig52sl.execute-api.ca-central-1.amazonaws.com/prod/send
#
#  REPLACING contact-api.feature:
#  The original contact form API Gateway has been decommissioned.
#  This suite now tests the active email form Lambda which accepts:
#    { senderName, senderEmail, subject, message }
#
#  CONCEPT — Why API contract tests matter
#  ─────────────────────────────────────────
#  These tests catch Lambda/API Gateway regressions before
#  they reach users — catching a broken email form at the API
#  layer is faster and cheaper than finding it in browser E2E.
# ============================================================

Feature: Email Form Lambda API
  Validates the AWS Lambda endpoint behind the portfolio email form.
  Endpoint: POST https://88vzig52sl.execute-api.ca-central-1.amazonaws.com/prod/send

  Background:
    * url emailApiUrl
    * configure headers = defaultHeaders

  # ── Happy Path ──────────────────────────────────────────────────────────────

  Scenario: Valid email form submission returns success
    Given request validEmail
    When  method POST
    Then  status 200

  Scenario: Response time is acceptable for an email form
    # Lambda cold start ≤ 5s, warm ≤ 1s — 10s is a generous upper bound
    Given request validEmail
    When  method POST
    Then  status 200
    * assert responseTime < 10000

  # ── CORS Headers ────────────────────────────────────────────────────────────

  Scenario: POST response includes CORS allow-origin header
    Given request validEmail
    When  method POST
    Then  status 200
    * def allowOrigin = responseHeaders['Access-Control-Allow-Origin']
    * assert allowOrigin != null

  # ── Input Validation ────────────────────────────────────────────────────────

  Scenario: Missing senderEmail field returns a non-200 response
    # FIX: "status != 200" is not valid Karate syntax.
    # Use a two-step assertion: capture status then assert with JavaScript.
    Given request { senderName: 'Test', subject: 'No email', message: 'Missing email field' }
    When  method POST
    * def responseStatus = responseStatus
    * assert responseStatus != 200

  Scenario: Empty body returns a non-200 response
    Given request {}
    When  method POST
    * def responseStatus = responseStatus
    * assert responseStatus != 200

  # ── Data-Driven Testing ─────────────────────────────────────────────────────

  Scenario Outline: Valid submissions with different subjects are accepted
    # CONCEPT — Scenario Outline runs the same test with different data rows.
    # Each row appears as a separate test in the Karate HTML report.
    Given request
      """
      {
        "senderName":  "Karate Test",
        "senderEmail": "karate@test.com",
        "subject":     "<subject>",
        "message":     "Automated Karate API test — subject variant: <label>"
      }
      """
    When  method POST
    Then  status 200

    Examples:
      | subject              | label        |
      | Professional inquiry | Professional |
      | Academic question    | Academic     |
      | General message      | General      |
