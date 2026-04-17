// Libraries
import fastify from 'fastify';
import cookie from '@fastify/cookie';

// Application
import { transactionsRoutes } from './routes/transactions.ts';

export const app: fastify.FastifyInstance = fastify();

app.register(cookie);

app.addHook('preHandler', async (request) => {
  console.log(`[${request.method}] ${request.url}`);
});

app.register(transactionsRoutes, {
  prefix: 'transactions',
});
