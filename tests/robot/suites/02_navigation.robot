# ============================================================
#  tests/robot/suites/02_navigation.robot
#
#  Tests for the navigation bar dropdowns and routing.
# ============================================================

*** Settings ***
Documentation     Navigation bar tests — dropdowns, routing, and link verification.

Resource          ../resources/common.resource
Resource          ../resources/variables.resource

Suite Setup       Open Browser Session    ${HOME_URL}
Suite Teardown    Close Browser Session
Test Teardown     Run Keyword If Test Failed    Capture Page Screenshot


*** Test Cases ***

Browse Dropdown Opens And Shows All Links
    [Documentation]    Clicking Browse reveals Experience, Academics,
    ...                Certifications, and SDET Showcase.
    [Tags]    navigation    dropdown
    Navigate To Page    ${HOME_URL}
    Open Browse Dropdown
    Element Should Be Visible By TestId    nav-experience
    Element Should Be Visible By TestId    nav-academics
    Element Should Be Visible By TestId    nav-certifications
    Element Should Be Visible By TestId    nav-sdet
    Close Dropdown

Contact Dropdown Opens And Shows All Links
    [Documentation]    Clicking Contact reveals Email Form and Recruiter.
    [Tags]    navigation    dropdown
    Navigate To Page    ${HOME_URL}
    Open Contact Dropdown
    Element Should Be Visible By TestId    nav-email-form
    Element Should Be Visible By TestId    nav-recruiter-contact
    Close Dropdown

Dashboards Dropdown Opens And Shows All Links
    [Documentation]    Clicking Dashboards reveals the unified quality dashboard.
    [Tags]    navigation    dropdown
    Navigate To Page    ${HOME_URL}
    Open Dashboards Dropdown
    Element Should Be Visible By TestId    nav-dashboard
    Close Dropdown

Home Link Navigates To Homepage
    [Tags]    navigation    routing
    Navigate To Page    ${EXPERIENCE_URL}
    # FIX: Click Element fires Selenium click which triggers the document-level
    # "close dropdown on any click" handler BEFORE the <a> link navigates.
    # Execute Javascript bypasses event bubbling entirely and fires the click
    # directly on the element — reliable in headless Chrome.
    Execute Javascript    document.querySelector('[data-testid="nav-home"]').click()
    Wait Until Location Is    ${HOME_URL}    timeout=${TIMEOUT}

Browse Dropdown Experience Link Routes Correctly
    [Tags]    navigation    routing
    Navigate To Page    ${HOME_URL}
    Open Browse Dropdown
    # FIX: JS click bypasses dropdown close-on-click event handler
    Execute Javascript    document.querySelector('[data-testid="nav-experience"]').click()
    Wait Until Location Contains    /assets/html/work-experience.html    timeout=${TIMEOUT}
    Page Should Contain Heading    Work Experience

Browse Dropdown Certifications Link Routes Correctly
    [Tags]    navigation    routing
    Navigate To Page    ${HOME_URL}
    Open Browse Dropdown
    Execute Javascript    document.querySelector('[data-testid="nav-certifications"]').click()
    Wait Until Location Contains    /assets/html/certifications.html    timeout=${TIMEOUT}
    Page Should Contain    My Certifications

SDET Showcase Link Routes Correctly
    [Documentation]    The highlighted SDET link in the Browse dropdown
    ...                should navigate to the SDET showcase page.
    [Tags]    navigation    routing    sdet
    Navigate To Page    ${HOME_URL}
    Open Browse Dropdown
    Execute Javascript    document.querySelector('[data-testid="nav-sdet"]').click()
    Wait Until Location Contains    /assets/html/sdet.html    timeout=${TIMEOUT}

Email Dropdown Link Routes Correctly
    [Tags]    navigation    routing
    Navigate To Page    ${HOME_URL}
    Open Contact Dropdown
    Execute Javascript    document.querySelector('[data-testid="nav-email-form"]').click()
    Wait Until Location Contains    /assets/html/emailing.html    timeout=${TIMEOUT}

Dashboards Dropdown Quality Dashboard Link Routes Correctly
    [Tags]    navigation    routing    dashboards
    Navigate To Page    ${HOME_URL}
    Open Dashboards Dropdown
    Execute Javascript    document.querySelector('[data-testid="nav-dashboard"]').click()
    Wait Until Location Contains    /assets/html/live-pipeline-status.html    timeout=${TIMEOUT}
    Page Should Contain    Quality Dashboard

Career Portfolio Buttons Navigate Correctly
    [Documentation]    The homepage Career Portfolio buttons (Experience and Certifications)
    ...                should route correctly.
    [Tags]    navigation    homepage    routing
    Navigate To Page    ${HOME_URL}
    Execute Javascript    document.querySelector('[data-event-action="Click_Experience_Button"]').click()
    Wait Until Location Contains    /assets/html/work-experience.html    timeout=${TIMEOUT}
    Navigate To Page    ${HOME_URL}

    Execute Javascript    document.querySelector('[data-event-action="Click_Certifications_Button"]').click()
    Wait Until Location Contains    certifications.html    timeout=${TIMEOUT}
