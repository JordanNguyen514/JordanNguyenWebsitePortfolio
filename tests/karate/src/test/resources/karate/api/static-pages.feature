@static @pages
Feature: Static page contracts
  Ensures every public portfolio page is reachable and exposes a stable content marker.

  Background:
    * url baseUrl

  Scenario Outline: Public pages return HTML with expected content
    Given path '<path>'
    When method GET
    Then status 200
    And match responseHeaders['Content-Type'][0] contains 'text/html'
    And match response contains '<marker>'

    Examples:
      | path                                    | marker                          |
      | /                                       | Quality Engineering Consultant  |
      | /assets/html/work-experience.html       | Work Experience                 |
      | /assets/html/academic.html              | Biomedical Engineering          |
      | /assets/html/certifications.html        | My Certifications               |
      | /assets/html/sdet.html                  | SDET Showcase                   |
      | /assets/html/live-pipeline-status.html  | Quality Dashboard               |
      | /assets/html/blog.html                  | QA Case Studies                 |
      | /assets/html/testimonials.html          | Endorsements                    |
      | /assets/html/recruiter.html             | Core Stack                      |
      | /assets/html/emailing.html              | emailForm                       |
      | /404.html                               | Page Not Found                  |


  Scenario Outline: Important static assets are served
    Given path '<path>'
    When method GET
    Then status 200
    And match responseHeaders['Content-Type'][0] contains '<contentType>'

    Examples:
      | path                           | contentType |
      | /assets/css/main.css           | text/css    |
      | /assets/css/FirstPage.css      | text/css    |
      | /assets/css/skills-radar.css   | text/css    |
      | /assets/css/ci-dashboard.css   | text/css    |
      | /assets/js/main.js             | javascript  |
      | /assets/js/ci-dashboard.js     | javascript  |
      | /assets/js/skills-radar.js     | javascript  |
      | /assets/js/testimonials.js     | javascript  |
      | /assets/data/ci-dashboard-local.json | json  |
      | /assets/data/linkedin-recommendations.json | json  |
