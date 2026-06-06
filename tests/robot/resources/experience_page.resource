# ============================================================
#  tests/robot/resources/experience_page.resource
# ============================================================

*** Settings ***
Resource    common.resource
Resource    variables.resource

*** Keywords ***

Open Experience Page
    Navigate To Page    ${EXPERIENCE_URL}
    Wait Until Element Is Visible    css:#work-experience-page    timeout=${TIMEOUT}
    Page Should Contain Heading    Work Experience

Expand Job Card
    [Documentation]    Clicks "More Details" on a specific job card by its testid.
    [Arguments]    ${card_testid}
    Scroll To Element    css:[data-testid="${card_testid}"]
    Wait For Element And Click    css:[data-testid="${card_testid}"]
    Element Should Contain    css:[data-testid="${card_testid}"]    Hide Details

Collapse Job Card
    [Documentation]    Clicks "Hide Details" to collapse a job card.
    [Arguments]    ${card_testid}
    Wait For Element And Click    css:[data-testid="${card_testid}"]
    Element Should Contain    css:[data-testid="${card_testid}"]    More Details

Job Card Details Should Be Visible
    [Arguments]    ${card_id}
    Element Should Be Visible    css:#${card_id} .project-summary

Job Card Details Should Be Hidden
    [Arguments]    ${card_id}
    Element Should Not Be Visible    css:#${card_id} .project-summary

All Job Cards Should Be Present
    Page Should Contain Element    css:#kinova-card
    Page Should Contain Element    css:#novo-card
    Page Should Contain Element    css:#logibec-card
    Page Should Contain Element    css:#nationalbank-card
    Page Should Contain Element    css:#deloitte-card

Switch To Internship Tab
    [Arguments]    ${tab_label}
    ${tab_locator}=    Set Variable    xpath://button[contains(@class,'tab-button') and contains(text(),'${tab_label}')]
    Wait For Element And Click    ${tab_locator}
    ${content_id}=    Evaluate    '${tab_label}'.lower()
    Wait Until Element Is Visible    css:#${content_id}    timeout=${SHORT_WAIT}

Tab Content Should Be Active
    [Arguments]    ${tab_id}
    Element Should Be Visible    css:#${tab_id}

Tab Content Should Be Hidden
    [Arguments]    ${tab_id}
    Element Should Not Be Visible    css:#${tab_id}

Expand Internship Details
    [Arguments]    ${tab_id}
    Wait For Element And Click    css:#${tab_id} .toggle-button
    Element Should Contain    css:#${tab_id} .toggle-button    Hide Details

Collapse Internship Details
    [Arguments]    ${tab_id}
    Wait For Element And Click    css:#${tab_id} .toggle-button
    Element Should Contain    css:#${tab_id} .toggle-button    More Details
