import React from 'react';
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/src/hooks/use-theme';
import type { ColorTokens } from '@/src/theme/colors';
import type { TypographyVariant } from '@/src/theme/typography';

type Tone = keyof Pick<
  ColorTokens,
  'textPrimary' | 'textSecondary' | 'textOnPrimary' | 'primary' | 'success' | 'warning' | 'danger'
>;

export type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  tone?: Tone;
  weight?: TextStyle['fontWeight'];
};

/**
 * Typography primitive. Maps `variant` to a typography preset and
 * `tone` to a semantic color token — never accept raw hex from callers
 * so the design system stays the single source of truth.
 */
export function Text({
  variant = 'body',
  tone = 'textPrimary',
  weight,
  style,
  children,
  ...rest
}: TextProps) {
  const theme = useTheme();
  return (
    <RNText
      {...rest}
      style={[
        theme.typography[variant],
        { color: theme.colors[tone] },
        weight ? { fontWeight: weight } : null,
        style,
      ]}
    >
      {children}
    </RNText>
  );
}
