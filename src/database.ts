// Libraries
import knex, { type Knex } from 'knex';

// Aplication
import { env } from './env/index.ts';

export const config: Knex.Config = {
  client: 'sqlite',
  connection: {
    filename: env.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './database/migrations'
  }
};

export const connection = knex(config);
