// Libraries
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

// Application
import { connection } from '../database.ts';
import { checkSessionIdExists } from '../middlewares/check-session-id-exists.ts';

export async function transactionsRoutes(app: FastifyInstance) {
  // List
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies;

      const transactions = await connection('transactions')
        .where('session_id', sessionId)
        .select();

      const result = await connection('transactions')
        .count('id', { as: 'count' })
        .first();

      const count = result?.count ?? 0;

      return { transactions, count };
    },
  );

  // Get
  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const getTransactionsParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { sessionId } = request.cookies;

      const { id } = getTransactionsParamsSchema.parse(request.params);

      const transaction = await connection('transactions')
        .select('*')
        .where({ id, session_id: sessionId })
        .first();

      return transaction;
    },
  );

  // Summary
  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies;

      const summary = await connection('transactions')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' })
        .first();

      return { summary };
    },
  );

  app.post('/', async (request, reply) => {
    // Validation schema
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['debit', 'credit']),
    });

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    );

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = crypto.randomUUID();

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    await connection('transactions').insert({
      id: crypto.randomUUID(),
      amount: type === 'credit' ? amount : amount * -1,
      title,
      session_id: sessionId,
    });

    return reply.status(201).send();
  });
}
