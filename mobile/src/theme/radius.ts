/**
 * Border radius scale. `pill` is intentionally huge so it always
 * produces a fully-rounded edge regardless of the consumer's size.
 */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  pill: 999,
} as const;

export type RadiusKey = keyof typeof radius;
