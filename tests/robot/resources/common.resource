# ============================================================
#  tests/robot/resources/common.resource
#
#  FIXES APPLIED:
#  1. Added "Library  OperatingSystem" — required for
#     "Get Environment Variable". Without it Robot throws
#     "No keyword with name 'Get Environment Variable'".
#
#  2. Changed "Library SeleniumLibrary timeout=${TIMEOUT}"
#     to hardcoded "15s". Robot resolves Library arguments
#     at IMPORT time, before Resource files load — so
#     ${TIMEOUT} from variables.resource is undefined then.
#
#  3. Open Browse/Contact Dropdown now uses JavaScript to
#     add .open class instead of relying on CSS :hover.
#     Headless Chrome does not trigger :hover on click().
# ============================================================

*** Settings ***
Library     SeleniumLibrary    timeout=15s    implicit_wait=0s
Library     OperatingSystem
Resource    variables.resource


*** Keywords ***

Open Browser Session
    [Documentation]    Opens Chrome (headless in CI via HEADLESS=true env var).
    [Arguments]    ${url}=${HOME_URL}
    ${headless}=    Get Environment Variable    HEADLESS    default=false
    IF    '${headless}' == 'true'
        ${options}=    Evaluate
        ...    sys.modules['selenium.webdriver'].ChromeOptions()
        ...    sys
        # FIX: Assign each flag to a variable before calling Call Method.
        # Robot Framework parses arguments containing '=' as named (keyword)
        # arguments — e.g. --headless=new is interpreted as named arg
        # '--headless' with value 'new', causing TypeError at runtime.
        # Using a variable forces positional string passing.
        ${arg_headless}=    Set Variable    --headless=new
        ${arg_sandbox}=     Set Variable    --no-sandbox
        ${arg_shm}=         Set Variable    --disable-dev-shm-usage
        ${arg_gpu}=         Set Variable    --disable-gpu
        ${arg_size}=        Set Variable    --window-size=1280,800
        Call Method    ${options}    add_argument    ${arg_headless}
        Call Method    ${options}    add_argument    ${arg_sandbox}
        Call Method    ${options}    add_argument    ${arg_shm}
        Call Method    ${options}    add_argument    ${arg_gpu}
        Call Method    ${options}    add_argument    ${arg_size}
        Create WebDriver    Chrome    options=${options}
    ELSE
        Open Browser    ${url}    ${BROWSER}
        Maximize Browser Window
    END
    Run Keyword If    '${headless}' == 'true'    Go To    ${url}
    Set Selenium Timeout    ${TIMEOUT}
    Set Selenium Implicit Wait    0s

Close Browser Session
    Run Keyword If Test Failed    Capture Page Screenshot
    Close Browser

Navigate To Page
    [Arguments]    ${url}
    Go To    ${url}
    Wait Until Page Contains Element    css:body    timeout=${TIMEOUT}

Open Browse Dropdown
    [Documentation]    Uses JS to show dropdown — CSS :hover doesn't fire on click() in headless Chrome.
    Execute Javascript    document.querySelector('[data-testid="nav-browse-btn"]').closest('.nav-dropdown').classList.add('open')
    Wait Until Element Is Visible    css:.nav-dropdown.open .dropdown-menu    timeout=${SHORT_WAIT}

Open Contact Dropdown
    Execute Javascript    document.querySelector('[data-testid="nav-contact-btn"]').closest('.nav-dropdown').classList.add('open')
    Wait Until Element Is Visible    css:.nav-dropdown.open .dropdown-menu    timeout=${SHORT_WAIT}

Close Dropdown
    Execute Javascript    document.querySelectorAll('.nav-dropdown').forEach(el => el.classList.remove('open'))

Page Should Contain Heading
    [Arguments]    ${heading_text}
    Page Should Contain    ${heading_text}

Element Should Be Visible By TestId
    [Arguments]    ${testid}
    Element Should Be Visible    css:[data-testid="${testid}"]

Element Should Contain Text By TestId
    [Arguments]    ${testid}    ${expected_text}
    Element Should Contain    css:[data-testid="${testid}"]    ${expected_text}

Wait For Element And Click
    [Arguments]    ${locator}
    Wait Until Element Is Visible    ${locator}    timeout=${TIMEOUT}
    Click Element    ${locator}

Scroll To Element
    [Arguments]    ${locator}
    Scroll Element Into View    ${locator}
    Wait Until Element Is Visible    ${locator}

Take Named Screenshot
    [Arguments]    ${name}
    Capture Page Screenshot    filename=${name}.png
