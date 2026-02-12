import {TestApp} from "./test-app";

describe('AppController (e2e)', () => {
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

   it('/api/test (GET) return 200', async () => {
    const auth = await ctx.authHttp();

    auth.get('/api/test').expect(200);
  });
});
