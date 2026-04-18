# ============================================================
#  tests/karate/src/test/resources/karate/api/health.feature
#
#  CONCEPT — What are health check API tests?
#  ─────────────────────────────────────────────
#  Before running any functional test, verify the environment
#  is actually up. This is the API equivalent of a smoke test:
#  fast, cheap, and catches infrastructure problems early.
#
#  These tests run in <1 second each and gate the rest of the
#  pipeline — if CloudFront is down, there's no point running
#  300 Cypress tests that will all fail.
#
#  KARATE SYNTAX PRIMER:
#    Feature   = test file (like a describe block)
#    Scenario  = individual test (like an it block)
#    Given     = setup / precondition
#    When      = action
#    Then      = assertion
#    *         = any step type (shorthand when type doesn't matter)
#    def       = assign a variable
#    match     = deep equality check (Karate's killer feature)
# ============================================================

Feature: CloudFront Health Checks
  Verifies that all public pages of the Jordan Nguyen SDET Portfolio
  are reachable and returning the expected HTTP status codes.

  Background:
    # baseUrl is set in karate-config.js
    * url baseUrl

  Scenario: Homepage returns HTTP 200
    Given path '/'
    When  method GET
    Then  status 200
    And   responseHeaders['Content-Type'][0] contains 'text/html'

  Scenario: Jobs page returns HTTP 200
    Given path '/assets/html/jobs.html'
    When  method GET
    Then  status 200
    And   responseHeaders['Content-Type'][0] contains 'text/html'

  Scenario: Internships page returns HTTP 200
    Given path '/assets/html/internships.html'
    When  method GET
    Then  status 200

  Scenario: Certifications page returns HTTP 200
    Given path '/assets/html/certifications.html'
    When  method GET
    Then  status 200

  Scenario: SDET Showcase page returns HTTP 200
    Given path '/assets/html/sdet.html'
    When  method GET
    Then  status 200

  Scenario: Academic page returns HTTP 200
    Given path '/assets/html/academic.html'
    When  method GET
    Then  status 200

  Scenario: Contact page returns HTTP 200
    Given path '/assets/html/contacting.html'
    When  method GET
    Then  status 200

  Scenario: Static CSS assets are served correctly
    Given url baseUrl + '/assets/css/main.css'
    When  method GET
    Then  status 200
    And   responseHeaders['Content-Type'][0] contains 'text/css'

  Scenario: Static JS assets are served correctly
    Given url baseUrl + '/assets/js/main.js'
    When  method GET
    Then  status 200
    And   responseHeaders['Content-Type'][0] contains 'javascript'

  Scenario Outline: All key pages load within acceptable time
    Given url baseUrl + '<path>'
    When  method GET
    Then  status 200
    # CloudFront should serve cached pages in under 3 seconds
    And   responseTime < 3000

    Examples:
      | path                          |
      | /                             |
      | /assets/html/jobs.html        |
      | /assets/html/sdet.html        |
      | /assets/html/certifications.html |
