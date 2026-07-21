/**
 * Formatting helpers. Manual implementations (no `Intl`) so they behave
 * identically on the Hermes engine across platforms.
 */

/** `1234.5` -> `1,234.50 MAD`. Negative values get a leading `-`. */
export function formatCurrency(value: number): string {
  const fixed = Math.abs(value).toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  const withSeparators = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const sign = value < 0 ? '-' : '';
  return `${sign}${withSeparators}.${decPart} MAD`;
}

/** Signed amount for a transaction row: `+1,234.50 MAD` (income) / `-10.00 MAD` (expense). */
export function formatSignedAmount(amount: number, type: 'income' | 'expense'): string {
  const sign = type === 'income' ? '+' : '-';
  return `${sign}${formatCurrency(Math.abs(amount))}`;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** ISO string -> `Jul 18`. Returns `''` for an unparseable date. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** Full month label for the current date, e.g. `July budget`. */
const FULL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function monthLabel(date: Date): string {
  return FULL_MONTHS[date.getMonth()] ?? '';
}

/**
 * Ratio (0..1) -> a percentage string typed for React Native's `DimensionValue`
 * (`width`/`height` reject a plain `string`, only the `${number}%` template).
 */
export function percentWidth(ratio: number): `${number}%` {
  return `${ratio * 100}%` as `${number}%`;
}
