import { db } from '../db/db';
import { Transaction, type TransactionType } from '../classes/Transaction';
import { getActiveBudgetForCategorie } from './BudgetService';
import { applyDelta } from './BalanceService';

type TransactionRow = {
  id: number;
  amount: number;
  type: string;
  categorie_id: number | null;
  regle_id: number | null;
  created_at: string;
};

const SELECT_COLS =
  'id, amount, type, categorie_id, regle_id, created_at';

function mapRow(row: TransactionRow): Transaction {
  return new Transaction(
    row.id,
    row.amount,
    row.type as TransactionType,
    row.categorie_id,
    row.regle_id,
    row.created_at,
  );
}

/** Signed balance impact: income adds, expense subtracts. */
function signed(amount: number, type: TransactionType): number {
  return type === 'income' ? amount : -amount;
}

/**
 * Creates a transaction and updates the running balance in one atomic step.
 * `categorieId` is null for income (salary has no category); expenses require
 * one. If `regleId` is omitted, it is auto-resolved to the active budget
 * ("regle") for the category at creation time — this is how a transaction
 * "respects a regle in Budget". Pass `null` explicitly to force no budget
 * link, or when `categorieId` is null (there is nothing to resolve).
 */
export function createTransaction(
  amount: number,
  type: TransactionType,
  categorieId: number | null,
  regleId?: number | null,
): Transaction {
  const createdAt = new Date().toISOString();
  const resolvedRegleId =
    regleId === undefined
      ? (categorieId === null
          ? null
          : (getActiveBudgetForCategorie(categorieId, createdAt)?.id ?? null))
      : regleId;

  let newId = 0;
  db.withTransactionSync(() => {
    const result = db.runSync(
      `INSERT INTO transactions (amount, type, categorie_id, regle_id, created_at)
       VALUES (?, ?, ?, ?, ?);`,
      amount,
      type,
      categorieId,
      resolvedRegleId,
      createdAt,
    );
    newId = result.lastInsertRowId;
    applyDelta(signed(amount, type));
  });

  return new Transaction(
    newId,
    amount,
    type,
    categorieId,
    resolvedRegleId,
    createdAt,
  );
}

export function getTransactionById(id: number): Transaction | null {
  const row = db.getFirstSync<TransactionRow>(
    `SELECT ${SELECT_COLS} FROM transactions WHERE id = ?;`,
    id,
  );
  return row ? mapRow(row) : null;
}

export function getAllTransactions(): Transaction[] {
  const rows = db.getAllSync<TransactionRow>(
    `SELECT ${SELECT_COLS} FROM transactions ORDER BY created_at DESC;`,
  );
  return rows.map(mapRow);
}

export function getTransactionsByCategorie(categorieId: number): Transaction[] {
  const rows = db.getAllSync<TransactionRow>(
    `SELECT ${SELECT_COLS} FROM transactions
     WHERE categorie_id = ? ORDER BY created_at DESC;`,
    categorieId,
  );
  return rows.map(mapRow);
}

/** Transactions linked to a budget (regle_id = budgetId). */
export function getTransactionsByBudget(budgetId: number): Transaction[] {
  const rows = db.getAllSync<TransactionRow>(
    `SELECT ${SELECT_COLS} FROM transactions
     WHERE regle_id = ? ORDER BY created_at DESC;`,
    budgetId,
  );
  return rows.map(mapRow);
}

/**
 * Transactions created in the inclusive ISO range [startISO, endISO].
 * Used for "this week" / "this month" groupings and stats.
 */
export function getTransactionsBetween(
  startISO: string,
  endISO: string,
): Transaction[] {
  const rows = db.getAllSync<TransactionRow>(
    `SELECT ${SELECT_COLS} FROM transactions
     WHERE created_at >= ? AND created_at <= ?
     ORDER BY created_at DESC;`,
    startISO,
    endISO,
  );
  return rows.map(mapRow);
}

/**
 * Updates a transaction and re-balances atomically: the old signed amount is
 * reversed and the new one applied. `categorieId` is null for income. If
 * `regleId` is omitted, it is re-resolved from the active budget for the
 * (possibly new) category at the transaction's original creation time; pass
 * `null` to clear the budget link.
 */
export function updateTransaction(
  id: number,
  amount: number,
  type: TransactionType,
  categorieId: number | null,
  regleId?: number | null,
): void {
  const existing = getTransactionById(id);
  if (!existing) return;

  const resolvedRegleId =
    regleId === undefined
      ? (categorieId === null
          ? null
          : (getActiveBudgetForCategorie(categorieId, existing.createdAt)?.id ?? null))
      : regleId;

  db.withTransactionSync(() => {
    db.runSync(
      `UPDATE transactions
       SET amount = ?, type = ?, categorie_id = ?, regle_id = ?
       WHERE id = ?;`,
      amount,
      type,
      categorieId,
      resolvedRegleId,
      id,
    );
    const delta = signed(amount, type) - signed(existing.amount, existing.type);
    applyDelta(delta);
  });
}

/** Deletes a transaction and reverses its balance impact atomically. */
export function deleteTransaction(id: number): void {
  const existing = getTransactionById(id);
  if (!existing) return;

  db.withTransactionSync(() => {
    db.runSync('DELETE FROM transactions WHERE id = ?;', id);
    applyDelta(-signed(existing.amount, existing.type));
  });
}
