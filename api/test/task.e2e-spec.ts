import { TestApp } from './test-app';

jest.setTimeout(30000);

describe('TaskModule (e2e)', () => {
  let ctx: TestApp;
  let auth: Awaited<ReturnType<TestApp['authHttp']>>;
  let projectId: string;

  beforeAll(async () => {
    ctx = await TestApp.create();
    await ctx.connection.db.dropDatabase();
    auth = await ctx.authHttp();

    const projectResponse = await auth
      .post('/api/projects')
      .send({ name: 'Tasks Project' })
      .expect(201);

    projectId = projectResponse.body._id as string;
  });

  afterAll(async () => {
    await ctx.close();
  });

  it('creates a task', async () => {
    const response = await auth
      .post('/api/tasks')
      .send({ name: 'Task 1', projectId })
      .expect(201);

    expect(response.body.name).toBe('Task 1');
    expect(response.body.projectId).toBeDefined();
  });

  it('lists tasks with filters', async () => {
    await auth
      .post('/api/tasks')
      .send({ name: 'Task 2', projectId, status: 'todo' })
      .expect(201);

    const response = await auth
      .get(`/api/tasks?projectId=${projectId}&status=todo&sortBy=createdAt&sortOrder=desc`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('updates a task', async () => {
    const createResponse = await auth
      .post('/api/tasks')
      .send({ name: 'Task Update', projectId })
      .expect(201);

    const taskId = createResponse.body._id as string;
    const response = await auth
      .patch(`/api/tasks/${taskId}`)
      .send({ status: 'done' })
      .expect(200);

    expect(response.body.status).toBe('done');
  });

  it('deletes a task', async () => {
    const createResponse = await auth
      .post('/api/tasks')
      .send({ name: 'Task Delete', projectId })
      .expect(201);

    const taskId = createResponse.body._id as string;
    await auth.delete(`/api/tasks/${taskId}`).expect(200);
  });
});
