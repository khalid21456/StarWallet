import type { Transaction } from '@/src/classes';
import { FALLBACK_VISUAL, getCategoryVisual, INCOME_VISUAL, type Category } from '@/src/constants/categories';

/**
 * Display label for a transaction row. Income has no category (categorieId is
 * null), so it always reads "Income"; expenses look up the category name.
 */
export function getTransactionLabel(
  t: Transaction,
  categoryNames: Map<number, string>,
): string {
  if (t.categorieId === null) return 'Income';
  return categoryNames.get(t.categorieId) ?? 'Uncategorized';
}

/** Pastel tone + icon for a transaction row, mirroring `getTransactionLabel`. */
export function getTransactionVisual(
  t: Transaction,
  categoryNames: Map<number, string>,
): Pick<Category, 'tone' | 'icon'> {
  if (t.categorieId === null) return INCOME_VISUAL;
  const name = categoryNames.get(t.categorieId);
  return name ? getCategoryVisual(name) : FALLBACK_VISUAL;
}
