// Libraries
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

// Application
import { connection } from '../database.ts';

export async function transactionsRoutes(app: FastifyInstance) {
  // List
  app.get('/', async () => {
    const transactions = await connection('transactions').select();
    const result = await connection('transactions')
      .count('id', { as: 'count' })
      .first();

    const count = result?.count ?? 0;

    return { transactions, count };
  });

  // Get
  app.get('/:id', async (request) => {
    const getTransactionsParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getTransactionsParamsSchema.parse(request.params);

    const transaction = await connection('transactions')
      .select('*')
      .where('id', id)
      .first();

    return transaction;
  });

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

    await connection('transactions').insert({
      id: crypto.randomUUID(),
      amount: type === 'credit' ? amount : amount * -1,
      title,
    });

    return reply.status(201).send();
  });
}
