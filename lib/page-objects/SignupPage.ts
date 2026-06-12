import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { UserPayload } from '../test-data';

export class SignupPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async fillAccountInfo(user: UserPayload): Promise<void> {
    await this.page.check(`input[value="${user.title}"]`);
    await this.page.fill('input[data-qa="password"]', user.password);
    await this.page.selectOption('select[data-qa="days"]', user.birth_date);
    await this.page.selectOption('select[data-qa="months"]', user.birth_month);
    await this.page.selectOption('select[data-qa="years"]', user.birth_year);

    await this.page.fill('input[data-qa="first_name"]', user.firstname);
    await this.page.fill('input[data-qa="last_name"]', user.lastname);
    await this.page.fill('input[data-qa="company"]', user.company);
    await this.page.fill('input[data-qa="address"]', user.address1);
    if (user.address2) {
      await this.page.fill('input[data-qa="address2"]', user.address2);
    }
    await this.page.selectOption('select[data-qa="country"]', user.country);
    await this.page.fill('input[data-qa="state"]', user.state);
    await this.page.fill('input[data-qa="city"]', user.city);
    await this.page.fill('input[data-qa="zipcode"]', user.zipcode);
    await this.page.fill('input[data-qa="mobile_number"]', user.mobile_number);
  }

  async submit(): Promise<void> {
    await this.page.click('button[data-qa="create-account"]');
  }
}
