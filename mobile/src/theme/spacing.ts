/**
 * 4-pt spacing scale. Use semantic keys (`spacing.lg`) instead of raw
 * numbers in component styles so we can rescale globally if needed.
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

export type SpacingKey = keyof typeof spacing;
