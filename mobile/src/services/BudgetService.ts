import { db } from '../db/db';
import { Budget } from '../classes/Budget';

type BudgetRow = {
  id: number;
  categorie_id: number;
  amount_limit: number;
  start_date: string;
  end_date: string;
  created_at: string;
};

function mapRow(row: BudgetRow): Budget {
  return new Budget(
    row.id,
    row.categorie_id,
    row.amount_limit,
    row.start_date,
    row.end_date,
    row.created_at,
  );
}

const SELECT_COLS =
  'id, categorie_id, amount_limit, start_date, end_date, created_at';

/** Inserts a budget and returns it with its generated id and created_at. */
export function createBudget(
  categorieId: number,
  amountLimit: number,
  startDate: string,
  endDate: string,
): Budget {
  const result = db.runSync(
    `INSERT INTO budgets (categorie_id, amount_limit, start_date, end_date)
     VALUES (?, ?, ?, ?);`,
    categorieId,
    amountLimit,
    startDate,
    endDate,
  );
  return getBudgetById(result.lastInsertRowId)!;
}

export function getBudgetById(id: number): Budget | null {
  const row = db.getFirstSync<BudgetRow>(
    `SELECT ${SELECT_COLS} FROM budgets WHERE id = ?;`,
    id,
  );
  return row ? mapRow(row) : null;
}

export function getAllBudgets(): Budget[] {
  const rows = db.getAllSync<BudgetRow>(
    `SELECT ${SELECT_COLS} FROM budgets ORDER BY start_date DESC;`,
  );
  return rows.map(mapRow);
}

export function getBudgetsByCategorie(categorieId: number): Budget[] {
  const rows = db.getAllSync<BudgetRow>(
    `SELECT ${SELECT_COLS} FROM budgets WHERE categorie_id = ? ORDER BY start_date DESC;`,
    categorieId,
  );
  return rows.map(mapRow);
}

/**
 * The budget ("regle") a category transaction must respect at a given time:
 * the one whose date range contains `atISO`. Returns the most recent match
 * if several overlap, or null if none apply.
 */
export function getActiveBudgetForCategorie(
  categorieId: number,
  atISO: string,
): Budget | null {
  const row = db.getFirstSync<BudgetRow>(
    `SELECT ${SELECT_COLS} FROM budgets
     WHERE categorie_id = ? AND start_date <= ? AND end_date >= ?
     ORDER BY start_date DESC
     LIMIT 1;`,
    categorieId,
    atISO,
    atISO,
  );
  return row ? mapRow(row) : null;
}

/** All budgets whose date range contains `atISO` (across every category). */
export function getActiveBudgets(atISO: string): Budget[] {
  const rows = db.getAllSync<BudgetRow>(
    `SELECT ${SELECT_COLS} FROM budgets
     WHERE start_date <= ? AND end_date >= ?
     ORDER BY start_date DESC;`,
    atISO,
    atISO,
  );
  return rows.map(mapRow);
}

/**
 * Total spent against a budget: the sum of its linked EXPENSE transactions
 * (regle_id = budgetId). Drives the Home budget progress card.
 */
export function getBudgetSpending(budgetId: number): number {
  const row = db.getFirstSync<{ total: number }>(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM transactions
     WHERE regle_id = ? AND type = 'expense';`,
    budgetId,
  );
  return row?.total ?? 0;
}

export function updateBudget(
  id: number,
  categorieId: number,
  amountLimit: number,
  startDate: string,
  endDate: string,
): void {
  db.runSync(
    `UPDATE budgets
     SET categorie_id = ?, amount_limit = ?, start_date = ?, end_date = ?
     WHERE id = ?;`,
    categorieId,
    amountLimit,
    startDate,
    endDate,
    id,
  );
}

/**
 * Deletes a budget. Linked transactions keep their rows but have `regle_id`
 * set to NULL (ON DELETE SET NULL), so the balance is unaffected.
 */
export function deleteBudget(id: number): void {
  db.runSync('DELETE FROM budgets WHERE id = ?;', id);
}
