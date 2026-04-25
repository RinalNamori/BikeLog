import type { SQLiteDatabase } from 'expo-sqlite';
import {
  CREATE_SCHEMA_VERSION,
  CREATE_MOTORCYCLES,
  CREATE_MAINTENANCE_LOGS,
  CREATE_LOG_PARTS,
  CREATE_PARTS,
  CREATE_TAX_RECORDS,
  CREATE_INDEXES,
} from './schema';

interface Migration {
  version: number;
  statements: string[];
}

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    statements: [
      CREATE_MOTORCYCLES,
      CREATE_MAINTENANCE_LOGS,
      CREATE_LOG_PARTS,
      CREATE_PARTS,
      CREATE_TAX_RECORDS,
      ...CREATE_INDEXES,
    ],
  },
];

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(CREATE_SCHEMA_VERSION);

  const row = await db.getFirstAsync<{ version: number }>(
    'SELECT COALESCE(MAX(version), 0) as version FROM schema_version'
  );
  let currentVersion = row?.version ?? 0;

  for (const migration of MIGRATIONS) {
    if (migration.version <= currentVersion) continue;

    await db.withTransactionAsync(async () => {
      for (const stmt of migration.statements) {
        await db.execAsync(stmt);
      }
      await db.runAsync(
        'INSERT INTO schema_version (version) VALUES (?)',
        migration.version
      );
    });

    currentVersion = migration.version;
  }
}
