import * as SQLite from 'expo-sqlite';
import { initDatabase } from './schema';

/**
 * Single shared SQLite connection for the app.
 * `openDatabaseSync` returns the database synchronously (no Promise), so it is
 * not awaited. The schema is created the first time this module is imported.
 */
export const db = SQLite.openDatabaseSync('StarWalletDB.db');

initDatabase(db);
