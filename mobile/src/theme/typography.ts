import type { TextStyle } from 'react-native';

/**
 * Custom display font (Playwrite NZ Basic — SIL Open Font License, loaded via
 * `expo-font` in `app/_layout.tsx`) used for every text style in the app.
 * It's a variable font rendered at its default weight, so styles below don't
 * vary `fontWeight` — hierarchy comes from size/letter-spacing instead.
 */
export const FONT_FAMILY = 'PlaywriteNZBasic';

const base: TextStyle = {
  fontFamily: FONT_FAMILY,
  fontWeight: 'normal',
  includeFontPadding: false,
};

export const typography = {
  display: {
    ...base,
    fontSize: 25,
    lineHeight: 40,
    letterSpacing: 0,
  },
  heading: {
    ...base,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: 0,
  },
  subheading: {
    ...base,
    fontSize: 17,
    lineHeight: 25,
    letterSpacing: 0,
  },
  body: {
    ...base,
    fontSize: 15,
    lineHeight: 23,
    letterSpacing: 0,
  },
  caption: {
    ...base,
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: 0,
  },
  label: {
    ...base,
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
