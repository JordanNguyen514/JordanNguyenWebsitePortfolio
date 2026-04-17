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

SDET Page Displays All Four Section Headings
    [Tags]    sdet    smoke
    Navigate To Page    ${SDET_URL}
    Element Should Be Visible    css:.sdet-hero h1
    Element Should Contain       css:.sdet-hero h1    SDET Showcase
    Page Should Contain    Skills Matrix
    Page Should Contain    Test Automation Showcase
    Page Should Contain    CI/CD Pipeline
    Page Should Contain    QA Metrics Dashboard

Skills Matrix Displays All Six Skill Categories
    [Tags]    sdet    skills-matrix
    Navigate To Page    ${SDET_URL}
    Scroll To Element    css:.skills-matrix-grid
    Page Should Contain    Test Automation
    Page Should Contain    Languages
    Page Should Contain    CI/CD
    Page Should Contain    Tools
    Page Should Contain    QA Methodologies
    Page Should Contain    Standards

Skills Matrix Contains Key SDET Technologies
    [Documentation]    Verifies the tools most relevant to SDET roles are listed.
    [Tags]    sdet    skills-matrix    content
    Navigate To Page    ${SDET_URL}
    Page Should Contain    Cypress
    Page Should Contain    Selenium
    Page Should Contain    Playwright
    Page Should Contain    Cucumber / BDD
    Page Should Contain    GitHub Actions
    Page Should Contain    Docker
    Page Should Contain    ISTQB

Automation Showcase Tabs Are All Present And Clickable
    [Documentation]    The code viewer tabs (smoke, contact, jobs, Selenium, Playwright)
    ...                should all be present and switch the active panel.
    [Tags]    sdet    tabs    interaction
    Navigate To Page    ${SDET_URL}
    Scroll To Element    css:.showcase-tabs
    # Default tab (smoke) should be active
    Element Should Be Visible    css:#tab-smoke.active

    # Switch to Selenium tab
    Wait For Element And Click    xpath://button[contains(text(),'Selenium')]
    Element Should Be Visible    css:#tab-selenium.active
    Element Should Not Be Visible    css:#tab-smoke.active

    # Switch to Playwright tab
    Wait For Element And Click    xpath://button[contains(text(),'Playwright')]
    Element Should Be Visible    css:#tab-playwright.active

CI/CD Pipeline Diagram Renders All Eight Stages
    [Documentation]    All pipeline stages from Git Push to Artifacts should be visible.
    [Tags]    sdet    cicd-diagram
    Navigate To Page    ${SDET_URL}
    Scroll To Element    css:.pipeline-wrapper
    Page Should Contain    Git Push
    Page Should Contain    GH Actions
    Page Should Contain    Jekyll Build
    Page Should Contain    Deploy
    Page Should Contain    CloudFront
    Page Should Contain    Cypress E2E
    Page Should Contain    Artifacts

QA Metrics Dashboard Shows All Five Stat Cards
    [Documentation]    The five metric cards should display numeric values.
    [Tags]    sdet    metrics
    Navigate To Page    ${SDET_URL}
    Scroll To Element    css:.metrics-grid
    Page Should Contain    Total Automated Tests
    Page Should Contain    Overall Pass Rate
    Page Should Contain    Defects Reported
    Page Should Contain    Avg. Suite Runtime
    Page Should Contain    CI/CD Pipeline Runs

Certifications Page Shows Three Badges
    [Tags]    certifications    content
    Navigate To Page    ${CERTIFICATIONS_URL}
    Page Should Contain    AWS Certified Developer Associate
    Page Should Contain    AWS Certified Cloud Practitioner
    Page Should Contain    ISTQB Certified Tester
    Page Should Contain    February 26, 2026
    Page Should Contain Element    css:.badge-img
