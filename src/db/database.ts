import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';

let _db: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!_db) throw new Error('Database not initialized. Call initializeDatabase() first.');
  return _db;
}

export async function initializeDatabase(): Promise<void> {
  _db = await SQLite.openDatabaseAsync('bikelog.db');
  await _db.execAsync('PRAGMA journal_mode = WAL;');
  await _db.execAsync('PRAGMA foreign_keys = ON;');
  await runMigrations(_db);
}
