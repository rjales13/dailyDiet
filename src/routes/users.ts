import { FastifyInstance } from 'fastify';
import { knex } from '../database';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { checkSessionIdExists } from '../middlewares/check-session-id-exists';

export async function usersRoutes(app: FastifyInstance) {
  // GET adicional para listar todos usuarios independente do Cookie
  app.get('/', async () => {
    const users = await knex('users').select();
    return { users };
  });

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies;
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = getTransactionParamsSchema.parse(request.params);
      const users = await knex('users')
        .where({ id, session_id: sessionId })
        .first();

      return { users };
    },
  );

  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
    });

    const { name } = createUserBodySchema.parse(request.body);

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();
      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    await knex('users').insert({
      id: randomUUID(),
      name,
      session_id: sessionId,
    });

    return reply.status(201).send();
  });
}
