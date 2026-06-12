export interface UserPayload {
  name: string;
  email: string;
  password: string;
  title: string;
  birth_date: string;
  birth_month: string;
  birth_year: string;
  firstname: string;
  lastname: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  zipcode: string;
  state: string;
  city: string;
  mobile_number: string;
}

export function generateUser(overrides: Partial<UserPayload> = {}): UserPayload {
  const ts = Date.now();
  return {
    name: `Test User ${ts}`,
    email: `testuser.${ts}.${Math.random().toString(36).slice(2, 7)}@mailnull.com`,
    password: 'TestPass123!',
    title: 'Mr',
    birth_date: '15',
    birth_month: '6',
    birth_year: '1990',
    firstname: 'Test',
    lastname: `User${ts}`,
    company: 'Test Corp',
    address1: '123 Test Street',
    address2: 'Suite 100',
    country: 'United States',
    zipcode: '10001',
    state: 'New York',
    city: 'New York City',
    mobile_number: '+11234567890',
    ...overrides,
  };
}
