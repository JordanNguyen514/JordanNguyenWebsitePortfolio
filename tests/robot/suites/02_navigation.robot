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

Home Link Navigates To Homepage
    [Tags]    navigation    routing
    Navigate To Page    ${JOBS_URL}
    Wait For Element And Click    css:[data-testid="nav-home"]
    Location Should Be    ${HOME_URL}

Browse Dropdown Jobs Link Routes Correctly
    [Tags]    navigation    routing
    Navigate To Page    ${HOME_URL}
    Open Browse Dropdown
    Wait For Element And Click    css:[data-testid="nav-jobs"]
    Location Should Contain    /assets/html/jobs.html
    Page Should Contain Heading    My Work Experiences

Browse Dropdown Internships Link Routes Correctly
    [Tags]    navigation    routing
    Navigate To Page    ${HOME_URL}
    Open Browse Dropdown
    Wait For Element And Click    css:[data-testid="nav-internships"]
    Location Should Contain    /assets/html/internships.html

Browse Dropdown Certifications Link Routes Correctly
    [Tags]    navigation    routing
    Navigate To Page    ${HOME_URL}
    Open Browse Dropdown
    Wait For Element And Click    css:[data-testid="nav-certifications"]
    Location Should Contain    /assets/html/certifications.html
    Page Should Contain    My Certifications

SDET Showcase Link Routes Correctly
    [Documentation]    The highlighted SDET link in the Browse dropdown
    ...                should navigate to the SDET showcase page.
    [Tags]    navigation    routing    sdet
    Navigate To Page    ${HOME_URL}
    Open Browse Dropdown
    Wait For Element And Click    css:[data-testid="nav-sdet"]
    Location Should Contain    /assets/html/sdet.html

Contact Dropdown Form Link Routes Correctly
    [Tags]    navigation    routing
    Navigate To Page    ${HOME_URL}
    Open Contact Dropdown
    Wait For Element And Click    css:[data-testid="nav-contact-form"]
    Location Should Contain    /assets/html/contacting.html

Career Portfolio Buttons Navigate Correctly
    [Documentation]    The homepage Career Portfolio buttons (Jobs, Internships,
    ...                Certifications, SDET Showcase) should all route correctly.
    [Tags]    navigation    homepage    routing
    Navigate To Page    ${HOME_URL}
    # Jobs button
    Wait For Element And Click    css:[data-event-action="Click_Jobs_Button"]
    Location Should Contain    jobs.html
    Go Back

    # Internships button
    Navigate To Page    ${HOME_URL}
    Wait For Element And Click    css:[data-event-action="Click_Internships_Button"]
    Location Should Contain    internships.html
    Go Back

    # Certifications button
    Navigate To Page    ${HOME_URL}
    Wait For Element And Click    css:[data-event-action="Click_Certifications_Button"]
    Location Should Contain    certifications.html
