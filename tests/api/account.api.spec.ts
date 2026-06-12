import { test, expect } from '@playwright/test';
import { ApiClient } from '../../lib/api-client';
import { generateUser } from '../../lib/test-data';

/**
 * APIs 11–14: /createAccount, /updateAccount, /deleteAccount, /getUserDetailByEmail
 *
 * These tests run in serial order because they represent a full account lifecycle.
 * Running them in parallel would cause state conflicts.
 */
test.describe.serial('Account API — full lifecycle', () => {
  const user = generateUser();
  const client = { value: null as unknown as ApiClient };
ApiClient
  test.beforeEach(({ request }) => {
    client.value = new ApiClient(request);
  });

  test('API 11 — POST /createAccount creates a new user (201)', async () => {
    const response = await client.value.account.create(user);
    const body = await response.json();

    expect(body.responseCode).toBe(201);
    expect(body.message).toMatch(/User created/i);
  });

  test('API 14 — GET /getUserDetailByEmail returns correct user data (200)', async () => {
    const response = await client.value.account.getByEmail(user.email);
    const body = await response.json();

    expect(body.responseCode).toBe(200);
    expect(body.user).toBeDefined();
    expect(body.user.email).toBe(user.email);
    expect(body.user.name).toBe(user.name);
  });

  test('API 13 — PUT /updateAccount updates user details (200)', async () => {
    const updated = {
      ...user,
      name: `Updated ${user.name}`,
      firstname: 'Updated',
      lastname: 'Name',
      city: 'Brooklyn',
    };
    const response = await client.value.account.update(updated);
    const body = await response.json();

    expect(body.responseCode).toBe(200);
    expect(body.message).toMatch(/User updated/i);
  });

  test('GET /getUserDetailByEmail reflects update', async () => {
    const response = await client.value.account.getByEmail(user.email);
    const body = await response.json();

    expect(body.responseCode).toBe(200);
    expect(body.user.name).toContain('Updated');
  });

  test('API 12 — DELETE /deleteAccount removes the user (200)', async () => {
    const response = await client.value.account.delete(user.email, user.password);
    const body = await response.json();

    expect(body.responseCode).toBe(200);
    expect(body.message).toMatch(/Account deleted/i);
  });

  test('GET /getUserDetailByEmail returns 404 after deletion', async () => {
    const response = await client.value.account.getByEmail(user.email);
    const body = await response.json();

    expect(body.responseCode).toBe(404);
  });
});

test.describe('Account API — error cases', () => {
  test('POST /createAccount with duplicate email returns error', async ({ request }) => {
    const client = new ApiClient(request);
    const user = generateUser();

    const first = await client.account.create(user);
    expect((await first.json()).responseCode).toBe(201);

    try {
      const duplicate = await client.account.create(user);
      const body = await duplicate.json();
      // API should reject duplicate registration — exact code may be 400 or 409
      expect(body.responseCode).not.toBe(201);
    } finally {
      await client.account.delete(user.email, user.password);
    }
  });

  test('GET /getUserDetailByEmail for unknown email returns 404', async ({ request }) => {
    const client = new ApiClient(request);
    const response = await client.account.getByEmail('does-not-exist@example.invalid');
    const body = await response.json();

    expect(body.responseCode).toBe(404);
  });
});
