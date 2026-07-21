import { db } from '../db/db';
import { Categorie } from '../classes/Categorie';

type CategorieRow = {
  id: number;
  name: string;
};

function mapRow(row: CategorieRow): Categorie {
  return new Categorie(row.id, row.name);
}

/** Inserts a category and returns it with its generated id. */
export function createCategorie(name: string): Categorie {
  const result = db.runSync('INSERT INTO categories (name) VALUES (?);', name);
  return new Categorie(result.lastInsertRowId, name);
}

export function getCategorieById(id: number): Categorie | null {
  const row = db.getFirstSync<CategorieRow>(
    'SELECT id, name FROM categories WHERE id = ?;',
    id,
  );
  return row ? mapRow(row) : null;
}

export function getAllCategories(): Categorie[] {
  const rows = db.getAllSync<CategorieRow>(
    'SELECT id, name FROM categories ORDER BY name ASC;',
  );
  return rows.map(mapRow);
}

export function updateCategorie(id: number, name: string): void {
  db.runSync('UPDATE categories SET name = ? WHERE id = ?;', name, id);
}

/**
 * Deletes a category. Its budgets and transactions cascade-delete
 * (ON DELETE CASCADE), so call `BalanceService.recalculateBalance()` afterwards
 * if any transactions were removed.
 */
export function deleteCategorie(id: number): void {
  db.runSync('DELETE FROM categories WHERE id = ?;', id);
}
