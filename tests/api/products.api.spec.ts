import { test, expect } from '@playwright/test';
import { ApiClient } from '../../lib/api-client';

/**
 * APIs 1–2: /productsList
 * The server embeds its own status code inside the JSON body (responseCode).
 * We assert on that field rather than the HTTP status, which is always 200.
 */
test.describe('Products API', () => {
  test('GET /productsList returns 200 with a non-empty products array', async ({ request }) => {
    const client = new ApiClient(request);
    const response = await client.products.list();
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.responseCode).toBe(200);
    expect(Array.isArray(body.products)).toBe(true);
    expect(body.products.length).toBeGreaterThan(0);
  });

  test('GET /productsList each product has required fields', async ({ request }) => {
    const client = new ApiClient(request);
    const response = await client.products.list();
    const body = await response.json();

    for (const product of body.products.slice(0, 5)) {
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('brand');
      expect(product).toHaveProperty('category');
      expect(product.category).toHaveProperty('usertype');
      expect(product.category).toHaveProperty('category');
    }
  });

  test('POST /productsList is not supported and returns responseCode 405', async ({ request }) => {
    const client = new ApiClient(request);
    const response = await client.products.postUnsupported();
    const body = await response.json();

    expect(body.responseCode).toBe(405);
    expect(body.message).toMatch(/not supported/i);
  });
});
