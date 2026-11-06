import { DataSource, type DataSourceOptions } from 'typeorm';
import { entities } from './entities.js';
import { Schema1793951458401 } from './migrations/1793951458401-Schema.js';

export type DbEnv = {
  DATABASE_URL?: string;
  DB_HOST?: string;
  DB_PORT?: string;
  DB_USER?: string;
  DB_PASSWORD?: string;
  DB_NAME?: string;
};

/**
 * Local: DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME, no SSL.
 * Production (Neon): DATABASE_URL only, SSL on, certificate not verified
 * (Neon’s chain is not in the default Node trust store).
 * synchronize is always off — schema changes go through migrations.
 */
export function getDataSourceOptions(
  env: DbEnv = process.env,
): DataSourceOptions {
  const url = env.DATABASE_URL?.trim();
  const shared = {
    type: 'postgres' as const,
    entities,
    migrations: [Schema1793951458401],
    synchronize: false,
    migrationsRun: false,
  };

  if (url) {
    return {
      ...shared,
      url,
      ssl: { rejectUnauthorized: false },
    };
  }

  return {
    ...shared,
    host: env.DB_HOST || 'localhost',
    port: Number(env.DB_PORT || 5432),
    username: env.DB_USER || 'expense',
    password: env.DB_PASSWORD || 'expense',
    database: env.DB_NAME || 'expense_tracker',
  };
}

export function createAppDataSource(env: DbEnv = process.env) {
  return new DataSource(getDataSourceOptions(env));
}

/** CLI entry (`migration:generate`). Built after env is loaded via `--env-file`. */
export const AppDataSource = createAppDataSource();
