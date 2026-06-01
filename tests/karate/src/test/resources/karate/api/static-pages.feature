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
      | /assets/html/jobs.html                  | My Work Experiences             |
      | /assets/html/internships.html           | Internship Experiences          |
      | /assets/html/academic.html              | Biomedical Engineering          |
      | /assets/html/certifications.html        | My Certifications               |
      | /assets/html/sdet.html                  | SDET Showcase                   |
      | /assets/html/qa-metrics.html            | QA Metrics Dashboard            |
      | /assets/html/live-pipeline-status.html  | Live Pipeline Status            |
      | /assets/html/skills-radar.html          | radar-svg                       |
      | /assets/html/blog.html                  | QA Case Studies                 |
      | /assets/html/testimonials.html          | Endorsements                    |
      | /assets/html/recruiter.html             | Core Stack                      |
      | /assets/html/contacting.html            | contactForm                     |
      | /assets/html/emailing.html              | emailForm                       |
      | /assets/html/submissions.html           | Submitted Contact Forms         |
      | /404.html                               | Page Not Found                  |
      | /OtherSection/index.html                | My Other Interests and Passions |
      | /OtherSection/Random/index.html         | Weather API                     |
      | /OtherSection/Sports/index.html         | Sports                          |
      | /OtherSection/Social/index.html         | Soci.css                        |
      | /OtherSection/Travel/index.html         | Trav.css                        |

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
      | /assets/data/ci-dashboard-local.json | json  |
