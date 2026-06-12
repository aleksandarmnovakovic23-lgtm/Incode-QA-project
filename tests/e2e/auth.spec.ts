import { test, expect } from '@playwright/test';
import { LoginPage } from '../../lib/page-objects/LoginPage';
import { SignupPage } from '../../lib/page-objects/SignupPage';
import { generateUser } from '../../lib/test-data';

test.describe('User Registration', () => {
  test('new user can complete full registration flow', async ({ page }) => {
    const user = generateUser();
    const loginPage = new LoginPage(page);
    const signupPage = new SignupPage(page);

    await loginPage.goto();
    await expect(loginPage.signupHeading).toBeVisible();

    await loginPage.initiateSignup(user.name, user.email);
    await expect(page).toHaveURL(/signup/);
    await expect(page.locator('h2:has-text("Enter Account Information")')).toBeVisible();

    await signupPage.fillAccountInfo(user);
    await signupPage.submit();

    await expect(page.locator('[data-qa="account-created"]')).toBeVisible();
    await page.click('a[data-qa="continue-button"]');

    await expect(page.locator('li:has-text("Logged in as")')).toBeVisible();
    const username = await page.locator('li:has-text("Logged in as") b').textContent();
    expect(username).toBe(user.name);

    // Clean up — delete via API to avoid accumulating test accounts on the live server
    await page.request.delete('/api/deleteAccount', {
      form: { email: user.email, password: user.password },
    });
  });

  test('signup with an already-registered email shows an error', async ({ page }) => {
    const user = generateUser();
    await page.request.post('/api/createAccount', { form: { ...user } });

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.initiateSignup(user.name, user.email);

    await expect(page.locator('p:has-text("Email Address already exist!")')).toBeVisible();

    await page.request.delete('/api/deleteAccount', {
      form: { email: user.email, password: user.password },
    });
  });
});

// These tests are independent of any registered user — kept in their own describe
// so a failed beforeAll in the authenticated block cannot cascade here.
test.describe('Login — negative cases', () => {
  test('invalid credentials show an error message', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('nobody@nowhere.invalid', 'wrongpassword');

    await expect(loginPage.loginErrorMsg).toBeVisible();
  });
});

test.describe('User Login / Logout — authenticated', () => {
  const testUser = generateUser();

  test.beforeAll(async ({ request }) => {
    const res = await request.post('/api/createAccount', { form: { ...testUser } });
    const body = await res.json();
    // Warn rather than assert — if creation fails (e.g. leftover from a crashed run)
    // the login tests below will fail with a clear auth error rather than a setup error.
    if (body.responseCode !== 201) {
      console.warn(`[beforeAll] createAccount returned ${body.responseCode}: ${body.message}`);
    }
  });

  test.afterAll(async ({ request }) => {
    await request.delete('/api/deleteAccount', {
      form: { email: testUser.email, password: testUser.password },
    });
  });

  test('valid credentials log the user in and show their name in the nav', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testUser.email, testUser.password);

    await expect(page.locator('li:has-text("Logged in as")')).toBeVisible();
    const username = await page.locator('li:has-text("Logged in as") b').textContent();
    expect(username).toBe(testUser.name);
  });

  test('logged-in user can log out and is redirected to login page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testUser.email, testUser.password);

    await loginPage.logout();
    await expect(page).toHaveURL(/\/login/);
  });
});
