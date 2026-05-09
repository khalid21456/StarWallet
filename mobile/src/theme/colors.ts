/**
 * Semantic color tokens for StarWallet.
 *
 * Both light and dark palettes export the SAME shape so consumers can
 * look up tokens by key (`theme.colors.primary`) without branching.
 * Adding a new token requires updating both objects.
 */

export type ColorTokens = {
  // Brand
  primary: string;
  primarySoft: string;
  accent: string;

  // Surfaces
  background: string;
  card: string;
  cardElevated: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textOnPrimary: string;

  // Lines / dividers
  border: string;
  shadow: string;

  // Semantic state
  success: string;
  warning: string;
  danger: string;

  // Category pastels
  peach: string;
  lavender: string;
  softBlue: string;
  mint: string;

  // Icon bubble tints (slightly darker than fills for icon contrast)
  peachInk: string;
  lavenderInk: string;
  softBlueInk: string;
  mintInk: string;
};

export const lightColors: ColorTokens = {
  primary: '#5BA8FF',
  primarySoft: '#A9D2FF',
  accent: '#7ED6FF',

  background: '#F2F7FC',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',

  textPrimary: '#0E1B33',
  textSecondary: '#6A7A93',
  textOnPrimary: '#FFFFFF',

  border: '#E5ECF5',
  shadow: 'rgba(15, 35, 72, 0.08)',

  success: '#5BD4A5',
  warning: '#FFC36B',
  danger: '#FF7B8A',

  peach: '#FFD9B8',
  lavender: '#E2C9F5',
  softBlue: '#C7E2FF',
  mint: '#C8EFD8',

  peachInk: '#E07A2B',
  lavenderInk: '#7E5BB0',
  softBlueInk: '#3F7FCB',
  mintInk: '#3FAE7A',
};

export const darkColors: ColorTokens = {
  primary: '#7AB8FF',
  primarySoft: '#3D6FA8',
  accent: '#9DDFFF',

  background: '#0B1220',
  card: '#15203A',
  cardElevated: '#1B2849',

  textPrimary: '#ECF1F9',
  textSecondary: '#8A9BB7',
  textOnPrimary: '#0B1220',

  border: '#22304F',
  shadow: 'rgba(0, 0, 0, 0.40)',

  success: '#5BD4A5',
  warning: '#FFC36B',
  danger: '#FF7B8A',

  peach: '#3A2A1E',
  lavender: '#2E2240',
  softBlue: '#1F2F4D',
  mint: '#1F3A2C',

  peachInk: '#FFB07A',
  lavenderInk: '#C7A4ED',
  softBlueInk: '#9DC4F5',
  mintInk: '#7BD9AC',
};
