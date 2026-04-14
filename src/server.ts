// Libraries
import fastify from 'fastify';

// Application
import { connection } from './database.js';

const app = fastify();

app.get('/welcome', async () => {
  const tables = await connection('sqlite_schema').select('*');
  return tables;
});

app.listen({ port: 3333 }).then(() => console.log('HTTP server running!'));
