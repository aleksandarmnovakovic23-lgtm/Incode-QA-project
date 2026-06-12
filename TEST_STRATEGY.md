# Test Strategy — AutomationExercise.com

## System Under Test

AutomationExercise.com is a demo e-commerce application with a public REST API and a full
browser UI. It covers product catalogues, user authentication, cart management, and checkout.

---

## Approach

### Risk-Based Prioritisation

I prioritised coverage by business impact and likelihood of breakage:

| Area | Priority | Reason |
|---|---|---|
| User auth (login, register) | High | Gate to all authenticated flows; breakage blocks everything |
| Products & search | High | Core revenue path — users must be able to find items |
| Cart | High | Directly precedes checkout; silent failures lose orders |
| Checkout | Medium | Critical but complex — scoped to "add to cart + proceed" in this timebox |
| Brands list | Low | Read-only, no business logic beyond display |
| Homepage render | Low | Trust the framework; test presence of key elements only |

---

## API Tests vs E2E Tests — Decision Framework

I use this heuristic: **test the contract at the API layer; test the experience at the E2E layer**.

**API tests are appropriate when:**
- Validating request/response contracts (field presence, types, error codes)
- Testing negative paths (missing params, wrong methods, invalid credentials)
- The test does not depend on page rendering or user interaction

**E2E tests are appropriate when:**
- Validating a complete user journey that spans multiple pages
- Testing browser-specific behaviour (hover states, modals, navigation)
- A bug at this level would not be caught by API tests alone (e.g. JS wiring to backend)

For this site, all 14 documented API scenarios are covered at the API layer. E2E tests confirm
that the UI correctly drives those same endpoints and that the resulting state is visible to the
user.

---

## Test Architecture

```
tests/
  api/           — Playwright APIRequestContext, no browser
  e2e/           — Playwright Page + Browser, Page Object Model
lib/
  api-client.ts  — Typed wrapper; keeps URL strings and form building out of tests
  test-data.ts   — Factory functions for unique user payloads
  page-objects/  — One file per page/component; encapsulates selectors
```

**Page Object Model** is used for all E2E tests. Selectors live in page objects, not tests.
This means a selector change requires one edit, not N test edits.

**Test data isolation**: each test that creates a user generates a timestamp-based unique email
(`testuser.{Date.now()}@mailnull.com`). `beforeAll`/`afterAll` hooks create and clean up
server-side state. This avoids shared state leaking between test runs.

---

## Key Risks and Assumptions

1. **Response code in body vs HTTP status.** The API returns HTTP 200 for all responses,
   embedding the actual code in a `responseCode` JSON field. Tests assert on `body.responseCode`.
   If the API is ever updated to return real HTTP status codes, assertions will need updating.

2. **Third-party ads and overlays.** The site renders ad iframes that occasionally produce
   overlay elements which can intercept clicks. Tests use `data-qa` attributes where available
   to avoid selector fragility.

3. **Rate limiting / test account accumulation.** Shared test infra hitting a public server
   may be throttled. The `afterAll` cleanup hooks mitigate account accumulation; if a test
   crashes mid-run, some accounts may persist on the server.

4. **Flakiness from network latency.** This is a live external service. CI retries are set to
   2 to absorb transient failures without masking real regressions.

5. **No payment gateway testing.** Checkout beyond the address step is intentionally excluded.
   The site uses a demo payment form that would require real card data and is outside scope.

---

## What We Explicitly Do Not Test

- Payment processing (scope + risk)
- Pagination / infinite scroll on product lists (not documented in the API spec)
- Mobile viewports (outside this timebox; added value is low on a demo site)
- Cross-browser (Chromium is representative; Firefox/WebKit can be added to the Playwright project config as needed)
- Performance or load testing
- 5xx / server error scenarios (no mechanism to trigger them reliably on this shared server)
- CSRF / security headers (noted in the exploratory report; not automated here)

---

## CI/CD Notes

The GitHub Actions workflow runs two jobs in parallel:

- `api-tests` — no browser binary required; runs fast (~2–3 min)
- `e2e-tests` — installs Chromium; runs slower (~8–10 min)

Both upload HTML reports as artifacts. On PR merges to `main`, the scheduled daily run acts as
a regression canary against the live service.
