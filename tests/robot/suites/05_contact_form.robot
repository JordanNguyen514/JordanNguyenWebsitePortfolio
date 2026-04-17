# ============================================================
#  tests/robot/suites/05_contact_form.robot
#
#  Tests for the contact form — field validation and submission.
#
#  NOTE: The happy-path submission test (form → Lambda → success)
#  is tagged @api and skipped in local runs by default, since it
#  requires a live AWS Lambda and sends a real email.
#  It runs in CI against the production CloudFront URL.
#
#  To run all tests including @api locally:
#    robot --include api tests/robot/suites/05_contact_form.robot
# ============================================================

*** Settings ***
Documentation     Contact form tests — rendering, validation, and submission.

Resource          ../resources/common.resource
Resource          ../resources/variables.resource

Suite Setup       Open Browser Session    ${CONTACT_URL}
Suite Teardown    Close Browser Session
Test Teardown     Run Keyword If Test Failed    Capture Page Screenshot


*** Test Cases ***

Contact Form Renders All Required Fields
    [Documentation]    All form fields must be present and visible on load.
    [Tags]    contact    smoke
    Navigate To Page    ${CONTACT_URL}
    Element Should Be Visible    css:#firstName
    Element Should Be Visible    css:#lastName
    Element Should Be Visible    css:#email
    Element Should Be Visible    css:#Message
    Element Should Be Visible    css:.SubBtn

Purpose Radio Buttons Are All Present
    [Documentation]    The form should offer Academics, Professional, and Others options.
    [Tags]    contact    form-fields
    Navigate To Page    ${CONTACT_URL}
    Page Should Contain Element    css:#Academics
    Page Should Contain Element    css:#Professional
    Page Should Contain Element    css:#others

User Can Fill All Form Fields
    [Documentation]    All fields accept text input without errors.
    [Tags]    contact    interaction
    Navigate To Page    ${CONTACT_URL}
    Input Text       css:#firstName    ${CONTACT_FIRST_NAME}
    Input Text       css:#lastName     ${CONTACT_LAST_NAME}
    Input Text       css:#email        ${CONTACT_EMAIL}
    Input Text       css:#Message      ${CONTACT_MESSAGE}
    Select Radio Button    Purpose    P
    Textfield Value Should Be    css:#firstName    ${CONTACT_FIRST_NAME}
    Textfield Value Should Be    css:#lastName     ${CONTACT_LAST_NAME}
    Textfield Value Should Be    css:#email        ${CONTACT_EMAIL}

Email Field Rejects Invalid Format
    [Documentation]    HTML5 email validation should prevent submission of
    ...                an address without the @ symbol.
    [Tags]    contact    validation
    Navigate To Page    ${CONTACT_URL}
    Input Text       css:#firstName    Robot
    Input Text       css:#lastName     Test
    Input Text       css:#email        invalid-email-no-at
    Input Text       css:#Message      Test message
    Select Radio Button    Purpose    P
    Click Element    css:.SubBtn
    # HTML5 validation prevents submission — form response should NOT appear
    Element Should Not Be Visible    css:#formResponse

Form Response Element Exists In DOM
    [Documentation]    The #formResponse div should exist (even if hidden) —
    ...                it's the element the Lambda response populates.
    [Tags]    contact    structure
    Navigate To Page    ${CONTACT_URL}
    Page Should Contain Element    css:#formResponse

Full Form Submission Reaches Lambda And Shows Success
    [Documentation]    End-to-end: fills all fields, submits, and waits for
    ...                the success message from AWS Lambda.
    ...                Skipped locally — runs in CI against production only.
    [Tags]    contact    api    e2e
    Navigate To Page    ${CONTACT_URL}
    Input Text          css:#firstName    ${CONTACT_FIRST_NAME}
    Input Text          css:#lastName     ${CONTACT_LAST_NAME}
    Input Text          css:#email        ${CONTACT_EMAIL}
    Input Text          css:#number       ${CONTACT_PHONE}
    Input Text          css:#Message      ${CONTACT_MESSAGE}
    Select Radio Button    Purpose    P
    Click Element       css:.SubBtn
    Wait Until Element Is Visible    css:#formResponse    timeout=15s
    Element Should Contain           css:#formResponse    Message sent successfully
