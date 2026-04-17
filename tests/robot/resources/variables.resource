# ============================================================
#  tests/robot/resources/variables.resource
#
#  Central place for all URLs, timeouts, and shared values.
#  Override BASE_URL at runtime without editing this file:
#
#    Local:      robot --variable BASE_URL:http://localhost:8080 ...
#    Production: robot --variable BASE_URL:https://d2kmkdebgfkxyh.cloudfront.net ...
#
#  The default value below is production so that `robot` with
#  no arguments runs against the live site (same as Cypress CI).
# ============================================================

*** Variables ***
# ── URLs ──────────────────────────────────────────────────────
${BASE_URL}             https://d2kmkdebgfkxyh.cloudfront.net
${HOME_URL}             ${BASE_URL}/
${JOBS_URL}             ${BASE_URL}/assets/html/jobs.html
${INTERNSHIPS_URL}      ${BASE_URL}/assets/html/internships.html
${CERTIFICATIONS_URL}   ${BASE_URL}/assets/html/certifications.html
${ACADEMIC_URL}         ${BASE_URL}/assets/html/academic.html
${SDET_URL}             ${BASE_URL}/assets/html/sdet.html
${CONTACT_URL}          ${BASE_URL}/assets/html/contacting.html
${EMAIL_URL}            ${BASE_URL}/assets/html/emailing.html

# ── Browser & timing ──────────────────────────────────────────
${BROWSER}              chrome
${TIMEOUT}              15s
${SHORT_WAIT}           2s

# ── Test data — contact form ───────────────────────────────────
${CONTACT_FIRST_NAME}   Robot
${CONTACT_LAST_NAME}    Framework
${CONTACT_EMAIL}        robot@test.com
${CONTACT_PHONE}        5141234567
${CONTACT_MESSAGE}      Automated Robot Framework test submission.
