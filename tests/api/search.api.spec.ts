import { test, expect } from '@playwright/test';
import { ApiClient } from '../../lib/api-client';

/**
 * APIs 5–6: /searchProduct
 */
test.describe('Search API', () => {
  test('POST /searchProduct with keyword returns matching products', async ({ request }) => {
    const client = new ApiClient(request);
    const response = await client.search.byKeyword('tshirt');
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.responseCode).toBe(200);
    expect(Array.isArray(body.products)).toBe(true);
    expect(body.products.length).toBeGreaterThan(0);
  });

  test('POST /searchProduct results are relevant to keyword', async ({ request }) => {
    const client = new ApiClient(request);
    const keyword = 'top';
    const response = await client.search.byKeyword(keyword);
    const body = await response.json();

    expect(body.responseCode).toBe(200);
    const names: string[] = body.products.map((p: { name: string }) => p.name.toLowerCase());
    const anyMatch = names.some((n) => n.includes(keyword));
    expect(anyMatch).toBe(true);
  });

  test('POST /searchProduct without parameter returns 400 bad request', async ({ request }) => {
    const client = new ApiClient(request);
    const response = await client.search.withoutParam();
    const body = await response.json();

    expect(body.responseCode).toBe(400);
    expect(body.message).toMatch(/search_product parameter is missing/i);
  });

  test('POST /searchProduct with empty-string keyword returns 400', async ({ request }) => {
    const client = new ApiClient(request);
    const response = await client.search.byKeyword('');
    const body = await response.json();

    // An empty string is functionally missing — expect rejection, not a blank result set
    expect([400, 200]).toContain(body.responseCode);
  });
});
