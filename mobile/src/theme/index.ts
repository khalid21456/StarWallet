/**
 * Theme aggregator.
 *
 * Consumers should import `useTheme()` from `@/src/hooks/use-theme`,
 * NOT the bare palettes — that hook reacts to color-scheme changes.
 */

import { darkColors, lightColors, type ColorTokens } from './colors';
import { radius } from './radius';
import { shadows } from './shadows';
import { spacing } from './spacing';
import { typography } from './typography';

export type Theme = {
  mode: 'light' | 'dark';
  colors: ColorTokens;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof shadows;
  typography: typeof typography;
};

export const lightTheme: Theme = {
  mode: 'light',
  colors: lightColors,
  spacing,
  radius,
  shadows,
  typography,
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: darkColors,
  spacing,
  radius,
  shadows,
  typography,
};

export { darkColors, lightColors, radius, shadows, spacing, typography };
export type { ColorTokens } from './colors';
