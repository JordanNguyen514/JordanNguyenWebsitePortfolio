# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: portfolio.spec.ts >> Visual Regression — Screenshot Snapshots >> homepage hero section matches baseline
- Location: playwright\portfolio.spec.ts:175:7

# Error details

```
Error: A snapshot doesn't exist at C:\Users\legra\Desktop\JordanNguyenWebsitePortfolio\playwright\snapshots\portfolio.spec.ts-snapshots\hero-section-mobile-chrome-win32.png, writing actual.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - link "Home" [ref=e3] [cursor=pointer]:
      - /url: /
    - button "Browse" [ref=e5] [cursor=pointer]
    - button "Contact" [ref=e7] [cursor=pointer]
    - generic [ref=e8] [cursor=pointer]: "Time: 12:01:47"
    - generic [ref=e9] [cursor=pointer]: "Visitors: N/A"
  - generic [ref=e10]:
    - generic [ref=e11]:
      - generic [ref=e12]: Jordan Nguyen
      - generic [ref=e13]: Welcome to my webpage
    - generic [ref=e14]:
      - generic [ref=e15]: Navigate around this website to get to know me
      - generic [ref=e16]: You will learn all there is to know about my career interests, past experiences, academic achievements, and a few personal things as well. Enjoy your stay!
  - generic [ref=e17]:
    - generic [ref=e18]: Career Portfolio
    - generic [ref=e19]:
      - link "Jobs" [ref=e20] [cursor=pointer]:
        - /url: /assets/html/jobs.html
      - link "Internships" [ref=e21] [cursor=pointer]:
        - /url: /assets/html/internships.html
      - link "Certifications" [ref=e22] [cursor=pointer]:
        - /url: /assets/html/certifications.html
      - link "🧪 SDET Showcase" [ref=e23] [cursor=pointer]:
        - /url: /assets/html/sdet.html
  - generic [ref=e25]:
    - generic [ref=e26]: Academics
    - link "Go to Academics Page" [ref=e27] [cursor=pointer]:
      - /url: /assets/html/academic.html
  - generic [ref=e29]:
    - heading "My Notable Skills" [level=2] [ref=e30]
    - generic [ref=e31]:
      - generic [ref=e32]: SQL
      - generic [ref=e34]: 60%
    - generic [ref=e35]:
      - generic [ref=e36]: Html
      - generic [ref=e38]: 60%
    - generic [ref=e39]:
      - generic [ref=e40]: JS
      - generic [ref=e42]: 55%
    - generic [ref=e43]:
      - generic [ref=e44]: Cypress
      - generic [ref=e46]: 90%
    - generic [ref=e47]:
      - generic [ref=e48]: Selenium
      - generic [ref=e50]: 80%
    - generic [ref=e51]:
      - generic [ref=e52]: Playwright
      - generic [ref=e54]: 75%
    - generic [ref=e55]:
      - generic [ref=e56]: Java
      - generic [ref=e58]: 85%
    - generic [ref=e59]:
      - generic [ref=e60]: ISO13485
      - generic [ref=e62]: 80%
    - generic [ref=e63]:
      - generic [ref=e64]: Agile
      - generic [ref=e66]: 70%
  - generic [ref=e68]:
    - generic [ref=e69]: Other Interests and Passions
    - link "Come Find Out!" [ref=e70] [cursor=pointer]:
      - /url: /OtherSection/index.html
  - generic [ref=e71]:
    - heading "Website Analytics (AWS Kinesis/Lambda)" [level=1] [ref=e72]
    - paragraph [ref=e73]: A real-time demonstration of user interaction tracking built using AWS services.
    - paragraph [ref=e75]: Failed to load analytics.
    - link "View Live Dashboard (External Link)" [ref=e76] [cursor=pointer]:
      - /url: https://ca-central-1.quicksight.aws.amazon.com/sn/account/nguj2026/dashboards/9998681f-fc67-44d4-af32-5979f8502d1f/views/fa678be1-b161-4662-9f59-545a1d4ae0ed
  - generic [ref=e78]:
    - heading "My Social Media Presence" [level=1] [ref=e79]
    - paragraph [ref=e80]: I maintain an active online presence where I share my professional updates, connect with industry peers, and contribute to open-source projects. Feel free to connect via LinkedIn, check out my GitHub profile for code samples, or send me an email regarding potential opportunities.
    - generic [ref=e81]:
      - link "Facebook Link" [ref=e82] [cursor=pointer]:
        - /url: https://www.facebook.com
        - img "Facebook Link" [ref=e83]
      - link "LinkedIn Link" [ref=e84] [cursor=pointer]:
        - /url: https://www.linkedin.com
        - img "LinkedIn Link" [ref=e85]
      - link "Instagram Logo" [ref=e86] [cursor=pointer]:
        - /url: https://www.instagram.com
        - img "Instagram Logo" [ref=e87]
      - link "GitHub Link" [ref=e88] [cursor=pointer]:
        - /url: https://www.github.com
        - img "GitHub Link" [ref=e89]
    - heading "Lets Talk" [level=1] [ref=e90]
    - generic [ref=e91]:
      - link "Contact Form Link" [ref=e92] [cursor=pointer]:
        - /url: /assets/html/contacting.html
        - img "Contact Form Link" [ref=e93]
      - link "Email Form Link" [ref=e94] [cursor=pointer]:
        - /url: /assets/html/emailing.html
        - img "Email Form Link" [ref=e95]
      - link "Download CV" [ref=e96] [cursor=pointer]:
        - /url: /CV_English_JordanNguyen.PDF
        - img "Download CV" [ref=e97]
    - heading "See Submissions" [level=1] [ref=e98]
    - link "View Submissions Link" [ref=e100] [cursor=pointer]:
      - /url: /assets/html/submissions.html
      - img "View Submissions Link" [ref=e101]
  - contentinfo [ref=e102]:
    - generic [ref=e103]:
      - paragraph [ref=e104]: © 2026 Jordan Nguyen. All rights reserved.
      - paragraph [ref=e105]: Built with Jekyll and hosted on AWS.
```

# Test source

```ts
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
  174 | 
  175 |   test('homepage hero section matches baseline', async ({ page }) => {
  176 |     await goHome(page);
  177 |     await page.waitForLoadState('networkidle');
  178 |     // Snapshot just the hero — more stable than full-page
> 179 |     await expect(page.locator('.hero-section')).toHaveScreenshot('hero-section.png', {
      |     ^ Error: A snapshot doesn't exist at C:\Users\legra\Desktop\JordanNguyenWebsitePortfolio\playwright\snapshots\portfolio.spec.ts-snapshots\hero-section-mobile-chrome-win32.png, writing actual.
  180 |       threshold: 0.05, // 5% pixel diff tolerance
  181 |     });
  182 |   });
  183 | 
  184 |   test('SDET skills matrix matches baseline', async ({ page }) => {
  185 |     await page.goto(`${BASE_URL}/assets/html/sdet.html`);
  186 |     await page.waitForLoadState('networkidle');
  187 |     await expect(page.locator('.skills-matrix-grid')).toHaveScreenshot('skills-matrix.png', {
  188 |       threshold: 0.05,
  189 |     });
  190 |   });
  191 | 
  192 | });
  193 | 
```