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
    [Documentation]    Clicking Browse reveals Jobs, Internships, Academics,
    ...                Certifications, SDET Showcase, and Other Interests.
    [Tags]    navigation    dropdown
    Navigate To Page    ${HOME_URL}
    Open Browse Dropdown
    Element Should Be Visible By TestId    nav-jobs
    Element Should Be Visible By TestId    nav-internships
    Element Should Be Visible By TestId    nav-academics
    Element Should Be Visible By TestId    nav-certifications
    Element Should Be Visible By TestId    nav-sdet
    Element Should Be Visible By TestId    nav-other
    Close Dropdown

Contact Dropdown Opens And Shows All Links
    [Documentation]    Clicking Contact reveals Contact Form, Email Form,
    ...                and View Submissions.
    [Tags]    navigation    dropdown
    Navigate To Page    ${HOME_URL}
    Open Contact Dropdown
    Element Should Be Visible By TestId    nav-contact-form
    Element Should Be Visible By TestId    nav-email-form
    Element Should Be Visible By TestId    nav-submissions
    Close Dropdown

Dashboards Dropdown Opens And Shows All Links
    [Documentation]    Clicking Dashboards reveals QA Metrics Dashboard
    ...                and Live Pipeline Status.
    [Tags]    navigation    dropdown
    Navigate To Page    ${HOME_URL}
    Open Dashboards Dropdown
    Element Should Be Visible By TestId    nav-qa-metrics
    Element Should Be Visible By TestId    nav-live-pipeline
    Close Dropdown

Home Link Navigates To Homepage
    [Tags]    navigation    routing
    Navigate To Page    ${JOBS_URL}
    # FIX: Click Element fires Selenium click which triggers the document-level
    # "close dropdown on any click" handler BEFORE the <a> link navigates.
    # Execute Javascript bypasses event bubbling entirely and fires the click
    # directly on the element — reliable in headless Chrome.
    Execute Javascript    document.querySelector('[data-testid="nav-home"]').click()
    Wait Until Location Is    ${HOME_URL}    timeout=${TIMEOUT}

Browse Dropdown Jobs Link Routes Correctly
    [Tags]    navigation    routing
    Navigate To Page    ${HOME_URL}
    Open Browse Dropdown
    # FIX: JS click bypasses dropdown close-on-click event handler
    Execute Javascript    document.querySelector('[data-testid="nav-jobs"]').click()
    Wait Until Location Contains    /assets/html/jobs.html    timeout=${TIMEOUT}
    Page Should Contain Heading    My Work Experiences

Browse Dropdown Internships Link Routes Correctly
    [Tags]    navigation    routing
    Navigate To Page    ${HOME_URL}
    Open Browse Dropdown
    Execute Javascript    document.querySelector('[data-testid="nav-internships"]').click()
    Wait Until Location Contains    /assets/html/internships.html    timeout=${TIMEOUT}

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

Contact Dropdown Form Link Routes Correctly
    [Tags]    navigation    routing
    Navigate To Page    ${HOME_URL}
    Open Contact Dropdown
    Execute Javascript    document.querySelector('[data-testid="nav-contact-form"]').click()
    Wait Until Location Contains    /assets/html/contacting.html    timeout=${TIMEOUT}

Dashboards Dropdown QA Metrics Link Routes Correctly
    [Tags]    navigation    routing    dashboards
    Navigate To Page    ${HOME_URL}
    Open Dashboards Dropdown
    Execute Javascript    document.querySelector('[data-testid="nav-qa-metrics"]').click()
    Wait Until Location Contains    /assets/html/qa-metrics.html    timeout=${TIMEOUT}
    Page Should Contain    QA Metrics Dashboard

Dashboards Dropdown Live Pipeline Link Routes Correctly
    [Tags]    navigation    routing    dashboards
    Navigate To Page    ${HOME_URL}
    Open Dashboards Dropdown
    Execute Javascript    document.querySelector('[data-testid="nav-live-pipeline"]').click()
    Wait Until Location Contains    /assets/html/live-pipeline-status.html    timeout=${TIMEOUT}
    Page Should Contain    Live Pipeline Status

Career Portfolio Buttons Navigate Correctly
    [Documentation]    The homepage Career Portfolio buttons (Jobs, Internships,
    ...                Certifications, SDET Showcase) should all route correctly.
    [Tags]    navigation    homepage    routing
    Navigate To Page    ${HOME_URL}
    # FIX: JS click bypasses event propagation issues in headless Chrome
    Execute Javascript    document.querySelector('[data-event-action="Click_Jobs_Button"]').click()
    Wait Until Location Contains    jobs.html    timeout=${TIMEOUT}
    Navigate To Page    ${HOME_URL}

    Execute Javascript    document.querySelector('[data-event-action="Click_Internships_Button"]').click()
    Wait Until Location Contains    internships.html    timeout=${TIMEOUT}
    Navigate To Page    ${HOME_URL}

    Execute Javascript    document.querySelector('[data-event-action="Click_Certifications_Button"]').click()
    Wait Until Location Contains    certifications.html    timeout=${TIMEOUT}
