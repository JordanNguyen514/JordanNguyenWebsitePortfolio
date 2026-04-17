# ============================================================
#  tests/robot/resources/jobs_page.resource
#
#  Page Object pattern — all Jobs page interactions live here.
#
#  CONCEPT — Page Object Model in Robot Framework
#  ------------------------------------------------
#  Instead of writing raw selectors in test suites, we wrap
#  them in keywords named after business actions:
#    "Expand Job Card"  not  "Click Element  css:#kinova-card .toggle-button"
#
#  This means if the selector changes, you fix ONE keyword,
#  not every test that uses it. This is exactly the same
#  principle as Java Page Object Model (Selenium) — just
#  expressed in Robot Framework keyword syntax.
# ============================================================

*** Settings ***
Resource    common.resource
Resource    variables.resource


*** Keywords ***

Open Jobs Page
    Navigate To Page    ${JOBS_URL}
    Wait Until Element Is Visible    css:#jobs-portfolio    timeout=${TIMEOUT}
    Page Should Contain Heading    My Work Experiences

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
    [Documentation]    Verifies the project-summary panel is expanded.
    [Arguments]    ${card_id}
    Element Should Be Visible    css:#${card_id} .project-summary

Job Card Details Should Be Hidden
    [Documentation]    Verifies the project-summary panel is collapsed.
    [Arguments]    ${card_id}
    Element Should Not Be Visible    css:#${card_id} .project-summary

All Job Cards Should Be Present
    Page Should Contain Element    css:#kinova-card
    Page Should Contain Element    css:#novo-card
    Page Should Contain Element    css:#logibec-card
    Page Should Contain Element    css:#nationalbank-card
