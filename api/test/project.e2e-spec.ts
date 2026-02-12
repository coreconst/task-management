import { TestApp } from './test-app';

jest.setTimeout(30000);

describe('ProjectModule (e2e)', () => {
  let ctx: TestApp;
  let auth: Awaited<ReturnType<TestApp['authHttp']>>;

  beforeAll(async () => {
    ctx = await TestApp.create();
    await ctx.connection.db.dropDatabase();
    auth = await ctx.authHttp();
  });

  afterAll(async () => {
    await ctx.close();
  });

  it('creates a project', async () => {
    const response = await auth
      .post('/api/projects')
      .send({ name: 'Test Project' })
      .expect(201);

    expect(response.body.name).toBe('Test Project');
    expect(response.body._id).toBeDefined();
  });

  it('gets a project by id', async () => {
    const createResponse = await auth
      .post('/api/projects')
      .send({ name: 'Read Project' })
      .expect(201);

    const projectId = createResponse.body._id as string;
    const response = await auth.get(`/api/projects/${projectId}`).expect(200);

    expect(response.body._id).toBe(projectId);
    expect(response.body.name).toBe('Read Project');
  });

  it('gets all projects', async () => {
     await auth
        .get('/api/projects')
        .expect(200);
  });
});
