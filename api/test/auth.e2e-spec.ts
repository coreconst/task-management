import { TestApp } from './test-app';

jest.setTimeout(30000);

describe('AuthModule (e2e)', () => {
  let ctx: TestApp;

  beforeAll(async () => {
    ctx = await TestApp.create();
    await ctx.connection.db.dropDatabase();
  });

  afterAll(async () => {
    if (ctx) {
      await ctx.close();
    }
  });

  it('registers a user', async () => {
    const email = `test_${Date.now()}@example.com`;
    const response = await ctx.http
      .post('/api/auth/register')
      .send({ email, password: 'password', name: 'Test' })
      .expect(201);

    expect(response.body.email).toBe(email);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.id).toBeDefined();
  });

  it('rejects duplicate registration', async () => {
    const email = `dup_${Date.now()}@example.com`;
    await ctx.http
      .post('/api/auth/register')
      .send({ email, password: 'password', name: 'Dup' })
      .expect(201);

    await ctx.http
      .post('/api/auth/register')
      .send({ email, password: 'password', name: 'Dup' })
      .expect(409);
  });

  it('logs in with valid credentials', async () => {
    const email = `login_${Date.now()}@example.com`;
    await ctx.http
      .post('/api/auth/register')
      .send({ email, password: 'password', name: 'Login' })
      .expect(201);

    const response = await ctx.http
      .post('/api/auth/login')
      .send({ email, password: 'password' })
      .expect(201);

    expect(response.body.accessToken).toBeDefined();
    expect(response.body.email).toBe(email);
  });

  it('rejects invalid password', async () => {
    const email = `wrong_${Date.now()}@example.com`;
    await ctx.http
      .post('/api/auth/register')
      .send({ email, password: 'password', name: 'Wrong' })
      .expect(201);

    await ctx.http
      .post('/api/auth/login')
      .send({ email, password: 'badpass' })
      .expect(401);
  });
});
