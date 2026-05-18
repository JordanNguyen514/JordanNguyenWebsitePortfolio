# Jordan Nguyen — SDET Portfolio Website

> A personal portfolio built and tested like a production application — featuring automated E2E testing, cross-browser Playwright tests, CI/CD pipelines, performance auditing, auto-healing selectors, visual regression, contract testing, security scanning, API synthetics, mutation testing, and shift-left quality gates.

[![Deploy to S3](https://github.com/JordanNguyen514/JordanNguyenWebsitePortfolio/actions/workflows/deploy.yml/badge.svg)](https://github.com/JordanNguyen514/JordanNguyenWebsitePortfolio/actions/workflows/deploy.yml)
[![Post-Deploy Tests](https://github.com/JordanNguyen514/JordanNguyenWebsitePortfolio/actions/workflows/post-deploy-tests.yml/badge.svg)](https://github.com/JordanNguyen514/JordanNguyenWebsitePortfolio/actions/workflows/post-deploy-tests.yml)
[![Playwright](https://github.com/JordanNguyen514/JordanNguyenWebsitePortfolio/actions/workflows/playwright.yml/badge.svg)](https://github.com/JordanNguyen514/JordanNguyenWebsitePortfolio/actions/workflows/playwright.yml)
[![Lighthouse CI](https://github.com/JordanNguyen514/JordanNguyenWebsitePortfolio/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/JordanNguyen514/JordanNguyenWebsitePortfolio/actions/workflows/lighthouse.yml)
[![Security](https://github.com/JordanNguyen514/JordanNguyenWebsitePortfolio/actions/workflows/security.yml/badge.svg)](https://github.com/JordanNguyen514/JordanNguyenWebsitePortfolio/actions/workflows/security.yml)
[![API Synthetics](https://github.com/JordanNguyen514/JordanNguyenWebsitePortfolio/actions/workflows/synthetics.yml/badge.svg)](https://github.com/JordanNguyen514/JordanNguyenWebsitePortfolio/actions/workflows/synthetics.yml)

**Live site:** https://d2kmkdebgfkxyh.cloudfront.net

---

## Table of Contents

- [About](#about)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [QA Engineering Features](#qa-engineering-features)
- [Infrastructure](#infrastructure)
- [CI/CD Pipeline](#cicd-pipeline)
- [Pages Overview](#pages-overview)
- [Certifications](#certifications)

---

## About

This portfolio is both a personal website and a living QA engineering showcase. Every page is covered by automated tests running in a real CI/CD pipeline against the production CloudFront distribution. The project applies enterprise QA patterns across the full testing pyramid: unit, contract, E2E, cross-browser, visual regression, performance, security, and mutation testing.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Site Generator | Jekyll 4.4 (Ruby) |
| Hosting | AWS S3 + CloudFront CDN |
| CI/CD | GitHub Actions (11 workflows) |
| E2E Testing | Cypress 15 |
| Cross-Browser Testing | Playwright 1.44 |
| Visual Regression | Applitools Eyes + Playwright screenshots |
| Unit Testing | Jest 29 |
| Contract Testing | Pact Foundation v12 |
| Mutation Testing | StrykerJS 8 |
| Performance | Lighthouse CI |
| Security (SAST) | Snyk |
| Security (DAST) | OWASP ZAP Baseline |
| API Monitoring | GitHub Actions Synthetics |
| Linting | ESLint 8 + eslint-plugin-cypress |
| Pre-Commit Hooks | Husky 9 |
| Images | AWS S3 + CloudFront CDN (not in repo) |

---

## Project Structure

```
JordanNguyenWebsitePortfolio/
|
+-- .github/
|   +-- workflows/
|       +-- deploy.yml                  # Jekyll build -> S3 -> CloudFront
|       +-- post-deploy-tests.yml       # Cypress E2E after deploy
|       +-- playwright.yml              # Cross-browser tests (Chromium/Firefox/WebKit)
|       +-- lighthouse.yml              # Performance audit after deploy
|       +-- security.yml                # Snyk deps + OWASP ZAP scan
|       +-- synthetics.yml              # API health checks every 30 min
|       +-- mutation.yml                # StrykerJS mutation tests (weekly)
|       +-- flaky-test-detector.yml     # Cross-run flaky test tracker
|       +-- dead-skipped-test-auditor.yml # Skipped/only test debt enforcement
|       +-- pr-quality-gate.yml         # Coverage + commits + test debt on every PR
|       +-- pipeline-perf-profiler.yml  # Step timing regressions across runs
|       +-- release-readiness.yml       # Go/no-go checklist after every deploy
|
+-- config/                             # All tool configuration files
|   +-- cypress.config.js
|   +-- playwright.config.ts
|   +-- lighthouserc.js
|   +-- stryker.config.mjs
|
+-- tests/
|   +-- unit/                           # Jest unit tests
|   |   +-- portfolio.unit.test.js
|   +-- contract/                       # Pact contract tests
|   |   +-- consumer.contact.test.js
|   |   +-- provider.test.js
|   +-- playwright/                     # Playwright cross-browser specs
|       +-- portfolio.spec.ts
|       +-- snapshots/                  # Visual regression baselines
|
+-- cypress/
|   +-- e2e/
|   |   +-- smoke.cy.js
|   |   +-- autoHeal_demo.cy.js         # Auto-healing selector showcase
|   |   +-- visual_regression.cy.js     # Applitools Eyes integration
|   |   +-- contact_form_spec.cy.js
|   |   +-- email_form_spec.cy.js
|   |   +-- jobs_page_spec.cy.js
|   |   +-- internships_page_spec.cy.js
|   |   +-- submissions_navigation_spec.cy.js
|   +-- support/
|       +-- autoHeal.js                 # cy.getHealed() custom command
|       +-- commands.js
|       +-- e2e.js
|
+-- pact/                               # Legacy pact location (tests/ is canonical)
+-- __tests__/                          # Legacy unit test location (tests/ is canonical)
+-- scripts/
|   +-- upload-images.sh                # One-time S3 image migration script
+-- .husky/
|   +-- pre-commit                      # ESLint + Jest before every commit
+-- .zap/
|   +-- rules.tsv                       # OWASP ZAP custom rule overrides
+-- _layouts/
|   +-- default.html                    # Shared nav, footer, scripts
+-- _includes/
|   +-- certification_item.html
+-- assets/
|   +-- css/                            # Per-page stylesheets
|   +-- html/                           # Sub-pages
|   |   +-- jobs.html
|   |   +-- internships.html
|   |   +-- certifications.html
|   |   +-- academic.html
|   |   +-- sdet.html                   # SDET Showcase page
|   |   +-- contacting.html
|   |   +-- emailing.html
|   |   +-- submissions.html
|   +-- js/
|       +-- main.js                     # Clock, scroll effects, back-to-top
|       +-- tracker.js                  # AWS Kinesis event tracking
|       +-- analytics-dashboard.js
|       +-- contact_form_handler.js
+-- index.html                          # Homepage
+-- _config.yml                         # Jekyll config + CDN base URL
+-- package.json
+-- Gemfile
+-- .eslintrc.js
+-- .eslintignore
+-- .gitignore
+-- lighthouserc.js -> config/          # Canonical location: config/
+-- stryker.config.mjs -> config/
```

> **Note on images:** All images are stored in S3/CloudFront, not in the repo.
> CDN base: `https://d2kmkdebgfkxyh.cloudfront.net/assets/img/`
> To upload new images: `bash scripts/upload-images.sh`

---

## Getting Started

### Prerequisites

- Node.js 20+
- Ruby 3.3+ with Bundler
- Git
- AWS CLI (for image uploads only)

### Installation

```bash
# 1. Clone
git clone https://github.com/JordanNguyen514/JordanNguyenWebsitePortfolio.git
cd JordanNguyenWebsitePortfolio

# 2. Install Node dependencies
npm install

# 3. Activate Husky pre-commit hooks
npx husky init
# Then copy .husky/pre-commit from the repo over the generated file

# 4. Install Ruby gems
bundle install

# 5. Serve locally
bundle exec jekyll serve --port 8080
# -> http://localhost:8080

# 6. Install Playwright browsers (first time only)
npx playwright install
```

---

## Testing

All test commands use config files from the `config/` folder.

### E2E Tests (Cypress)

```bash
npm test                    # Run against production CloudFront
npm run test:local          # Run against localhost:8080
npm run test:open           # Interactive Cypress UI
```

| File | What it covers |
|---|---|
| smoke.cy.js | Homepage, nav dropdowns, social links, dynamic clock |
| autoHeal_demo.cy.js | Auto-healing selector strategies (5 fallback levels) |
| visual_regression.cy.js | Applitools Eyes visual AI across 3 viewports |
| contact_form_spec.cy.js | Full form -> Lambda API -> success assertion |
| email_form_spec.cy.js | Email form submission flow |
| jobs_page_spec.cy.js | Job card expand/collapse toggle state |
| internships_page_spec.cy.js | Tab navigation + detail toggle |
| submissions_navigation_spec.cy.js | Login flow + table visibility |

### Cross-Browser Tests (Playwright)

```bash
npm run test:playwright                    # All browsers
npm run test:playwright:ui                 # Interactive UI mode
npm run test:playwright:update-snapshots   # Regenerate visual baselines
```

Runs on Chromium, Firefox, WebKit (Safari), and Pixel 7 mobile in parallel.

**First run:** Visual regression tests create baseline images. Run `npm run test:playwright:update-snapshots` once to generate baselines, commit the `tests/playwright/snapshots/` folder, then subsequent runs diff against them.

### Unit Tests (Jest)

```bash
npm run test:unit              # Run once
npm run test:unit:watch        # Watch mode
npm run test:unit:coverage     # With coverage report
```

Functions covered: `checkTime()`, `formatVisitorCount()`, `isValidEmail()`, `sanitizeInput()`, `buildPageUrl()`

### Contract Tests (Pact)

```bash
npm run test:contract            # Consumer: generates pact/pacts/*.json
npm run test:contract:verify     # Provider: verifies Lambda honours contract
```

### Performance (Lighthouse CI)

```bash
npm run test:perf
```

| Category | Threshold | Failure mode |
|---|---|---|
| Performance | >= 70 | Warn |
| Accessibility | >= 90 | Fail build |
| Best Practices | >= 90 | Fail build |
| SEO | >= 80 | Warn |
| color-contrast | score = 1 | Fail build |
| unsized-images | score = 1 | Fail build |
| CLS | < 0.15 | Fail build |

### Security

```bash
npm run test:security:deps     # Snyk dependency scan
```

OWASP ZAP runs automatically on schedule via GitHub Actions (no local setup needed).

### Mutation Testing (StrykerJS)

```bash
npm run test:mutation
```

Thresholds: >= 80% killed = green, < 50% = build fails.

---

## QA Engineering Features

### Auto-Healing Selectors

`cypress/support/autoHeal.js` adds `cy.getHealed(token)` — tries 5 selector strategies with Cypress's retry engine before failing:

1. `[data-testid="token"]`
2. `[data-event-action="token"]`
3. `[aria-label="token"]`
4. `#token`
5. `.token`

### Shift Left

Husky pre-commit hook runs ESLint + Jest before every commit. Bad code never reaches the repo.

### Visual Regression (Applitools)

AI-powered visual testing across Chromium, Firefox, and iPhone 14 Pro simultaneously. Detects genuine UI regressions while ignoring rendering noise (anti-aliasing, font differences). Playwright screenshot comparison also runs in CI.

### Contract Testing

Consumer-driven contract testing between the JS frontend and AWS Lambda. The frontend defines what it expects; both sides are tested independently without a live backend.

### Security Testing

Two-layer approach: Snyk (SAST) scans dependencies on every push. OWASP ZAP (DAST) passively scans the live site weekly for XSS, missing headers, and CORS issues.

### API Synthetics

Health checks run every 30 minutes against CloudFront and the Contact Form Lambda. GitHub alerts on failure automatically.

### Mutation Testing

StrykerJS introduces automatic bugs into source code and verifies tests catch them. Runs weekly and on changes to test files.

---

## Infrastructure

All services in `ca-central-1`.

| Service | Purpose |
|---|---|
| S3 | Static site + image hosting |
| CloudFront | Global CDN, HTTPS, long-lived image cache |
| API Gateway + Lambda | Contact form handler |
| Kinesis + Lambda | User interaction event streaming |
| QuickSight | Analytics dashboard |

Images use `Cache-Control: max-age=31536000, public, immutable` (1-year cache). HTML/CSS/JS use targeted CloudFront invalidations on each deploy.

---

## CI/CD Pipeline

```
git push -> master
    |
    v
[deploy.yml]
    |- Checkout + Ruby setup
    |- jekyll build
    |- aws s3 sync (excludes assets/img/*)
    |- CloudFront invalidation (HTML/CSS/JS only)
    |
    v (on: workflow_run success)
[post-deploy-tests.yml]        [playwright.yml]           [lighthouse.yml]
    |- Cypress E2E                 |- Chromium                |- Wait 45s
    |- Chrome on CloudFront        |- Firefox                 |- lhci autorun
    |- Upload videos               |- WebKit                  |- 3 runs x 4 pages
                                   |- Pixel 7 mobile          |- Assert thresholds
                                   |- Parallel matrix         |- Upload HTML report

[security.yml]                 [synthetics.yml]           [mutation.yml]
    |- Snyk (on push)              |- Every 30 min            |- Weekly (Sunday)
    |- OWASP ZAP (weekly)          |- CloudFront check        |- StrykerJS
    |- Upload reports              |- Contact API check       |- Mutation score
                                   |- Key pages check         |- HTML report
```

---

## Pages Overview

| Page | URL | Description |
|---|---|---|
| Home | / | Hero, Career Portfolio, Skills bars, Social |
| Jobs | /assets/html/jobs.html | Work timeline with expandable cards |
| Internships | /assets/html/internships.html | Tabbed internship history |
| Certifications | /assets/html/certifications.html | AWS and ISTQB badges |
| Academics | /assets/html/academic.html | Academic background |
| SDET Showcase | /assets/html/sdet.html | Skills matrix, automation showcase, CI/CD diagram, QA metrics |
| Contact Form | /assets/html/contacting.html | Form -> API Gateway -> Lambda |
| Email Form | /assets/html/emailing.html | Direct email form |
| Submissions | /assets/html/submissions.html | View past form submissions |

---

## Certifications

| Certification | Issued | Expires |
|---|---|---|
| AWS Certified Developer Associate | Feb 2026 | Feb 2029 |
| AWS Certified Cloud Practitioner | Aug 2023 | Feb 2029 |
| ISTQB Certified Tester Foundation | Mar 2021 | Never (lifetime) |

---

*Built with Jekyll - Hosted on AWS - Tested with Cypress and Playwright - (c) Jordan Nguyen*
