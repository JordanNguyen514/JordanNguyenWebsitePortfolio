# ============================================================
#  tests/robot/resources/internships_page.resource
# ============================================================

*** Settings ***
Resource    common.resource
Resource    variables.resource


*** Keywords ***

Open Internships Page
    Navigate To Page    ${INTERNSHIPS_URL}
    Wait Until Element Is Visible    css:#internship-portfolio    timeout=${TIMEOUT}
    Page Should Contain Heading    Internship Experiences

Switch To Internship Tab
    [Documentation]    Clicks a tab button by label and waits for content to show.
    [Arguments]    ${tab_label}
    ${tab_locator}=    Set Variable    xpath://button[contains(@class,'tab-button') and contains(text(),'${tab_label}')]
    Wait For Element And Click    ${tab_locator}
    ${content_id}=    Evaluate    '${tab_label}'.lower()
    Wait Until Element Is Visible    css:#${content_id}    timeout=${SHORT_WAIT}

Tab Content Should Be Active
    [Documentation]    Verifies a tab's content panel is visible (display:block).
    [Arguments]    ${tab_id}
    Element Should Be Visible    css:#${tab_id}

Tab Content Should Be Hidden
    [Documentation]    Verifies a tab's content panel is hidden.
    [Arguments]    ${tab_id}
    Element Should Not Be Visible    css:#${tab_id}

Expand Internship Details
    [Documentation]    Clicks the More Details toggle within a specific tab.
    [Arguments]    ${tab_id}
    Wait For Element And Click    css:#${tab_id} .toggle-button
    Element Should Contain    css:#${tab_id} .toggle-button    Hide Details

Collapse Internship Details
    [Arguments]    ${tab_id}
    Wait For Element And Click    css:#${tab_id} .toggle-button
    Element Should Contain    css:#${tab_id} .toggle-button    More Details
