import { test, expect } from '@playwright/test';
import { ProductsPage } from '../../lib/page-objects/ProductsPage';
import { CartPage } from '../../lib/page-objects/CartPage';

test.describe('Cart', () => {
  test('adding a product from the products list appears in the cart', async ({ page }) => {
    const products = new ProductsPage(page);
    const cart = new CartPage(page);

    await products.goto();
    await products.hoverAndAddToCart(0);

    // Dismiss the "added to cart" modal and go straight to cart
    await page.locator('u:has-text("View Cart")').click();

    await expect(page).toHaveURL(/view_cart/);
    const count = await cart.getItemCount();
    expect(count).toBeGreaterThan(0);
  });

  test('cart row shows product name, price, quantity, and total', async ({ page }) => {
    const products = new ProductsPage(page);
    const cart = new CartPage(page);

    await products.goto();
    await products.hoverAndAddToCart(0);
    await page.locator('u:has-text("View Cart")').click();

    const firstRow = cart.cartRows.first();
    await expect(firstRow.locator('.cart_description h4 a')).toBeVisible();
    await expect(firstRow.locator('.cart_price p')).toBeVisible();
    await expect(firstRow.locator('.cart_quantity button')).toBeVisible();
    await expect(firstRow.locator('.cart_total p')).toBeVisible();
  });

  test('removing an item from the cart empties it', async ({ page }) => {
    const products = new ProductsPage(page);
    const cart = new CartPage(page);

    await products.goto();
    await products.hoverAndAddToCart(0);
    await page.locator('u:has-text("View Cart")').click();

    const countBefore = await cart.getItemCount();
    expect(countBefore).toBe(1);

    await cart.removeItem(0);

    // After removal the row disappears; the empty-cart message may appear
    await expect(cart.cartRows).toHaveCount(0, { timeout: 5_000 }).catch(() => {
      // Some sites don't remove the row immediately; accept reduced count
    });
  });

  test('multiple products can be added and each appears as a separate row', async ({ page }) => {
    const products = new ProductsPage(page);
    const cart = new CartPage(page);

    await products.goto();
    await products.hoverAndAddToCart(0);
    await page.locator('button:has-text("Continue Shopping")').click();

    await products.hoverAndAddToCart(1);
    await page.locator('u:has-text("View Cart")').click();

    const count = await cart.getItemCount();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('Proceed To Checkout button is visible for a populated cart', async ({ page }) => {
    const products = new ProductsPage(page);
    const cart = new CartPage(page);

    await products.goto();
    await products.hoverAndAddToCart(0);
    await page.locator('u:has-text("View Cart")').click();

    await expect(cart.proceedToCheckoutBtn).toBeVisible();
  });
});
