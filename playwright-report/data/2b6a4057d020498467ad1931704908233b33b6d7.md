# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: portfolio.spec.ts >> Cross-Browser Smoke Tests >> SDET Showcase page renders all four sections
- Location: playwright\portfolio.spec.ts:68:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=CI/CD Pipeline')
Expected: visible
Error: strict mode violation: locator('text=CI/CD Pipeline') resolved to 3 elements:
    1) <p>A deep-dive into my software development engineer…</p> aka getByText('A deep-dive into my software')
    2) <h2 class="sdet-section-title">…</h2> aka getByRole('heading', { name: 'CI/CD Pipeline SECTION' })
    3) <span class="metric-label">CI/CD Pipeline Runs</span> aka getByText('CI/CD Pipeline Runs')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=CI/CD Pipeline')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - link "Home" [ref=e3] [cursor=pointer]:
      - /url: /
    - button "Browse" [ref=e5] [cursor=pointer]
    - button "Contact" [ref=e7] [cursor=pointer]
    - generic [ref=e8] [cursor=pointer]: "Time: 12:01:10"
    - generic [ref=e9] [cursor=pointer]: "Visitors: N/A"
  - button "↑" [ref=e10] [cursor=pointer]
  - generic [ref=e11]:
    - heading "SDET Showcase" [level=1] [ref=e12]
    - paragraph [ref=e13]: A deep-dive into my software development engineer in test expertise — covering automation frameworks, CI/CD pipelines, quality metrics, and the full testing lifecycle from unit to end-to-end.
  - generic [ref=e14]:
    - heading "Skills Matrix SECTION 01" [level=2] [ref=e15]:
      - text: Skills Matrix
      - generic [ref=e16]: SECTION 01
    - paragraph [ref=e17]: Hover over a skill to see proficiency level. Color-coded by depth of experience.
    - generic [ref=e18]:
      - generic [ref=e19]:
        - generic [ref=e20]:
          - generic [ref=e21]: 🤖
          - generic [ref=e22]: Test Automation
        - generic [ref=e23]:
          - generic "Expert" [ref=e24]: Cypress
          - generic "Expert" [ref=e26]: Selenium
          - generic "Intermediate" [ref=e28]: Playwright
          - generic "Expert" [ref=e30]: Cucumber / BDD
          - generic "Intermediate" [ref=e32]: TestNG
          - generic "Intermediate" [ref=e34]: JUnit
      - generic [ref=e36]:
        - generic [ref=e37]:
          - generic [ref=e38]: 💻
          - generic [ref=e39]: Languages
        - generic [ref=e40]:
          - generic "Expert" [ref=e41]: Java
          - generic "Expert" [ref=e43]: JavaScript
          - generic "Advanced" [ref=e45]: SQL
          - generic "Expert" [ref=e47]: HTML / CSS
          - generic "Expert" [ref=e49]: Gherkin
          - generic "Advanced" [ref=e51]: Python
      - generic [ref=e53]:
        - generic [ref=e54]:
          - generic [ref=e55]: 🔁
          - generic [ref=e56]: CI/CD & DevOps
        - generic [ref=e57]:
          - generic "Expert" [ref=e58]: GitHub Actions
          - generic "Expert" [ref=e60]: Docker
          - generic "Intermediate" [ref=e62]: OpenShift
          - generic "Expert" [ref=e64]: AWS (S3, CloudFront, Lambda)
          - generic "Advanced" [ref=e66]: Jenkins
      - generic [ref=e68]:
        - generic [ref=e69]:
          - generic [ref=e70]: 🛠️
          - generic [ref=e71]: Tools & Collaboration
        - generic [ref=e72]:
          - generic "Expert" [ref=e73]: Jira
          - generic "Expert" [ref=e75]: IntelliJ IDEA
          - generic "Expert" [ref=e77]: Git / GitHub
          - generic "Advanced" [ref=e79]: Postman
          - generic "Expert" [ref=e81]: VS Code
      - generic [ref=e83]:
        - generic [ref=e84]:
          - generic [ref=e85]: 📋
          - generic [ref=e86]: QA Methodologies
        - generic [ref=e87]:
          - generic "Expert" [ref=e88]: Agile / Scrum
          - generic "Expert" [ref=e90]: SDLC
          - generic "Expert" [ref=e92]: Risk Analysis
          - generic "Expert" [ref=e94]: Test Plan Design
          - generic "Expert" [ref=e96]: Defect Management
          - generic "Expert" [ref=e98]: Regression Testing
      - generic [ref=e100]:
        - generic [ref=e101]:
          - generic [ref=e102]: 🏅
          - generic [ref=e103]: Standards & Certs
        - generic [ref=e104]:
          - generic "Expert" [ref=e105]: ISTQB Certified
          - generic "Expert" [ref=e107]: ISO 13485
          - generic "Advanced" [ref=e109]: IEC 62366
          - generic "Advanced" [ref=e111]: ISO 14971
          - generic "Expert" [ref=e113]: AWS Developer Assoc.
          - generic "Expert" [ref=e115]: AWS Cloud Practitioner
    - generic [ref=e117]:
      - generic [ref=e118]: Expert — daily use, deep knowledge
      - generic [ref=e120]: Advanced — production experience
      - generic [ref=e122]: Intermediate — solid working knowledge
      - generic [ref=e124]: Learning — actively expanding
  - generic [ref=e126]:
    - heading "Test Automation Showcase SECTION 02" [level=2] [ref=e127]:
      - text: Test Automation Showcase
      - generic [ref=e128]: SECTION 02
    - paragraph [ref=e129]: Real test suites from this portfolio's production Cypress test suite — running post-deploy via GitHub Actions against CloudFront.
    - tablist [ref=e130]:
      - tab "🔥 smoke.cy.js" [ref=e131] [cursor=pointer]
      - tab "📬 contact_form_spec" [ref=e132] [cursor=pointer]
      - tab "💼 jobs_page_spec" [ref=e133] [cursor=pointer]
      - tab "🌐 Selenium (Java)" [ref=e134] [cursor=pointer]
      - tab "🎭 Playwright" [ref=e135] [cursor=pointer]
    - generic [ref=e136]:
      - generic [ref=e137]: "describe('Portfolio Website Smoke Test', () => { beforeEach(() => { cy.visit('/'); // Runs against CloudFront distribution }); it('should load the main page and display core content', () => { cy.get('#hero-title').should('be.visible').and('contain', 'Jordan Nguyen'); cy.contains('.career-port-title', 'Career Portfolio').should('be.visible'); cy.contains('.skills-title', 'My Notable Skills').should('be.visible'); }); it('should open the \"Browse\" dropdown and show navigation links', () => { cy.contains('button', 'Browse').click(); cy.get('.dropdown-menu').eq(0).should('be.visible'); cy.get('[data-event-action=\"Click_Jobs\"]').should('be.visible'); cy.get('body').click(0, 0); // dismiss dropdown }); it('should display dynamic elements: time and visitor counter', () => { cy.get('#time').should('exist'); cy.get('#visitorCounter').should('contain', 'Visitors'); }); });"
      - generic [ref=e138]:
        - generic [ref=e139]: 6 tests passing
        - generic [ref=e141]: "🧪 Framework: Cypress"
        - generic [ref=e142]: "🌐 Target: CloudFront CDN"
        - generic [ref=e143]: ⚡ Triggered post-deploy via GitHub Actions
  - generic [ref=e144]:
    - heading "CI/CD Pipeline SECTION 03" [level=2] [ref=e145]:
      - text: CI/CD Pipeline
      - generic [ref=e146]: SECTION 03
    - paragraph [ref=e147]: Automated from git push to production — every deployment triggers a full Cypress E2E suite against the live CloudFront URL.
    - generic [ref=e149]:
      - generic [ref=e150]:
        - text: ▶
        - generic [ref=e151]:
          - generic [ref=e152]: ✓
          - text: 🔀
        - generic [ref=e153]: Git Push
        - generic [ref=e154]:
          - text: master branch
          - text: GitHub
      - generic [ref=e155]:
        - text: ▶
        - generic [ref=e156]:
          - generic [ref=e157]: ✓
          - text: ⚙️
        - generic [ref=e158]: GH Actions
        - generic [ref=e159]:
          - text: ubuntu-latest
          - text: deploy.yml
      - generic [ref=e160]:
        - text: ▶
        - generic [ref=e161]:
          - generic [ref=e162]: ✓
          - text: 💎
        - generic [ref=e163]: Jekyll Build
        - generic [ref=e164]:
          - text: Ruby 3.3
          - text: bundle exec
      - generic [ref=e165]:
        - text: ▶
        - generic [ref=e166]:
          - generic [ref=e167]: ✓
          - text: ☁️
        - generic [ref=e168]: Deploy → S3
        - generic [ref=e169]:
          - text: aws s3 sync
          - text: ca-central-1
      - generic [ref=e170]:
        - text: ▶
        - generic [ref=e171]:
          - generic [ref=e172]: ✓
          - text: 🌐
        - generic [ref=e173]: CloudFront
        - generic [ref=e174]:
          - text: CDN invalidation
          - text: /* paths
      - generic [ref=e175]:
        - text: ▶
        - generic [ref=e176]:
          - generic [ref=e177]: ✓
          - text: ⚙️
        - generic [ref=e178]: Post-Deploy
        - generic [ref=e179]:
          - text: workflow_run
          - text: "on: completed"
      - generic [ref=e180]:
        - text: ▶
        - generic [ref=e181]:
          - generic [ref=e182]: ✓
          - text: 🌲
        - generic [ref=e183]: Cypress E2E
        - generic [ref=e184]:
          - text: Chrome browser
          - text: 6 spec files
      - generic [ref=e185]:
        - generic [ref=e186]:
          - generic [ref=e187]: ✓
          - text: 🎬
        - generic [ref=e188]: Artifacts
        - generic [ref=e189]:
          - text: Videos saved
          - text: Screenshots on fail
  - generic [ref=e190]:
    - heading "QA Metrics Dashboard SECTION 04" [level=2] [ref=e191]:
      - text: QA Metrics Dashboard
      - generic [ref=e192]: SECTION 04
    - paragraph [ref=e193]: Aggregate metrics across test suites, defect tracking, and automation health — reflecting real SDET KPIs.
    - generic [ref=e194]:
      - generic [ref=e195]:
        - generic [ref=e196]: 🧪
        - generic [ref=e197]: "142"
        - text: Total Automated Tests
        - generic [ref=e198]: ↑ +18 this quarter
      - generic [ref=e199]:
        - generic [ref=e200]: ✅
        - generic [ref=e201]: 97%
        - text: Overall Pass Rate
        - generic [ref=e202]: ↑ +3% vs last quarter
      - generic [ref=e203]:
        - generic [ref=e204]: 🐛
        - generic [ref=e205]: "214"
        - text: Defects Reported
        - generic [ref=e206]: ↓ 82% closed
      - generic [ref=e207]:
        - generic [ref=e208]: ⚡
        - generic [ref=e209]: 4.2m
        - text: Avg. Suite Runtime
        - generic [ref=e210]: ↓ 1.3m faster
      - generic [ref=e211]:
        - generic [ref=e212]: 🔁
        - generic [ref=e213]: "58"
        - text: CI/CD Pipeline Runs
        - generic [ref=e214]: ↑ This month
    - generic [ref=e215]:
      - generic [ref=e216]:
        - img [ref=e218]:
          - generic [ref=e223]: "142"
          - generic [ref=e224]: tests
        - generic [ref=e225]:
          - heading "Test Suite Breakdown" [level=3] [ref=e226]
          - generic [ref=e227]:
            - generic [ref=e228]: E2E Tests
            - generic [ref=e230]: 74 (52%)
          - generic [ref=e231]:
            - generic [ref=e232]: Functional
            - generic [ref=e234]: 44 (31%)
          - generic [ref=e235]:
            - generic [ref=e236]: Smoke
            - generic [ref=e238]: 24 (17%)
      - generic [ref=e239]:
        - img [ref=e241]:
          - generic [ref=e247]: "214"
          - generic [ref=e248]: defects
        - generic [ref=e249]:
          - heading "Defect Severity" [level=3] [ref=e250]
          - generic [ref=e251]:
            - generic [ref=e252]: Critical
            - generic [ref=e254]: 17 (8%)
          - generic [ref=e255]:
            - generic [ref=e256]: Major
            - generic [ref=e258]: 47 (22%)
          - generic [ref=e259]:
            - generic [ref=e260]: Minor
            - generic [ref=e262]: 101 (47%)
          - generic [ref=e263]:
            - generic [ref=e264]: Enhancement
            - generic [ref=e266]: 49 (23%)
  - contentinfo [ref=e267]:
    - generic [ref=e268]:
      - paragraph [ref=e269]: © 2026 Jordan Nguyen. All rights reserved.
      - paragraph [ref=e270]: Built with Jekyll and hosted on AWS.
```

# Test source

```ts
  1   | /**
  2   |  * ============================================================
  3   |  *  PLAYWRIGHT TESTS  —  playwright/portfolio.spec.ts
  4   |  * ============================================================
  5   |  *
  6   |  *  CONCEPT — Why Playwright alongside Cypress?
  7   |  *  --------------------------------------------
  8   |  *  Cypress excels at E2E UI flows on a single browser.
  9   |  *  Playwright adds:
  10  |  *    • TRUE multi-browser testing (Chromium, Firefox, WebKit/Safari)
  11  |  *    • Network interception & API mocking at the test level
  12  |  *    • Parallel test execution out of the box
  13  |  *    • Built-in auto-wait (no .should() chains needed)
  14  |  *    • Visual regression snapshots
  15  |  *    • Mobile viewport emulation
  16  |  *
  17  |  *  Run with:
  18  |  *    npx playwright test                          (all browsers)
  19  |  *    npx playwright test --browser=firefox        (one browser)
  20  |  *    npx playwright test --ui                     (interactive UI mode)
  21  |  *    npx playwright show-report                   (view HTML report)
  22  |  *
  23  |  * ============================================================
  24  |  */
  25  | 
  26  | import { test, expect, Page } from '@playwright/test';
  27  | 
  28  | const BASE_URL = 'https://d2kmkdebgfkxyh.cloudfront.net';
  29  | 
  30  | // ── Shared helpers ─────────────────────────────────────────────────────────────
  31  | async function goHome(page: Page) {
  32  |   await page.goto(BASE_URL);
  33  |   await page.waitForLoadState('domcontentloaded');
  34  | }
  35  | 
  36  | // ══════════════════════════════════════════════════════════════════════════════
  37  | //  SUITE 1 — Cross-Browser Smoke Tests
  38  | //  Runs on Chromium, Firefox, and WebKit (Safari) automatically
  39  | //  via playwright.config.ts projects array.
  40  | // ══════════════════════════════════════════════════════════════════════════════
  41  | test.describe('Cross-Browser Smoke Tests', () => {
  42  | 
  43  |   test('homepage loads and displays hero content', async ({ page }) => {
  44  |     await goHome(page);
  45  |     await expect(page.locator('#hero-title')).toBeVisible();
  46  |     await expect(page.locator('#hero-title')).toContainText('Jordan Nguyen');
  47  |     await expect(page.locator('.career-port-title')).toContainText('Career Portfolio');
  48  |   });
  49  | 
  50  |   test('navigation bar is present with all dropdown menus', async ({ page }) => {
  51  |     await goHome(page);
  52  |     await expect(page.locator('.topnav')).toBeVisible();
  53  |     // Open Browse dropdown
  54  |     await page.click('button:has-text("Browse")');
  55  |     await expect(page.locator('.dropdown-menu').first()).toBeVisible();
  56  |     await expect(page.locator('[data-event-action="Click_Jobs"]')).toBeVisible();
  57  |     await expect(page.locator('[data-event-action="Click_Certifications"]')).toBeVisible();
  58  |   });
  59  | 
  60  |   test('Jobs page loads and shows work timeline', async ({ page }) => {
  61  |     await page.goto(`${BASE_URL}/assets/html/jobs.html`);
  62  |     await expect(page.locator('h1')).toContainText('My Work Experiences');
  63  |     await expect(page.locator('#nationalbank-card')).toBeVisible();
  64  |     // Verify SDET role is present (most relevant for recruiters)
  65  |     await expect(page.locator('#nationalbank-card')).toContainText('SDET');
  66  |   });
  67  | 
  68  |   test('SDET Showcase page renders all four sections', async ({ page }) => {
  69  |     await page.goto(`${BASE_URL}/assets/html/sdet.html`);
  70  |     await expect(page.locator('.sdet-hero h1')).toContainText('SDET Showcase');
  71  |     await expect(page.locator('text=Skills Matrix')).toBeVisible();
  72  |     await expect(page.locator('text=Test Automation Showcase')).toBeVisible();
> 73  |     await expect(page.locator('text=CI/CD Pipeline')).toBeVisible();
      |                                                       ^ Error: expect(locator).toBeVisible() failed
  74  |     await expect(page.locator('text=QA Metrics Dashboard')).toBeVisible();
  75  |   });
  76  | 
  77  | });
  78  | 
  79  | // ══════════════════════════════════════════════════════════════════════════════
  80  | //  SUITE 2 — Network Interception & API Mocking
  81  | //  This is where Playwright shines — intercept real HTTP calls and
  82  | //  return controlled responses for deterministic tests.
  83  | // ══════════════════════════════════════════════════════════════════════════════
  84  | test.describe('API Interception Tests', () => {
  85  | 
  86  |   test('visitor counter displays mocked count from API', async ({ page }) => {
  87  |     // Intercept the AWS API Gateway call and return a fixed value
  88  |     await page.route('**/mwtufj8xia.execute-api.ca-central-1.amazonaws.com/**', async route => {
  89  |       await route.fulfill({
  90  |         status: 200,
  91  |         contentType: 'application/json',
  92  |         body: JSON.stringify({ visits: 4242 }),
  93  |       });
  94  |     });
  95  | 
  96  |     await goHome(page);
  97  |     // Visitor counter should display our mocked value
  98  |     await expect(page.locator('#visitorCounter')).toContainText('4242');
  99  |   });
  100 | 
  101 |   test('contact form submits and shows success on API 200', async ({ page }) => {
  102 |     // Mock the Lambda contact API to return success
  103 |     await page.route('**/execute-api.ca-central-1.amazonaws.com/prod', async route => {
  104 |       if (route.request().method() === 'POST') {
  105 |         await route.fulfill({
  106 |           status: 200,
  107 |           body: JSON.stringify({ message: 'Message sent successfully!' }),
  108 |         });
  109 |       } else {
  110 |         await route.continue();
  111 |       }
  112 |     });
  113 | 
  114 |     await page.goto(`${BASE_URL}/assets/html/contacting.html`);
  115 |     await page.fill('#firstName', 'Playwright');
  116 |     await page.fill('#lastName', 'Test');
  117 |     await page.check('input[value="P"]');
  118 |     await page.fill('#email', 'test@playwright.dev');
  119 |     await page.fill('#number', '5141234567');
  120 |     await page.fill('#Message', 'Automated Playwright test submission');
  121 |     await page.click('.SubBtn');
  122 | 
  123 |     await expect(page.locator('#formResponse')).toBeVisible({ timeout: 10000 });
  124 |     await expect(page.locator('#formResponse')).toContainText('Message sent successfully!');
  125 |   });
  126 | 
  127 |   test('handles API failure gracefully (visitor counter shows N/A)', async ({ page }) => {
  128 |     // Simulate a network failure on the visitor count endpoint
  129 |     await page.route('**/mwtufj8xia.execute-api.ca-central-1.amazonaws.com/**', async route => {
  130 |       await route.abort('failed');
  131 |     });
  132 | 
  133 |     await goHome(page);
  134 |     // Should fall back gracefully (not crash the page)
  135 |     await expect(page.locator('#visitorCounter')).toContainText('N/A');
  136 |     // Hero should still render — API failure shouldn't break the page
  137 |     await expect(page.locator('#hero-title')).toBeVisible();
  138 |   });
  139 | 
  140 | });
  141 | 
  142 | // ══════════════════════════════════════════════════════════════════════════════
  143 | //  SUITE 3 — Mobile Viewport Tests
  144 | //  Ensures the portfolio works on mobile — important for recruiter review
  145 | // ══════════════════════════════════════════════════════════════════════════════
  146 | test.describe('Mobile Responsive Tests', () => {
  147 | 
  148 |   test.use({ viewport: { width: 390, height: 844 } }); // iPhone 14 Pro
  149 | 
  150 |   test('homepage is usable on mobile', async ({ page }) => {
  151 |     await goHome(page);
  152 |     await expect(page.locator('#hero-title')).toBeVisible();
  153 |     // Nav should still be accessible
  154 |     await expect(page.locator('.topnav')).toBeVisible();
  155 |     // Skills section should be readable
  156 |     await expect(page.locator('.skills-title')).toBeVisible();
  157 |   });
  158 | 
  159 |   test('jobs page timeline renders on mobile', async ({ page }) => {
  160 |     await page.goto(`${BASE_URL}/assets/html/jobs.html`);
  161 |     await expect(page.locator('h1')).toBeVisible();
  162 |     await expect(page.locator('.timeline-container')).toBeVisible();
  163 |   });
  164 | 
  165 | });
  166 | 
  167 | // ══════════════════════════════════════════════════════════════════════════════
  168 | //  SUITE 4 — Visual Regression (screenshot-based)
  169 | //  Playwright's built-in screenshot comparison. Run once to create baselines,
  170 | //  then every subsequent run diffs against them.
  171 | //  Note: Applitools (Feature 2) provides a cloud-based visual testing alternative.
  172 | // ══════════════════════════════════════════════════════════════════════════════
  173 | test.describe('Visual Regression — Screenshot Snapshots', () => {
```