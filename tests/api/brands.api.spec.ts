import { test, expect } from '@playwright/test';
import { ApiClient } from '../../lib/api-client';

/**
 * APIs 3–4: /brandsList
 */
test.describe('Brands API', () => {
  test('GET /brandsList returns 200 with a non-empty brands array', async ({ request }) => {
    const client = new ApiClient(request);
    const response = await client.brands.list();
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.responseCode).toBe(200);
    expect(Array.isArray(body.brands)).toBe(true);
    expect(body.brands.length).toBeGreaterThan(0);
  });

  test('GET /brandsList each brand has id and brand name', async ({ request }) => {
    const client = new ApiClient(request);
    const response = await client.brands.list();
    const body = await response.json();

    for (const brand of body.brands) {
      expect(typeof brand.id).toBe('number');
      expect(typeof brand.brand).toBe('string');
      expect(brand.brand.length).toBeGreaterThan(0);
    }
  });

  test('PUT /brandsList is not supported and returns responseCode 405', async ({ request }) => {
    const client = new ApiClient(request);
    const response = await client.brands.putUnsupported();
    const body = await response.json();

    expect(body.responseCode).toBe(405);
    expect(body.message).toMatch(/not supported/i);
  });
});
