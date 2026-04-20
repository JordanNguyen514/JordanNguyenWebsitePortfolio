# ============================================================
#  tests/karate/src/test/resources/karate/api/health.feature
#
#  FIXES APPLIED:
#  1. responseHeaders['Content-Type'][0] contains 'text/html'
#     was evaluated as JavaScript — "contains" is not a JS
#     method. Karate's "contains" keyword must be used with
#     "match", not in a plain "And" assertion expression.
#     Fixed to: And match responseHeaders['Content-Type'][0]
#               contains 'text/html'
#
#  2. responseTime < 3000 is not a valid Karate step keyword.
#     Karate uses "* assert responseTime < 3000" for inline
#     JavaScript assertions without a step keyword.
# ============================================================

Feature: CloudFront Health Checks
  Verifies all public pages of the Jordan Nguyen SDET Portfolio
  are reachable and returning expected HTTP status codes.

  Background:
    * url baseUrl

  Scenario: Homepage returns HTTP 200
    Given path '/'
    When  method GET
    Then  status 200
    And   match responseHeaders['Content-Type'][0] contains 'text/html'

  Scenario: Jobs page returns HTTP 200
    Given path '/assets/html/jobs.html'
    When  method GET
    Then  status 200
    And   match responseHeaders['Content-Type'][0] contains 'text/html'

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
    And   match responseHeaders['Content-Type'][0] contains 'text/css'

  Scenario: Static JS assets are served correctly
    Given url baseUrl + '/assets/js/main.js'
    When  method GET
    Then  status 200
    And   match responseHeaders['Content-Type'][0] contains 'javascript'

  Scenario Outline: All key pages load within acceptable time
    Given url baseUrl + '<path>'
    When  method GET
    Then  status 200
    # FIX: Use "* assert" for inline JS expressions.
    # "responseTime < 3000" alone is not a Karate step — it has no keyword.
    # "* assert <expression>" evaluates any JS expression as an assertion.
    * assert responseTime < 3000

    Examples:
      | path                             |
      | /                                |
      | /assets/html/jobs.html           |
      | /assets/html/sdet.html           |
      | /assets/html/certifications.html |
