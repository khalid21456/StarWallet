import type { Ionicons } from '@expo/vector-icons';

/**
 * Default expense categories shown on Home. Pure presentational data —
 * actual category records will be loaded from the API later.
 */
export type CategoryTone = 'peach' | 'lavender' | 'softBlue' | 'mint';

export type Category = {
  id: string;
  label: string;
  tone: CategoryTone;
  icon: keyof typeof Ionicons.glyphMap;
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'coffee', label: 'Coffee', tone: 'peach', icon: 'cafe-outline' },
  { id: 'shopping', label: 'Shopping', tone: 'lavender', icon: 'bag-handle-outline' },
  { id: 'transport', label: 'Transport', tone: 'softBlue', icon: 'car-outline' },
  { id: 'food', label: 'Food', tone: 'mint', icon: 'restaurant-outline' },
  { id: 'makeup', label: 'Makeup', tone: 'lavender', icon: 'color-palette-outline' },
  { id: 'investing', label: 'Investing', tone: 'mint', icon: 'trending-up-outline' },
  { id: 'other', label: 'Other', tone: 'softBlue', icon: 'ellipsis-horizontal-circle-outline' },
];

/** Presentation (tone + icon) for any category that has no default match. */
export const FALLBACK_VISUAL: Pick<Category, 'tone' | 'icon'> = {
  tone: 'softBlue',
  icon: 'pricetag-outline',
};

/** Presentation for income transactions, which have no category at all. */
export const INCOME_VISUAL: Pick<Category, 'tone' | 'icon'> = {
  tone: 'mint',
  icon: 'cash-outline',
};

const VISUAL_BY_LABEL = new Map<string, Pick<Category, 'tone' | 'icon'>>(
  DEFAULT_CATEGORIES.map((c) => [c.label.toLowerCase(), { tone: c.tone, icon: c.icon }]),
);

/**
 * Resolves the pastel tone + Ionicon for a stored category name. DB categories
 * only persist a `name`, so their visual identity is looked up here (by name,
 * case-insensitive) and falls back to a neutral tag icon when unknown.
 */
export function getCategoryVisual(name: string): Pick<Category, 'tone' | 'icon'> {
  return VISUAL_BY_LABEL.get(name.toLowerCase()) ?? FALLBACK_VISUAL;
}
