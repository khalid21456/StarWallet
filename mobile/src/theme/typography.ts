import { Platform, type TextStyle } from 'react-native';

/**
 * Font family — SF Pro on iOS, Roboto on Android, Inter web fallback.
 * Loading custom fonts (e.g. real Inter via expo-font) can be wired
 * later without changing consumer code; just swap the values here.
 */
export const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'Inter, system-ui, sans-serif',
}) as string;

const base: TextStyle = {
  fontFamily,
  includeFontPadding: false,
};

export const typography = {
  display: {
    ...base,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  heading: {
    ...base,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subheading: {
    ...base,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  body: {
    ...base,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  caption: {
    ...base,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  label: {
    ...base,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
