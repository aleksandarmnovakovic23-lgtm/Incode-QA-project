import { test, expect } from '@playwright/test';
import { ApiClient } from '../../lib/api-client';
import { generateUser } from '../../lib/test-data';

/**
 * APIs 7–10: /verifyLogin
 *
 * API 7 (valid login) requires a real registered account.
 * We create one via the API in beforeAll and clean it up in afterAll.
 * The rest of the tests (8, 9, 10) are self-contained.
 */
test.describe('Auth API — verifyLogin', () => {
  const testUser = generateUser();

  test.beforeAll(async ({ request }) => {
    const res = await request.post('/api/createAccount', { form: { ...testUser } });
    const body = await res.json();
    expect(body.responseCode).toBe(201);
  });

  test.afterAll(async ({ request }) => {
    await request.delete('/api/deleteAccount', {
      form: { email: testUser.email, password: testUser.password },
    });
  });

  test('API 7 — POST /verifyLogin with valid credentials returns 200 User exists', async ({ request }) => {
    const client = new ApiClient(request);
    const response = await client.auth.verifyLogin(testUser.email, testUser.password);
    const body = await response.json();

    expect(body.responseCode).toBe(200);
    expect(body.message).toMatch(/User exists/i);
  });

  test('API 8 — POST /verifyLogin missing email returns 400 bad request', async ({ request }) => {
    const client = new ApiClient(request);
    const response = await client.auth.verifyLoginMissingEmail('SomePassword123');
    const body = await response.json();

    expect(body.responseCode).toBe(400);
    expect(body.message).toMatch(/email or password parameter is missing/i);
  });

  test('API 9 — DELETE /verifyLogin returns 405 method not supported', async ({ request }) => {
    const client = new ApiClient(request);
    const response = await client.auth.deleteUnsupported();
    const body = await response.json();

    expect(body.responseCode).toBe(405);
    expect(body.message).toMatch(/not supported/i);
  });

  test('API 10 — POST /verifyLogin with invalid credentials returns 404 User not found', async ({ request }) => {
    const client = new ApiClient(request);
    const response = await client.auth.verifyLogin('nobody@nowhere.invalid', 'WrongPassword');
    const body = await response.json();

    expect(body.responseCode).toBe(404);
    expect(body.message).toMatch(/User not found/i);
  });
});
