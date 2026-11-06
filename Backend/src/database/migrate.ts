import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const envFile = resolve(process.cwd(), '.env');
if (existsSync(envFile)) {
  // Does not override variables already set (Render injects DATABASE_URL).
  process.loadEnvFile(envFile);
}

const { createAppDataSource } = await import('./data-source.js');

const dataSource = createAppDataSource();
const revert = process.argv[2] === 'revert';

try {
  await dataSource.initialize();
  if (revert) {
    await dataSource.undoLastMigration();
    console.log('Reverted last migration');
  } else {
    const applied = await dataSource.runMigrations();
    console.log(
      applied.length === 0
        ? 'No pending migrations'
        : `Applied ${applied.length} migration(s)`,
    );
  }
  await dataSource.destroy();
} catch (error) {
  console.error(error);
  process.exit(1);
}
