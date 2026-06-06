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
    # Get Text returns the rendered text; Should Contain with ignore_case=${True}
    # handles this without needing to import the String library.
    ${hero_text}=    Get Text           css:#hero-title
    Should Contain                     ${hero_text}    Jordan Nguyen    ignore_case=${True}
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

Work Experience Page Loads
    [Documentation]    The merged work experience page should display both jobs and internship sections.
    [Tags]    smoke    navigation    critical
    Navigate To Page    ${EXPERIENCE_URL}
    Page Should Contain Heading    Work Experience
    Page Should Contain Element    css:#jobs-portfolio
    Page Should Contain Element    css:#internship-portfolio
    Page Should Contain Element    css:#nationalbank-card
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
    [Documentation]    The SDET showcase should display the skills radar and dashboard link.
    [Tags]    smoke    navigation    critical
    Navigate To Page    ${SDET_URL}
    Element Should Be Visible    css:.radar-hero h1
    Page Should Contain          SDET Showcase
    Page Should Contain          Skills Proficiency
    Page Should Contain          Quality Dashboard

Quality Dashboard Page Loads
    [Documentation]    The unified dashboard page should render both QA metrics and live pipeline cards.
    [Tags]    smoke    navigation
    Navigate To Page    ${LIVE_PIPELINE_URL}
    Page Should Contain Heading    Quality Dashboard
    Page Should Contain Element    css:#ci-dashboard-grid
    Page Should Contain Element    css:.metric-card

Email Page Loads And Form Is Present
    [Documentation]    The email form should be visible and contain input fields.
    [Tags]    smoke    navigation
    Navigate To Page    ${EMAIL_URL}
    Element Should Be Visible    css:#emailForm
    Element Should Be Visible    css:#senderName
    Element Should Be Visible    css:#senderEmail

Footer Is Present On All Pages
    [Documentation]    Verifies the footer copyright text renders on the homepage.
    [Tags]    smoke    content
    Navigate To Page    ${HOME_URL}
    Page Should Contain    Jordan Nguyen. All rights reserved.
    Page Should Contain    Built with Jekyll and hosted on AWS.
