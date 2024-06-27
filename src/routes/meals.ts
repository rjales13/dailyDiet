import { FastifyInstance } from 'fastify';
import { knex } from '../database';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { checkSessionIdExists } from '../middlewares/check-session-id-exists';

export async function mealsRoutes(app: FastifyInstance) {
  app.get(
    '/list/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies;
      const meals = await knex('meals').where('session_id', sessionId).select();
      return { meals };
    },
  );

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies;
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = getMealParamsSchema.parse(request.params);
      const meals = await knex('meals')
        .where({ id, session_id: sessionId })
        .first();

      return { meals };
    },
  );

  app.get(
    '/metrics/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies;
      const count = await knex('meals')
        .where('session_id', sessionId)
        .count('* as count')
        .first();

      const countOnDiet = await knex('meals')
        .where({ session_id: sessionId, on_diet: true })
        .count('* as totalOnDiet')
        .first();

      const countOffDiet = await knex('meals')
        .where({ session_id: sessionId, on_diet: false })
        .count('* as totalOffDiet')
        .first();

      const meals = await knex('meals').where('session_id', sessionId).select();

      let maxSequence = 0;
      let currentSequence = 0;
      for (const value of meals) {
        if (value.on_diet) {
          currentSequence++;
          if (currentSequence > maxSequence) maxSequence = currentSequence;
        } else {
          currentSequence = 0;
        }
      }

      return {
        'Meals Total': count?.count,
        'Meals Total on Diet': countOnDiet?.totalOnDiet,
        'Meals Total off Diet': countOffDiet?.totalOffDiet,
        'Best Sequence of meal on Diet': maxSequence,
      };
    },
  );

  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        onDiet: z.boolean(),
      });

      const { sessionId } = request.cookies;
      const { name, description, onDiet } = createMealBodySchema.parse(
        request.body,
      );

      await knex('meals').insert({
        id: randomUUID(),
        session_id: sessionId,
        name,
        description,
        on_diet: onDiet,
      });

      return reply.status(201).send();
    },
  );

  app.put(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies;

      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const getMealBodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        onDiet: z.boolean().optional(),
      });

      const { id } = getMealParamsSchema.parse(request.params);
      const { name, description, onDiet } = getMealBodySchema.parse(
        request.body,
      );

      interface Meal {
        name?: string;
        description?: string;
        on_diet?: boolean;
      }

      const obj: Meal = {};
      if (name) obj.name = name;
      if (description) obj.description = description;
      if (onDiet) obj.on_diet = onDiet;

      await knex('meals').update(obj).where({ id, session_id: sessionId });

      return reply.status(204).send();
    },
  );

  app.delete(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies;
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = getMealParamsSchema.parse(request.params);
      await knex('meals').delete().where({ id, session_id: sessionId });

      return reply.status(204).send();
    },
  );
}
