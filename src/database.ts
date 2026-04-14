// Libraries
import knex from 'knex';

export const connection = knex({
  client: 'sqlite',
  connection: {
    filename: './tmp/app.db',
  },
});
