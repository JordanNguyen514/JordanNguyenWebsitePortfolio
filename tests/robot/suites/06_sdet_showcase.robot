# ============================================================
#  tests/robot/suites/06_sdet_showcase.robot
#
#  Tests for the SDET Showcase page — the most important page
#  for recruiter-facing quality demonstration.
# ============================================================

*** Settings ***
Documentation     SDET Showcase page tests — skills matrix, code tabs, CI/CD diagram,
...               and QA metrics dashboard.

Resource          ../resources/common.resource
Resource          ../resources/variables.resource

Suite Setup       Open Browser Session    ${SDET_URL}
Suite Teardown    Close Browser Session
Test Teardown     Run Keyword If Test Failed    Capture Page Screenshot


*** Test Cases ***

SDET Page Displays Core Section Headings
    [Tags]    sdet    smoke
    Navigate To Page    ${SDET_URL}
    Element Should Be Visible    css:.radar-hero h1
    Element Should Contain       css:.radar-hero h1    SDET Showcase
    Page Should Contain    Skills Proficiency
    Page Should Contain    All Skills
    Page Should Contain    Quality Dashboard

Skills Radar Displays Category Filters
    [Tags]    sdet    skills-radar
    Navigate To Page    ${SDET_URL}
    Element Should Be Visible    css:.radar-tabs
    Page Should Contain    Test Automation
    Page Should Contain    CI / CD & Cloud
    Page Should Contain    Languages
    Page Should Contain    QA Practices

Quality Dashboard Card Is Available
    [Tags]    sdet    dashboard
    Navigate To Page    ${SDET_URL}
    Element Should Be Visible    css:[data-testid="nav-quality-dashboard"]
    Page Should Contain    Live QA Operations

CI/CD Pipeline Summary Is Visible
    [Documentation]    The SDET showcase should provide a live pipeline link and the current pipeline section summary.
    [Tags]    sdet    cicd-diagram
    Navigate To Page    ${SDET_URL}
    Element Should Be Visible    css:[data-testid="sdet-live-pipeline-link"]
    Page Should Contain    Live Pipeline Status
    Page Should Contain    View Full Live Pipeline Status

Quality Dashboard Page Shows Metrics And Pipeline Cards
    [Documentation]    The unified dashboard page should render QA metrics and live pipeline status together.
    [Tags]    sdet    metrics    ci-dashboard
    Navigate To Page    ${LIVE_PIPELINE_URL}
    Wait Until Page Contains Element    css:.metric-card    timeout=${TIMEOUT}
    Wait Until Page Contains Element    css:#ci-dashboard-grid    timeout=${TIMEOUT}
    Page Should Contain    Quality Dashboard
    Page Should Contain    Total Automated Tests
    Page Should Contain    Deploy to S3
    Page Should Contain Element    css:.ci-card

Certifications Page Shows Three Badges
    [Tags]    certifications    content
    Navigate To Page    ${CERTIFICATIONS_URL}
    Page Should Contain    AWS Certified Developer Associate
    Page Should Contain    AWS Certified Cloud Practitioner
    Page Should Contain    ISTQB Certified Tester
    Page Should Contain    February 26, 2026
    Page Should Contain Element    css:.badge-img
