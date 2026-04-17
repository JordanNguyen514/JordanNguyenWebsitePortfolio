# ============================================================
#  tests/robot/resources/common.resource
#
#  Shared keywords used across all test suites.
#  Handles browser lifecycle, navigation, and utility actions.
#
#  CONCEPT — Robot Framework Keywords
#  ------------------------------------
#  Keywords are reusable named actions, similar to functions.
#  They abstract SeleniumLibrary calls into readable English
#  steps, making test suites look like plain-English specs:
#
#    Open Portfolio Homepage
#    Verify Hero Title Is Visible
#    Close Browser Session
#
#  This is the "keyword-driven" testing approach — one of the
#  core patterns Robot Framework is known for, and a key
#  talking point for SDET/QA consultant interviews.
# ============================================================

*** Settings ***
Library     SeleniumLibrary    timeout=${TIMEOUT}    implicit_wait=0s
Resource    variables.resource


*** Keywords ***

# ── Browser lifecycle ──────────────────────────────────────────────────────────

Open Browser Session
    [Documentation]    Opens Chrome (headless in CI) and maximises the window.
    ...                Reads HEADLESS env var — set automatically in CI workflow.
    [Arguments]    ${url}=${HOME_URL}
    ${headless}=    Get Environment Variable    HEADLESS    default=false
    IF    '${headless}' == 'true'
        ${options}=    Evaluate
        ...    sys.modules['selenium.webdriver'].ChromeOptions()
        ...    sys
        Call Method    ${options}    add_argument    --headless=new
        Call Method    ${options}    add_argument    --no-sandbox
        Call Method    ${options}    add_argument    --disable-dev-shm-usage
        Call Method    ${options}    add_argument    --disable-gpu
        Call Method    ${options}    add_argument    --window-size\=1280,800
        Create WebDriver    Chrome    options=${options}
    ELSE
        Open Browser    ${url}    ${BROWSER}
        Maximize Browser Window
    END
    Run Keyword If    '${headless}' == 'true'    Go To    ${url}
    Set Selenium Timeout    ${TIMEOUT}
    Set Selenium Implicit Wait    0s

Close Browser Session
    [Documentation]    Captures a final screenshot on failure, then closes.
    Run Keyword If Test Failed    Capture Page Screenshot
    Close Browser

Navigate To Page
    [Documentation]    Navigates to a URL and waits for the page to be ready.
    [Arguments]    ${url}
    Go To    ${url}
    Wait Until Page Contains Element    css:body    timeout=${TIMEOUT}

# ── Navigation interactions ────────────────────────────────────────────────────

Open Browse Dropdown
    [Documentation]    Clicks the Browse nav button to reveal the dropdown menu.
    Click Element    css:[data-testid="nav-browse-btn"]
    Wait Until Element Is Visible    css:.dropdown-menu    timeout=${SHORT_WAIT}

Open Contact Dropdown
    [Documentation]    Clicks the Contact nav button to reveal the dropdown menu.
    Click Element    css:[data-testid="nav-contact-btn"]
    Wait Until Element Is Visible    css:.dropdown-menu    timeout=${SHORT_WAIT}

Close Dropdown
    [Documentation]    Clicks the page body to dismiss any open dropdown.
    Click Element At Coordinates    css:body    0    0

# ── Assertions ─────────────────────────────────────────────────────────────────

Page Should Contain Heading
    [Documentation]    Verifies a heading text is present anywhere on the page.
    [Arguments]    ${heading_text}
    Page Should Contain    ${heading_text}

Element Should Be Visible By TestId
    [Documentation]    Finds an element by its data-testid attribute.
    [Arguments]    ${testid}
    Element Should Be Visible    css:[data-testid="${testid}"]

Element Should Contain Text By TestId
    [Documentation]    Verifies text within a data-testid element.
    [Arguments]    ${testid}    ${expected_text}
    Element Should Contain    css:[data-testid="${testid}"]    ${expected_text}

# ── Utilities ──────────────────────────────────────────────────────────────────

Wait For Element And Click
    [Documentation]    Waits until an element is clickable, then clicks it.
    [Arguments]    ${locator}
    Wait Until Element Is Visible    ${locator}    timeout=${TIMEOUT}
    Click Element    ${locator}

Scroll To Element
    [Documentation]    Scrolls the element into view before interacting.
    [Arguments]    ${locator}
    Scroll Element Into View    ${locator}
    Wait Until Element Is Visible    ${locator}

Take Named Screenshot
    [Documentation]    Takes a screenshot with a descriptive name for reports.
    [Arguments]    ${name}
    Capture Page Screenshot    filename=${name}.png
