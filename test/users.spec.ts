import { it, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { execSync } from 'node:child_process';

describe('User routes', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
  });

  it('should be able to create a new user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'Rafael Jales',
      })
      .expect(201);
  });

  it('should be able to list all users', async () => {
    await request(app.server).post('/users').send({
      name: 'Rafael Jales',
    });

    await request(app.server).post('/users').send({
      name: 'Larissa Romasz',
    });

    const listUsersResponse = await request(app.server)
      .get('/users')
      .expect(200);

    expect(listUsersResponse.body.users).toEqual([
      expect.objectContaining({
        name: 'Rafael Jales',
      }),
      expect.objectContaining({
        name: 'Larissa Romasz',
      }),
    ]);
  });

  it('should be able to get a specific user', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Rafael Jales',
    });

    const cookies = createUserResponse.get('Set-Cookie')!;
    const listUserResponse = await request(app.server)
      .get('/users')
      .set('Cookie', cookies)
      .expect(200);

    const userId = listUserResponse.body.users[0].id;
    const getUserResponse = await request(app.server)
      .get(`/users/${userId}`)
      .set('Cookie', cookies)
      .expect(200);

    expect(getUserResponse.body.users).toEqual(
      expect.objectContaining({
        name: 'Rafael Jales',
      }),
    );
  });
});
