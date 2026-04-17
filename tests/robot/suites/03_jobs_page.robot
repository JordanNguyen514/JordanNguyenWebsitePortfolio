# ============================================================
#  tests/robot/suites/03_jobs_page.robot
#
#  Tests for the Jobs timeline — expand/collapse interactions.
#
#  CONCEPT — Data-Driven Testing with Templates
#  ---------------------------------------------
#  The "Expand And Collapse Job Card" test uses a Robot Framework
#  Template — this is equivalent to @pytest.mark.parametrize
#  or Cucumber's Scenario Outline / Examples table.
#
#  One test definition runs MULTIPLE times with different data
#  rows. Each row appears as a separate test in the report.
#  This tests ALL four job cards with a single keyword, which
#  is much cleaner than repeating the same steps four times.
# ============================================================

*** Settings ***
Documentation     Jobs page tests — timeline rendering and card expand/collapse.

Resource          ../resources/common.resource
Resource          ../resources/variables.resource
Resource          ../resources/jobs_page.resource

Suite Setup       Open Browser Session    ${JOBS_URL}
Suite Teardown    Close Browser Session
Test Teardown     Run Keyword If Test Failed    Capture Page Screenshot


*** Test Cases ***

Jobs Page Shows Work Experience Timeline
    [Documentation]    The page title and all four job cards must be present.
    [Tags]    jobs    smoke
    Open Jobs Page
    All Job Cards Should Be Present
    Page Should Contain    Kinova
    Page Should Contain    Novo
    Page Should Contain    Logibec
    Page Should Contain    National Bank

# ── Data-Driven Test ──────────────────────────────────────────────────────────
# Each row below runs as a separate test case in the report:
#   "Expand And Collapse Job Card: kinova-toggle | kinova-card"
#   "Expand And Collapse Job Card: novo-toggle | novo-card"
#   etc.

Expand And Collapse Job Card
    [Documentation]    Verifies that each job card expands to show details
    ...                and collapses back to hide them.
    [Tags]    jobs    interaction    data-driven
    [Template]    Verify Job Card Toggle Behaviour
    # testid            card_id
    kinova-toggle       kinova-card
    novo-toggle         novo-card
    logibec-toggle      logibec-card
    nationalbank-toggle    nationalbank-card

SDET Role Is Highlighted In National Bank Card
    [Documentation]    The most recent and relevant role should be easily findable.
    [Tags]    jobs    content
    Navigate To Page    ${JOBS_URL}
    Scroll To Element              css:#nationalbank-card
    Page Should Contain            National Bank
    Page Should Contain            SDET
    Expand Job Card                nationalbank-toggle
    Job Card Details Should Be Visible    nationalbank-card
    Element Should Contain         css:#nationalbank-card .project-summary    Java
    Element Should Contain         css:#nationalbank-card .project-summary    Docker
    Element Should Contain         css:#nationalbank-card .project-summary    Cucumber

Bold Tags Render In Job Details
    [Documentation]    Markdown was previously rendering as literal asterisks.
    ...                Verifies **Java** etc. now show as bold HTML, not asterisks.
    [Tags]    jobs    content    regression
    Navigate To Page    ${JOBS_URL}
    Expand Job Card    nationalbank-toggle
    # If bold rendered correctly, <strong> tag exists, no literal ** in text
    Page Should Not Contain    **Java**
    Page Should Not Contain    **Docker**
    Page Should Contain Element    css:#nationalbank-card strong


*** Keywords ***

Verify Job Card Toggle Behaviour
    [Documentation]    Template keyword — opens a card, checks it's visible,
    ...                then closes it and checks it's hidden.
    [Arguments]    ${toggle_testid}    ${card_id}
    Navigate To Page          ${JOBS_URL}
    # Initially collapsed
    Job Card Details Should Be Hidden     ${card_id}
    # Expand
    Expand Job Card           ${toggle_testid}
    Job Card Details Should Be Visible    ${card_id}
    # Collapse
    Collapse Job Card         ${toggle_testid}
    Job Card Details Should Be Hidden     ${card_id}
