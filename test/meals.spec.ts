import { it, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { execSync } from 'node:child_process';

describe('Meals routes', () => {
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

  it('should be able to create a new meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Rafael Jales',
    });

    const cookies = createUserResponse.get('Set-Cookie')!;
    await request(app.server)
      .post('/meals')
      .send({
        name: 'Cafe',
        description: 'Descricao do Cafe',
        onDiet: true,
      })
      .set('Cookie', cookies)
      .expect(201);
  });

  it('should be able to list all meals', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Rafael Jales',
    });

    const cookies = createUserResponse.get('Set-Cookie')!;
    await request(app.server)
      .post('/meals')
      .send({
        name: 'Cafe',
        description: 'Descricao do Cafe',
        onDiet: true,
      })
      .set('Cookie', cookies);

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Almoco',
        description: 'Descricao do Almoco',
        onDiet: true,
      })
      .set('Cookie', cookies);

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Cafe da tarde',
        description: 'Descricao do Cafe da tarde',
        onDiet: true,
      })
      .set('Cookie', cookies);

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Jantar',
        description: 'Descricao do Jantar',
        onDiet: false,
      })
      .set('Cookie', cookies);

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Ceia',
        description: 'Descricao da Ceia',
        onDiet: true,
      })
      .set('Cookie', cookies);

    const listMealsResponse = await request(app.server)
      .get('/meals/list/')
      .set('Cookie', cookies)
      .expect(200);

    expect(listMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        name: 'Cafe',
        description: 'Descricao do Cafe',
        on_diet: 1,
      }),
      expect.objectContaining({
        name: 'Almoco',
        description: 'Descricao do Almoco',
        on_diet: 1,
      }),
      expect.objectContaining({
        name: 'Cafe da tarde',
        description: 'Descricao do Cafe da tarde',
        on_diet: 1,
      }),
      expect.objectContaining({
        name: 'Jantar',
        description: 'Descricao do Jantar',
        on_diet: 0,
      }),
      expect.objectContaining({
        name: 'Ceia',
        description: 'Descricao da Ceia',
        on_diet: 1,
      }),
    ]);
  });

  it('should be able to list a meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Rafael Jales',
    });

    const cookies = createUserResponse.get('Set-Cookie')!;
    await request(app.server)
      .post('/meals')
      .send({
        name: 'Cafe',
        description: 'Descricao do Cafe',
        onDiet: true,
      })
      .set('Cookie', cookies);

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Almoco',
        description: 'Descricao do Almoco',
        onDiet: true,
      })
      .set('Cookie', cookies);

    const listMealsResponse = await request(app.server)
      .get('/meals/list/')
      .set('Cookie', cookies)
      .expect(200);

    const mealId = listMealsResponse.body.meals[0].id;
    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200);

    expect(getMealResponse.body.meals).toEqual(
      expect.objectContaining({
        name: 'Cafe',
        description: 'Descricao do Cafe',
        on_diet: 1,
      }),
    );
  });

  it('should be able to edit a meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Rafael Jales',
    });

    const cookies = createUserResponse.get('Set-Cookie')!;
    await request(app.server)
      .post('/meals')
      .send({
        name: 'Cafe',
        description: 'Descricao do Cafe',
        onDiet: true,
      })
      .set('Cookie', cookies);

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Almoco',
        description: 'Descricao do Almoco',
        onDiet: true,
      })
      .set('Cookie', cookies);

    const listMealsResponse = await request(app.server)
      .get('/meals/list/')
      .set('Cookie', cookies)
      .expect(200);

    const mealId = listMealsResponse.body.meals[0].id;
    await request(app.server)
      .put(`/meals/${mealId}`)
      .send({
        name: 'Cafe Editado',
        description: 'Descricao do Cafe Editado',
        onDiet: false,
      })
      .set('Cookie', cookies)
      .expect(204);
  });

  it('should be able to delete a meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Rafael Jales',
    });

    const cookies = createUserResponse.get('Set-Cookie')!;
    await request(app.server)
      .post('/meals')
      .send({
        name: 'Cafe',
        description: 'Descricao do Cafe',
        onDiet: true,
      })
      .set('Cookie', cookies);

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Almoco',
        description: 'Descricao do Almoco',
        onDiet: true,
      })
      .set('Cookie', cookies);

    const listMealsResponse = await request(app.server)
      .get('/meals/list/')
      .set('Cookie', cookies)
      .expect(200);

    const mealId = listMealsResponse.body.meals[0].id;
    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(204);
  });

  it('should be able to get all the metrics of a user', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Rafael Jales',
    });

    const cookies = createUserResponse.get('Set-Cookie')!;
    await request(app.server)
      .post('/meals')
      .send({
        name: 'Cafe',
        description: 'Descricao do Cafe',
        onDiet: true,
      })
      .set('Cookie', cookies);

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Almoco',
        description: 'Descricao do Almoco',
        onDiet: true,
      })
      .set('Cookie', cookies);

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Cafe da tarde',
        description: 'Descricao do Cafe da tarde',
        onDiet: true,
      })
      .set('Cookie', cookies);

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Jantar',
        description: 'Descricao do Jantar',
        onDiet: false,
      })
      .set('Cookie', cookies);

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Ceia',
        description: 'Descricao da Ceia',
        onDiet: true,
      })
      .set('Cookie', cookies);

    const listMealsResponse = await request(app.server)
      .get('/meals/metrics/')
      .set('Cookie', cookies)
      .expect(200);

    expect(listMealsResponse.body).toEqual(
      expect.objectContaining({
        'Meals Total': 5,
        'Meals Total on Diet': 4,
        'Meals Total off Diet': 1,
        'Best Sequence of meal on Diet': 3,
      }),
    );
  });
});
