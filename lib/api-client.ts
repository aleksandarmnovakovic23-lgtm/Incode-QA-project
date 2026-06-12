import { APIRequestContext } from '@playwright/test';
import { UserPayload } from './test-data';

/**
 * Thin typed wrapper around Playwright's APIRequestContext.
 * Keeps test files free of URL strings and form-building boilerplate.
 */
export class ApiClient {
  constructor(private readonly req: APIRequestContext) {}

  readonly products = {
    list: () => this.req.get('/api/productsList'),
    postUnsupported: () => this.req.post('/api/productsList'),
  };

  readonly brands = {
    list: () => this.req.get('/api/brandsList'),
    putUnsupported: () => this.req.put('/api/brandsList'),
  };

  readonly search = {
    byKeyword: (keyword: string) =>
      this.req.post('/api/searchProduct', { form: { search_product: keyword } }),
    withoutParam: () =>
      this.req.post('/api/searchProduct', { form: {} }),
  };

  readonly auth = {
    verifyLogin: (email: string, password: string) =>
      this.req.post('/api/verifyLogin', { form: { email, password } }),
    verifyLoginMissingEmail: (password: string) =>
      this.req.post('/api/verifyLogin', { form: { password } }),
    deleteUnsupported: () => this.req.delete('/api/verifyLogin'),
  };

  readonly account = {
    create: (user: UserPayload) =>
      this.req.post('/api/createAccount', { form: { ...user } }),
    update: (user: UserPayload) =>
      this.req.put('/api/updateAccount', { form: { ...user } }),
    delete: (email: string, password: string) =>
      this.req.delete('/api/deleteAccount', { form: { email, password } }),
    getByEmail: (email: string) =>
      this.req.get('/api/getUserDetailByEmail', { params: { email } }),
  };
}
