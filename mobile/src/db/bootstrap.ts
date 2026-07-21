import { DEFAULT_CATEGORIES } from '../constants/categories';
import { createCategorie, getAllCategories } from '../services/CategorieService';
import { createBudget, getBudgetsByCategorie } from '../services/BudgetService';

/** First and last instant of the current month as ISO strings. */
function currentMonthRangeISO(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
}

/**
 * Seeds first-run demo data so the UI has something to show and the budget /
 * "regle" features are exercisable before any create-UI exists. Idempotent
 * and additive: re-running only tops up whatever is missing (e.g. a new
 * default category added after a device already seeded the old set).
 */
export function seedDefaultData(): void {
  seedCategories();
  seedBudgets();
}

function seedCategories(): void {
  const existingNames = new Set(getAllCategories().map((c) => c.name.toLowerCase()));
  DEFAULT_CATEGORIES.filter((c) => !existingNames.has(c.label.toLowerCase())).forEach((c) =>
    createCategorie(c.label),
  );
}

function seedBudgets(): void {
  const { start, end } = currentMonthRangeISO();
  // One current-month budget per category (default limit) so new transactions
  // auto-resolve their `regle_id` and the Home budget card is meaningful.
  getAllCategories()
    .filter((c) => getBudgetsByCategorie(c.id).length === 0)
    .forEach((c) => createBudget(c.id, 300, start, end));
}
