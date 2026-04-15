// Libraries
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

// Application
import { connection } from '../database.ts';

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/welcome', async () => {
    const tables = await connection('sqlite_schema').select('*');
    return tables;
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
