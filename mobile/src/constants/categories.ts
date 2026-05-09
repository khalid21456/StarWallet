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
];
