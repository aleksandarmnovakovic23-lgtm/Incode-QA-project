import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly loginErrorMsg: Locator;
  readonly signupHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.loginErrorMsg = page.locator('p:has-text("Your email or password is incorrect!")');
    this.signupHeading = page.locator('h2:has-text("New User Signup!")');
  }

  async goto(): Promise<void> {
    await this.navigate('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.page.fill('input[data-qa="login-email"]', email);
    await this.page.fill('input[data-qa="login-password"]', password);
    await this.page.click('button[data-qa="login-button"]');
  }

  async initiateSignup(name: string, email: string): Promise<void> {
    await this.page.fill('input[data-qa="signup-name"]', name);
    await this.page.fill('input[data-qa="signup-email"]', email);
    await this.page.click('button[data-qa="signup-button"]');
  }
}
