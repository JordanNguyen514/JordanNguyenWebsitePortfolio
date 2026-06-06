# ============================================================
#  tests/robot/suites/03_experience_page.robot
#
#  Tests for the merged Work Experience page, covering both professional
#  timeline and internship tabbed experience sections.
# ============================================================

*** Settings ***
Documentation     Work Experience page tests — professional timeline and internship tabs.

Resource          ../resources/common.resource
Resource          ../resources/variables.resource
Resource          ../resources/experience_page.resource

Suite Setup       Open Browser Session    ${EXPERIENCE_URL}
Suite Teardown    Close Browser Session
Test Teardown     Run Keyword If Test Failed    Capture Page Screenshot

*** Test Cases ***

Experience Page Shows All Career Content
    [Documentation]    The merged work experience page should show the timeline and internship sections.
    [Tags]    experience    smoke
    Open Experience Page
    Page Should Contain    My Work Experiences
    Page Should Contain    Internship Experiences
    Page Should Contain Element    css:#jobs-portfolio
    Page Should Contain Element    css:#internship-portfolio

Expand And Collapse Job Card
    [Documentation]    Verifies that each job card expands to show details and collapses back.
    [Tags]    experience    interaction    data-driven
    [Template]    Verify Job Card Toggle Behaviour
    # testid            card_id
    kinova-toggle       kinova-card
    novo-toggle         novo-card
    logibec-toggle      logibec-card
    nationalbank-toggle nationalbank-card
    deloitte-toggle     deloitte-card

Switch Internship Tabs And Verify Content
    [Documentation]    Each internship tab should open and reveal the correct content.
    [Tags]    experience    tabs
    Open Experience Page
    Switch To Internship Tab    Zimmer
    Tab Content Should Be Active   zimmer
    Switch To Internship Tab    Dassault
    Tab Content Should Be Active   dassault
    Switch To Internship Tab    V2R
    Tab Content Should Be Active   v2r

Internship Details Toggle Works For Each Tab
    [Documentation]    Each internship tab can expand and collapse its details section.
    [Tags]    experience    interaction
    Open Experience Page
    Switch To Internship Tab    Zimmer
    Expand Internship Details     zimmer
    Collapse Internship Details   zimmer
    Switch To Internship Tab    Dassault
    Expand Internship Details     dassault
    Collapse Internship Details   dassault
    Switch To Internship Tab    V2R
    Expand Internship Details     v2r
    Collapse Internship Details   v2r

SDET Role Is Highlighted In National Bank Card
    [Documentation]    The most recent role must be visible in the merged page content.
    [Tags]    experience    content
    Open Experience Page
    Scroll To Element              css:#nationalbank-card
    Page Should Contain            National Bank
    Page Should Contain            SDET
    Expand Job Card                nationalbank-toggle
    Job Card Details Should Be Visible    nationalbank-card
    Element Should Contain         css:#nationalbank-card .project-summary    Java
    Element Should Contain         css:#nationalbank-card .project-summary    Docker
    Element Should Contain         css:#nationalbank-card .project-summary    Cucumber

Bold Tags Render In Job Details
    [Documentation]    Verifies that markup in job details renders as bold HTML, not literal asterisks.
    [Tags]    experience    content    regression
    Open Experience Page
    Expand Job Card    nationalbank-toggle
    Page Should Not Contain    **Java**
    Page Should Not Contain    **Docker**
    Page Should Contain Element    css:#nationalbank-card strong

*** Keywords ***

Verify Job Card Toggle Behaviour
    [Documentation]    Opens a job card, verifies details appear, collapses it, and verifies details hide again.
    [Arguments]    ${toggle_testid}    ${card_id}
    Open Experience Page
    Job Card Details Should Be Hidden     ${card_id}
    Expand Job Card           ${toggle_testid}
    Job Card Details Should Be Visible    ${card_id}
    Collapse Job Card         ${toggle_testid}
    Job Card Details Should Be Hidden     ${card_id}
