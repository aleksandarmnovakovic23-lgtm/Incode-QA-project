import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly slider: Locator;
  readonly featuredProducts: Locator;
  readonly subscribeInput: Locator;
  readonly subscribeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.slider = page.locator('#slider');
    this.featuredProducts = page.locator('.features_items');
    this.subscribeInput = page.locator('#susbscribe_email');
    this.subscribeButton = page.locator('#subscribe');
  }

  async goto(): Promise<void> {
    await this.navigate('/');
  }

  async subscribeWithEmail(email: string): Promise<void> {
    await this.subscribeInput.fill(email);
    await this.subscribeButton.click();
  }
}
