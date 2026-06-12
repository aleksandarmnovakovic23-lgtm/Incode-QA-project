import { test, expect } from '@playwright/test';
import { HomePage } from '../../lib/page-objects/HomePage';

test.describe('Homepage', () => {
  test('loads successfully with nav and hero slider visible', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(page).toHaveTitle(/Automation Exercise/i);
    await expect(page.locator('.navbar-nav')).toBeVisible();
    await expect(home.slider).toBeVisible();
  });

  test('featured products section renders at least one product', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.featuredProducts).toBeVisible();
    const count = await page.locator('.features_items .col-sm-4').count();
    expect(count).toBeGreaterThan(0);
  });

  test('primary nav links are present', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    const expectedLinks = [
      { href: '/', label: 'Home' },
      { href: '/products', label: 'Products' },
      { href: '/view_cart', label: 'Cart' },
      { href: '/login', label: 'Signup / Login' },
    ];

    for (const link of expectedLinks) {
      await expect(
        page.locator(`.navbar-nav a[href="${link.href}"]`),
        `Nav link "${link.label}" should be visible`,
      ).toBeVisible();
    }
  });

  test('subscription form accepts an email and shows success', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.subscribeInput).toBeVisible();
    await home.subscribeWithEmail('subscribe.test@example.com');
    await expect(page.locator('#success-subscribe')).toBeVisible();
  });
});
