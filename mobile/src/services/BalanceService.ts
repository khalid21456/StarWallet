import { db } from '../db/db';
import { Balance } from '../classes/Balance';

/** The balance lives in a single row with this fixed id (seeded on init). */
const BALANCE_ID = 1;

type BalanceRow = {
  id: number;
  balance: number;
};

/**
 * Reads the running balance. The row is seeded at id = 1 during
 * `initDatabase`, but we defensively re-seed if it is somehow missing.
 */
export function getBalance(): Balance {
  let row = db.getFirstSync<BalanceRow>(
    'SELECT id, balance FROM balance WHERE id = ?;',
    BALANCE_ID,
  );
  if (!row) {
    db.runSync('INSERT OR IGNORE INTO balance (id, balance) VALUES (?, 0);', BALANCE_ID);
    row = { id: BALANCE_ID, balance: 0 };
  }
  return new Balance(row.id, row.balance);
}

/**
 * Adjusts the stored balance by `delta` (positive for income, negative for
 * expense). Called by the transaction service on every write.
 */
export function applyDelta(delta: number): void {
  db.runSync(
    'UPDATE balance SET balance = balance + ? WHERE id = ?;',
    delta,
    BALANCE_ID,
  );
}

/** Overwrites the stored balance with an absolute value. */
export function setBalance(value: number): void {
  db.runSync(
    'UPDATE balance SET balance = ? WHERE id = ?;',
    value,
    BALANCE_ID,
  );
}

/**
 * Repair path: recomputes the balance from scratch as
 * SUM(income) - SUM(expense) over all transactions and stores it.
 * Use after bulk imports or cascade deletes to guarantee consistency.
 */
export function recalculateBalance(): Balance {
  const row = db.getFirstSync<{ total: number }>(
    `SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) AS total
     FROM transactions;`,
  );
  const total = row?.total ?? 0;
  setBalance(total);
  return new Balance(BALANCE_ID, total);
}
