# ============================================================
#  tests/robot/suites/04_internships.robot
#
#  Tests for the Internships tabbed interface.
# ============================================================

*** Settings ***
Documentation     Internships page tests — tab switching and detail toggles.

Resource          ../resources/common.resource
Resource          ../resources/variables.resource
Resource          ../resources/internships_page.resource

Suite Setup       Open Browser Session    ${INTERNSHIPS_URL}
Suite Teardown    Close Browser Session
Test Teardown     Run Keyword If Test Failed    Capture Page Screenshot


*** Test Cases ***

Internships Page Shows Three Company Tabs
    [Tags]    internships    smoke
    Open Internships Page
    Page Should Contain Element    xpath://button[contains(text(),'Zimmer')]
    Page Should Contain Element    xpath://button[contains(text(),'Dassault')]
    Page Should Contain Element    xpath://button[contains(text(),'V2R')]

Zimmer Tab Is Active By Default
    [Documentation]    Zimmer should be the first active tab on load.
    [Tags]    internships    tabs
    Open Internships Page
    Tab Content Should Be Active    zimmer

Switching To Dassault Tab Shows Dassault Content
    [Tags]    internships    tabs
    Open Internships Page
    Switch To Internship Tab    Dassault
    Tab Content Should Be Active     dassault
    Tab Content Should Be Hidden     zimmer

Switching To V2R Tab Shows V2R Content
    [Tags]    internships    tabs
    Open Internships Page
    Switch To Internship Tab    V2R
    Tab Content Should Be Active     v2r
    Tab Content Should Be Hidden     zimmer

All Tabs Can Be Expanded And Collapsed
    [Documentation]    Template — verifies each tab's toggle button works.
    [Tags]    internships    interaction    data-driven
    [Template]    Verify Internship Tab Toggle
    Zimmer     zimmer
    Dassault   dassault
    V2R        v2r


*** Keywords ***

Verify Internship Tab Toggle
    [Arguments]    ${tab_label}    ${tab_id}
    Open Internships Page
    Switch To Internship Tab      ${tab_label}
    Tab Content Should Be Active  ${tab_id}
    Expand Internship Details     ${tab_id}
    Collapse Internship Details   ${tab_id}
