# Exploratory Testing Report — AutomationExercise.com

**Date:** June 11, 2026
**Tester:** Aleksandar Novakovic
**Duration:** ~60 minutes
**Environment:** Chrome 125, Desktop (1440×900), automationexercise.com (live)

---

## Testing Charter

> Explore the user registration, login, product search, and cart flows as a first-time visitor.
> Identify issues that automated checks are likely to miss — UX friction, data integrity gaps,
> inconsistent error handling, and anything that would erode user trust.

---

## Session Notes

### Area 1: Registration & Login

- **Registration form submits without confirming the email.** A user can register with
  `anybody@anything.com` — no email verification step. An automated test would pass, but
  this is a real-world trust and data quality risk.
- The "Enter Account Information" form at `/signup` pre-fills the **name field** from step 1,
  but **not the email field**. The email is visible as read-only text above the form. This is
  fine UX, but the DOM element is not an `<input>` — it's a `<span>`. Automated tests that
  try to assert on or interact with it via `input` selectors will fail silently.
- After successful registration, clicking "Continue" lands the user on the homepage **logged
  in**. There is no welcome email, onboarding tour, or confirmation screen beyond the
  "Account Created!" heading. A user who clicks away too fast may not know they're logged in.
- The login error message for incorrect credentials reads "Your email or password is
  incorrect!" This is a mild information-disclosure issue — confirming that "an account with
  this email does exist but the password is wrong" versus "this email is not registered" should
  ideally both return the same opaque message. (The API correctly returns 404 uniformly, but
  the UI message differs based on the server response.)

### Area 2: Product Search

- Searching for a term with no matches (e.g. `zzznomatch`) renders the "Searched Products"
  heading with an **empty product grid** and no "no results" message. The UI is silent about
  why the grid is empty — a user could assume the page is broken.
- Search is case-insensitive (`TSHIRT` and `tshirt` return the same results). This is correct
  behaviour but worth confirming.
- The search input accepts very long strings (500+ chars) without client-side length validation.
  The API appears to return an empty result set gracefully, but the input field stretches the
  layout noticeably on narrow viewports.

### Area 3: Cart Behaviour

- Adding the same product twice does **not** increment the quantity of the existing row.
  Instead, it adds a second row for the same item. This is inconsistent with the quantity
  field visible on the cart row (which allows manual quantity edit). Whether this is a bug or
  intentional is ambiguous, but it's confusing UX.
- The cart is **not persisted across sessions** — closing and reopening the browser empties the
  cart, even for logged-in users. There is no session-token or cookie-based persistence. This
  is probably intentional for a demo site, but it means automated tests must populate the cart
  in the same browser context they intend to use it.
- Removing the last cart item **does not redirect the user** or show a clear "Your cart is
  empty" message on all paths. If reached via direct URL after deletion, the page renders an
  empty table with no prompt to continue shopping.

### Area 4: Security & API Observations

- All API endpoints are unauthenticated. Any caller who knows the URL can create, read, or
  delete any user account by supplying an email and password in the form body. There is no
  session token, API key, or CSRF protection.
- The DELETE `/deleteAccount` endpoint accepts credentials in the request **body**, which is
  non-standard for HTTP DELETE and not supported by all proxies and load balancers.
- No `X-Frame-Options` or `Content-Security-Policy` header is set on the application pages,
  which means the site is theoretically embeddable in an iframe (clickjacking surface).
- The checkout page at `/checkout` renders the delivery address form for unauthenticated users
  but blocks progression when "Place Order" is clicked — it redirects to login. The form data
  entered is **lost on redirect**. A user who fills in their address before realising they
  need to log in loses all their input.

---

## Documented Issues

### Issue 1 — Cart deduplication: same product added twice creates two rows instead of incrementing quantity

| Field | Detail |
|---|---|
| **Severity** | Medium |
| **Priority** | Medium |
| **Steps** | Go to Products → Add any product → Continue Shopping → Add the same product again → View Cart |
| **Expected** | The cart row for that product shows quantity = 2 |
| **Actual** | Two identical rows appear, each with quantity = 1 |
| **Risk** | Users who click "Add" multiple times see unexpected duplicate rows; order fulfilment could double-ship |
| **Automation note** | A scripted test that adds the same product twice and asserts `rowCount === 1` would reliably catch a regression fix |

---

### Issue 2 — No empty-state message when search returns zero results

| Field | Detail |
|---|---|
| **Severity** | Low |
| **Priority** | Low |
| **Steps** | Go to Products → Search for `zzznomatch` |
| **Expected** | A message such as "No products found for 'zzznomatch'" is displayed |
| **Actual** | The "Searched Products" heading appears with an empty grid; no feedback to the user |
| **Risk** | Users interpret a blank grid as a broken page rather than a legitimate "nothing found" result; likely to re-try or abandon |
| **Automation note** | Easy to assert: after a no-results search, check for a specific empty-state element |

---

### Issue 3 — Checkout form input lost on unauthenticated redirect

| Field | Detail |
|---|---|
| **Severity** | Medium |
| **Priority** | High |
| **Steps** | Add product to cart → Proceed to Checkout (unauthenticated) → Fill in delivery address → Click "Place Order" → Redirected to login → Log in |
| **Expected** | Cart and/or address is preserved through the login redirect |
| **Actual** | Address form data is lost; user must re-enter after login |
| **Risk** | Checkout abandonment; frustrating UX for real users who get halfway through checkout before being prompted to log in |
| **Automation note** | Difficult to catch with a happy-path script that starts logged in; requires a specific "unauthenticated checkout" test scenario |

---

### Issue 4 — No email verification on registration (informational risk)

| Field | Detail |
|---|---|
| **Severity** | Info (demo context) / High (production context) |
| **Priority** | N/A for this demo site |
| **Observation** | Any string that matches `*@*` format is accepted as a valid email. No confirmation email is sent. |
| **Risk** | In a real system: account enumeration, fake accounts, inability to send transactional email |
| **Note** | Deliberately out of scope for a demo site; flagged for completeness |

---

## Overall Quality Assessment

The application is well-suited for test automation practice. The `data-qa` attribute coverage
is good for key form elements. The main reliability risk for automated suites is the presence
of ad overlays and the lack of empty-state feedback, which can cause assertions to time out
silently rather than fail loudly.

The API layer is consistent and predictable but lacks authentication, which is expected for a
public practice environment. The gap between HTTP status codes (always 200) and the
`responseCode` body field is the single most important thing to understand before writing API
tests — tests that rely on HTTP status codes alone will always pass, even for error cases.
