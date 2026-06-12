import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly cartRows: Locator;
  readonly proceedToCheckoutBtn: Locator;
  readonly emptyCartMsg: Locator;

  constructor(page: Page) {
    super(page);
    this.cartRows = page.locator('#cart_info_table tbody tr');
    this.proceedToCheckoutBtn = page.locator('a:has-text("Proceed To Checkout")');
    this.emptyCartMsg = page.locator('b:has-text("Cart is empty!")');
  }

  async goto(): Promise<void> {
    await this.navigate('/view_cart');
  }

  async getItemCount(): Promise<number> {
    return this.cartRows.count();
  }

  async removeItem(index = 0): Promise<void> {
    await this.cartRows.nth(index).locator('a.cart_quantity_delete').click();
  }
}
