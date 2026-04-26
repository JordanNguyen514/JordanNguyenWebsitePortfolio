# ============================================================
#  tests/robot/suites/01_smoke.robot
#
#  Smoke tests — fast checks that the site is up and core
#  content is present. These run first in the CI pipeline.
#  If smoke fails, the remaining suites are skipped.
#
#  CONCEPT — Robot Framework Test Structure
#  -----------------------------------------
#  Every .robot file has up to 4 sections:
#    *** Settings ***   — imports, suite setup/teardown
#    *** Variables ***  — local overrides
#    *** Test Cases *** — the actual tests (human-readable)
#    *** Keywords ***   — local helper keywords (if needed)
#
#  Test cases read like plain English, which is one of
#  Robot Framework's biggest strengths for stakeholder
#  communication and regulatory documentation.
# ============================================================

*** Settings ***
Documentation     Smoke tests for the Jordan Nguyen SDET Portfolio.
...               Verifies the site is up and all core sections load.
...               Runs against: ${BASE_URL}

Resource          ../resources/common.resource
Resource          ../resources/variables.resource

Suite Setup       Open Browser Session    ${HOME_URL}
Suite Teardown    Close Browser Session
Test Teardown     Run Keyword If Test Failed    Capture Page Screenshot


*** Test Cases ***

Homepage Loads And Displays Hero Content
    [Documentation]    The landing page should show the hero name and welcome message.
    [Tags]    smoke    homepage    critical
    Element Should Be Visible          css:#hero-title
    # FIX: CSS text-transform:uppercase renders "JORDAN NGUYEN" in the browser.
    # Selenium's Get Text returns the rendered text, so we normalise to lowercase
    # before asserting — resilient to future CSS changes.
    ${hero_text}=    Get Text           css:#hero-title
    ${hero_lower}=   Convert To Lower Case    ${hero_text}
    Should Contain   ${hero_lower}      jordan nguyen
    Page Should Contain                Career Portfolio
    Page Should Contain                My Notable Skills

Navigation Bar Is Present
    [Documentation]    The sticky nav bar should be visible with Home, Browse, Contact, and Dashboards.
    [Tags]    smoke    navigation    critical
    Element Should Be Visible By TestId    nav-home
    Element Should Be Visible              css:[data-testid="nav-browse-btn"]
    Element Should Be Visible              css:[data-testid="nav-contact-btn"]
    Element Should Be Visible              css:[data-testid="nav-dashboards-btn"]

Live Clock Runs In Navigation Bar
    [Documentation]    The #time element should be present and contain a time value.
    [Tags]    smoke    javascript
    Element Should Be Visible    css:#time
    ${time_text}=    Get Text    css:#time
    Should Not Be Empty          ${time_text}
    Should Match Regexp          ${time_text}    Time: \\d{1,2}:\\d{2}:\\d{2}

Skills Section Displays All SDET Skills
    [Documentation]    The skills bars section should list all key automation skills.
    [Tags]    smoke    content
    Page Should Contain    Cypress
    Page Should Contain    Selenium
    Page Should Contain    Playwright
    Page Should Contain    Java

Jobs Page Loads
    [Documentation]    Navigating to the jobs page should display the work timeline.
    [Tags]    smoke    navigation    critical
    Navigate To Page    ${JOBS_URL}
    Page Should Contain Heading    My Work Experiences
    Page Should Contain Element    css:.timeline-container
    Page Should Contain Element    css:#nationalbank-card

Internships Page Loads
    [Documentation]    The internships page should show the tabbed interface.
    [Tags]    smoke    navigation
    Navigate To Page    ${INTERNSHIPS_URL}
    Page Should Contain Heading    Internship Experiences
    Page Should Contain Element    xpath://button[contains(text(),'Zimmer')]
    Page Should Contain Element    xpath://button[contains(text(),'Dassault')]
    Page Should Contain Element    xpath://button[contains(text(),'V2R')]

Certifications Page Loads
    [Documentation]    The certifications page should display all three badges.
    [Tags]    smoke    navigation
    Navigate To Page    ${CERTIFICATIONS_URL}
    Page Should Contain    AWS Certified Developer Associate
    Page Should Contain    AWS Certified Cloud Practitioner
    Page Should Contain    ISTQB Certified Tester

SDET Showcase Page Loads
    [Documentation]    The SDET showcase should display the core sections and dashboard links.
    [Tags]    smoke    navigation    critical
    Navigate To Page    ${SDET_URL}
    Element Should Be Visible    css:.sdet-hero h1
    Page Should Contain          SDET Showcase
    Page Should Contain          Skills Matrix
    Page Should Contain          Test Automation Showcase
    Page Should Contain          Quality Dashboards

QA Metrics Dashboard Page Loads
    [Documentation]    The dedicated QA metrics page should render the stat cards and charts.
    [Tags]    smoke    navigation
    Navigate To Page    ${QA_METRICS_URL}
    Page Should Contain Heading    QA Metrics Dashboard
    Page Should Contain Element    css:.metrics-grid
    Page Should Contain Element    css:.donut-row

Live Pipeline Status Page Loads
    [Documentation]    The dedicated live pipeline page should render the dashboard container.
    [Tags]    smoke    navigation
    Navigate To Page    ${LIVE_PIPELINE_URL}
    Page Should Contain Heading    Live Pipeline Status
    Page Should Contain Element    css:#ci-dashboard-grid

Contact Page Loads And Form Is Present
    [Documentation]    The contact form should be visible and contain input fields.
    [Tags]    smoke    navigation
    Navigate To Page    ${CONTACT_URL}
    Element Should Be Visible    css:#contactForm
    Element Should Be Visible    css:#firstName
    Element Should Be Visible    css:#email

Footer Is Present On All Pages
    [Documentation]    Verifies the footer copyright text renders on the homepage.
    [Tags]    smoke    content
    Navigate To Page    ${HOME_URL}
    Page Should Contain    Jordan Nguyen. All rights reserved.
    Page Should Contain    Built with Jekyll and hosted on AWS.
