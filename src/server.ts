// Libraries
import fastify from 'fastify';
import cookie from '@fastify/cookie';

// Application
import { env } from './env/index.ts';
import { transactionsRoutes } from './routes/transactions.ts';

const app: fastify.FastifyInstance = fastify();

app.register(cookie);
app.register(transactionsRoutes, {
  prefix: 'transactions',
});

app.listen({ port: env.PORT }).then(() => console.log('HTTP server running!'));
