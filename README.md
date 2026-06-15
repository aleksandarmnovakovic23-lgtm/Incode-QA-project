# AutomationExercise — Playwright Test Suite

Playwright + TypeScript test suite covering the public API and browser UI of
[automationexercise.com](https://automationexercise.com).

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 18 |
| npm | ≥ 9 |

---

## Installation

```bash
cd InCodePlaywrite
npm install
npx playwright install chromium --with-deps
```

> API tests do not require a browser binary. You can skip the second command if you only
> want to run API tests.

---

## Running Tests

| Command | What it does |
|---|---|
| `npm test` | Run all tests (API + E2E) |
| `npm run test:api` | API tests only — no browser needed |
| `npm run test:e2e` | E2E tests only — requires Chromium |
| `npm run test:headed` | E2E tests with a visible browser window (single worker) |
| `npm run report` | Open the last HTML report in your browser |

### Run a single spec

```bash
npx playwright test tests/api/products.api.spec.ts
npx playwright test tests/e2e/auth.spec.ts
```

### Run by test title substring

```bash
npx playwright test --grep "login"
```

---

## Project Structure

```
.
├── playwright.config.ts       # Two projects: "api" and "chromium"
├── lib/
│   ├── api-client.ts          # Typed wrapper around APIRequestContext
│   ├── test-data.ts           # User payload type + factory function
│   └── page-objects/          # Page Object Model classes
│       ├── BasePage.ts
│       ├── HomePage.ts
│       ├── LoginPage.ts
│       ├── SignupPage.ts
│       ├── ProductsPage.ts
│       └── CartPage.ts
├── tests/
│   ├── api/
│   │   ├── products.api.spec.ts   # APIs 1–2
│   │   ├── brands.api.spec.ts     # APIs 3–4
│   │   ├── search.api.spec.ts     # APIs 5–6
│   │   ├── auth.api.spec.ts       # APIs 7–10
│   │   └── account.api.spec.ts    # APIs 11–14
│   └── e2e/
│       ├── homepage.spec.ts
│       ├── auth.spec.ts
│       ├── products.spec.ts
│       └── cart.spec.ts
├── TEST_STRATEGY.md
└── EXPLORATORY_TESTING_REPORT.md
```

---

## CI/CD

The `.github/workflows/ci.yml` workflow:

- Runs **API tests** and **E2E tests** as parallel jobs
- Uploads HTML reports and failure traces as artifacts (14-day retention)
- Sets `retries: 2` in CI to absorb transient network flakiness against the live external server

To use in CI without GitHub Actions, the equivalent commands are:

```bash
npm ci
npx playwright install chromium --with-deps  # E2E only
npx playwright test --reporter=github,html
```

---

## Key Design Decisions

**Response code assertion strategy.** The AutomationExercise API always returns HTTP 200.
The actual result code (200, 201, 400, 404, 405) lives in the JSON body's `responseCode`
field. All API tests assert `body.responseCode`, not `response.status()`.

**Test data isolation.** Each test that registers a user generates a unique email via
`Date.now()`. `beforeAll` / `afterAll` hooks create and delete test accounts via the API.
This avoids leftover state between runs.

**No test data file.** There are no hardcoded credentials in the repository. All users are
created on-the-fly per run.

**Page Object Model.** Selectors are centralised in `lib/page-objects/`. Tests describe
intent (`loginPage.login(...)`) rather than mechanics (`page.fill('input[data-qa=...]', ...)`).

---

## Known Flakiness Sources

- **Ad overlays** — the site renders third-party ad iframes that can intercept clicks. If a
  test fails with "element intercepts pointer events", re-run it; this is an ad timing issue.
- **Network latency** — this is a live external service. Occasional slow responses may cause
  timeouts on the first attempt. CI retries handle this.
- **Cart state** — the cart is not persisted across browser contexts. Each test that needs a
  populated cart must add items within the same browser session.

---

## Assumptions

- No test environment is provided; all tests run against the live public site.
- No `.env` file is required — there are no secrets or config overrides needed.
- The API does not enforce rate limits in a way that would block a normal test run.

---

## What Would Come Next (With More Time)

- Checkout flow E2E test (address entry → order confirmation page, using the demo payment form)
- Visual regression snapshot tests for the homepage and product cards
- Cross-browser runs (Firefox, WebKit) via additional Playwright projects
- Test tagging (`@smoke`, `@regression`, `@api`) for selective CI execution
- A `fixtures/index.ts` extending Playwright's test to inject `ApiClient` and page objects
  automatically, reducing boilerplate in test files
- Allure or Playwright's built-in trace viewer integrated into the CI report pipeline
