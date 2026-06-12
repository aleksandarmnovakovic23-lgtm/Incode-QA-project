import { Page } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  protected async navigate(path: string): Promise<void> {
    // domcontentloaded avoids waiting for slow third-party ad resources on this site
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  async isLoggedIn(): Promise<boolean> {
    return this.page.locator('a[href="/logout"]').isVisible();
  }

  async getLoggedInUsername(): Promise<string | null> {
    const el = this.page.locator('li:has-text("Logged in as") b');
    return (await el.isVisible()) ? el.textContent() : null;
  }

  async logout(): Promise<void> {
    // Use JS click to bypass any ad overlay that might intercept the link
    await this.page.evaluate(() => {
      (document.querySelector('a[href="/logout"]') as HTMLElement)?.click();
    });
    await this.page.waitForURL(/\/login/, { timeout: 10_000 });
  }
}
