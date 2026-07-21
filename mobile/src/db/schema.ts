import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * SQLite schema for StarWallet.
 *
 * Notes on the mapping from the ER diagram to SQLite:
 * - SQLite has no `DATE` or `ENUM` types. Dates are stored as ISO-8601 TEXT
 *   and the transaction `type` is enforced with a CHECK constraint.
 * - The transaction table is named `transactions` (plural) because
 *   `transaction` is a reserved SQL keyword.
 * - Column names keep the diagram's snake_case; TS classes map to camelCase.
 * - `regle_id` is a nullable FK to `budgets.id` — the "regle" (rule/budget)
 *   a transaction in a category must respect.
 * - `categorie_id` on `transactions` is nullable: income transactions (salary)
 *   have no category relationship, only expenses do.
 */
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS categories (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS budgets (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  categorie_id INTEGER NOT NULL,
  amount_limit REAL    NOT NULL,
  start_date   TEXT    NOT NULL,
  end_date     TEXT    NOT NULL,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (categorie_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  amount       REAL    NOT NULL,
  type         TEXT    NOT NULL CHECK (type IN ('expense', 'income')),
  categorie_id INTEGER,
  regle_id     INTEGER,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (categorie_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY (regle_id)     REFERENCES budgets(id)    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS balance (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  balance REAL NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO balance (id, balance) VALUES (1, 0);
`;

/**
 * Migrates installs created before `categorie_id` became nullable. SQLite
 * cannot ALTER a column's NOT NULL constraint in place, so this rebuilds the
 * table (rename -> create -> copy -> drop) only when the old constraint is
 * detected. No-ops for fresh installs and installs already migrated.
 */
function migrateTransactionsCategorieNullable(db: SQLiteDatabase): void {
  const columns = db.getAllSync<{ name: string; notnull: number }>(
    'PRAGMA table_info(transactions);',
  );
  const categorieCol = columns.find((c) => c.name === 'categorie_id');
  if (!categorieCol || categorieCol.notnull === 0) return;

  db.execSync(`
    ALTER TABLE transactions RENAME TO transactions_old;

    CREATE TABLE transactions (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      amount       REAL    NOT NULL,
      type         TEXT    NOT NULL CHECK (type IN ('expense', 'income')),
      categorie_id INTEGER,
      regle_id     INTEGER,
      created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (categorie_id) REFERENCES categories(id) ON DELETE CASCADE,
      FOREIGN KEY (regle_id)     REFERENCES budgets(id)    ON DELETE SET NULL
    );

    INSERT INTO transactions (id, amount, type, categorie_id, regle_id, created_at)
      SELECT id, amount, type, categorie_id, regle_id, created_at FROM transactions_old;

    DROP TABLE transactions_old;
  `);
}

/**
 * Creates the schema (idempotent), seeds the single balance row, and runs
 * one-off migrations. Takes the database as a parameter so this module does
 * not import `db.ts`, which keeps the module graph acyclic.
 */
export function initDatabase(db: SQLiteDatabase): void {
  db.execSync('PRAGMA journal_mode = WAL;');
  db.execSync('PRAGMA foreign_keys = ON;');
  db.execSync(SCHEMA_SQL);
  migrateTransactionsCategorieNullable(db);
}

/**
 * Truncates every table — deletes all categories, budgets, transactions and
 * the balance row (schema/tables stay in place), and resets each table's
 * AUTOINCREMENT counter so ids restart at 1. Destructive; intended for a
 * one-time dev reset, not something called on every app start.
 */
export function truncateDatabase(db: SQLiteDatabase): void {
  db.execSync(`
    DELETE FROM transactions;
    DELETE FROM budgets;
    DELETE FROM categories;
    DELETE FROM balance;
  `);
  try {
    db.execSync(
      `DELETE FROM sqlite_sequence WHERE name IN ('transactions', 'budgets', 'categories', 'balance');`,
    );
  } catch {
    // sqlite_sequence only exists once an AUTOINCREMENT table has inserted a
    // row; on a table that never got one, the DELETE has nothing to do anyway.
  }
  db.execSync(`INSERT INTO balance (id, balance) VALUES (1, 0);`);
}
