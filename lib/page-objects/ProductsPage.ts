import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductsPage extends BasePage {
  readonly allProductsHeading: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly productCards: Locator;
  readonly searchedHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.allProductsHeading = page.locator('h2:has-text("All Products")');
    this.searchInput = page.locator('input#search_product');
    this.searchButton = page.locator('button#submit_search');
    this.productCards = page.locator('.product-image-wrapper');
    this.searchedHeading = page.locator('h2:has-text("Searched Products")');
  }

  async goto(): Promise<void> {
    await this.navigate('/products');
  }

  async search(keyword: string): Promise<void> {
    await this.searchInput.fill(keyword);
    await this.searchButton.click();
  }

  async hoverAndAddToCart(index = 0): Promise<void> {
    const card = this.productCards.nth(index);
    await card.hover();
    await card.locator('.add-to-cart').first().click();
  }

  async viewProduct(index = 0): Promise<void> {
    // Navigate directly to avoid Google ad vignette overlays intercepting the click
    const href = await this.productCards
      .nth(index)
      .locator('a[href*="product_details"]')
      .getAttribute('href');
    if (href) {
      await this.page.goto(href);
    }
  }
}
