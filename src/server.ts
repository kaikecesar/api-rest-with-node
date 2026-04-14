// Libraries
import fastify from 'fastify';

// Application
import { connection } from './database.js';
import { env } from './env/index.ts';

const app = fastify();

app.get('/welcome', async () => {
  const tables = await connection('sqlite_schema').select('*');
  return tables;
});

app.listen({ port: env.PORT }).then(() => console.log('HTTP server running!'));
