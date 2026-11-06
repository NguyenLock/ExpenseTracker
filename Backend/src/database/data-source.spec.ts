import { getDataSourceOptions } from './data-source.js';

describe('getDataSourceOptions', () => {
  it('uses DATABASE_URL with SSL and does not open a local socket', () => {
    const options = getDataSourceOptions({
      DATABASE_URL:
        'postgresql://user:password@ep-example.neon.tech/db?sslmode=require',
      DB_HOST: 'localhost',
    });

    expect(options).toMatchObject({
      type: 'postgres',
      url: 'postgresql://user:password@ep-example.neon.tech/db?sslmode=require',
      ssl: { rejectUnauthorized: false },
      synchronize: false,
      migrationsRun: false,
    });
    expect(options).not.toHaveProperty('host');
  });

  it('uses DB_* without SSL when DATABASE_URL is empty', () => {
    const options = getDataSourceOptions({
      DATABASE_URL: '  ',
      DB_HOST: 'localhost',
      DB_PORT: '5435',
      DB_USER: 'expense',
      DB_PASSWORD: 'expense',
      DB_NAME: 'expense_tracker',
    });

    expect(options).toMatchObject({
      type: 'postgres',
      host: 'localhost',
      port: 5435,
      username: 'expense',
      password: 'expense',
      database: 'expense_tracker',
      synchronize: false,
    });
    expect(options).not.toHaveProperty('ssl');
    expect(options).not.toHaveProperty('url');
  });
});
