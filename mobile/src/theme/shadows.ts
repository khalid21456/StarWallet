import { Platform, type ViewStyle } from 'react-native';

/**
 * Shadow presets. iOS uses native shadow props, Android falls back to
 * `elevation`. Color is fixed (cool navy tint) — pair with a light
 * surface for the soft fintech look.
 */

const make = (
  offsetY: number,
  opacity: number,
  blurRadius: number,
  elevation: number,
): ViewStyle =>
  Platform.select({
    ios: {
      shadowColor: '#0F2348',
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: blurRadius,
    },
    android: {
      elevation,
      shadowColor: '#0F2348',
    },
    default: {
      shadowColor: '#0F2348',
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: blurRadius,
    },
  }) as ViewStyle;

export const shadows = {
  soft: make(2, 0.06, 12, 2),
  medium: make(4, 0.1, 18, 6),
  floating: make(8, 0.12, 24, 12),
} as const;

export type ShadowKey = keyof typeof shadows;
