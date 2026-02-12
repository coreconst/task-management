import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as request from 'supertest';
import { AuthModule } from '../src/modules/auth/auth.module';
import { UserModule } from '../src/modules/user/user.module';

export class TestApp {
  app: INestApplication;
  connection: Connection;
  http: ReturnType<typeof request>;

  private constructor(
    app: INestApplication,
    connection: Connection,
    http: ReturnType<typeof request>
  ) {
    this.app = app;
    this.connection = connection;
    this.http = http;
  }

  static async create(): Promise<TestApp> {
    const mongoUri =
        process.env.MONGO_TEST_URI ?? 'mongodb://mongo-test:27017/task-management_test';

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRoot(mongoUri),
        UserModule,
        AuthModule,
      ],
    }).compile();

    const app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    const connection = moduleRef.get<Connection>(getConnectionToken());
    const http = request(app.getHttpServer());

    return new TestApp(app, connection, http);
  }

  async close() {
    await this.app.close();
  }

  async createUser() {
    const email = 'user@example.com';
    const password = 'password';
    const name = 'Test User';

    await this.http
      .post('/api/auth/register')
      .send({ email, password, name })
      .expect(201);

    return { email, password };
  }

  async authHttp(): Promise<AuthHttpClient> {
    const { email, password } = await this.createUser();
    const response = await this.http
      .post('/api/auth/login')
      .send({ email, password })
      .expect(201);

    const token = response.body.accessToken as string;
    return {
      get: (url: string) => this.http.get(url).set('Authorization', `Bearer ${token}`),
      post: (url: string) => this.http.post(url).set('Authorization', `Bearer ${token}`),
      put: (url: string) => this.http.put(url).set('Authorization', `Bearer ${token}`),
      patch: (url: string) => this.http.patch(url).set('Authorization', `Bearer ${token}`),
      delete: (url: string) => this.http.delete(url).set('Authorization', `Bearer ${token}`),
    };
  }
}

type AuthHttpClient = {
  get: (url: string) => request.Test;
  post: (url: string) => request.Test;
  put: (url: string) => request.Test;
  patch: (url: string) => request.Test;
  delete: (url: string) => request.Test;
};
