import React from 'react';
import { View, type ViewProps } from 'react-native';

import { useTheme } from '@/src/hooks/use-theme';

type CardProps = ViewProps & {
  variant?: 'soft' | 'flat' | 'floating';
  padding?: 'none' | 'sm' | 'md' | 'lg';
};

/**
 * Rounded warm-white card. `soft` is the default (subtle shadow),
 * `flat` removes the shadow for nested cards, `floating` is reserved
 * for hero cards (e.g. balance summary) that need more lift.
 */
export function Card({
  variant = 'soft',
  padding = 'md',
  style,
  children,
  ...rest
}: CardProps) {
  const theme = useTheme();
  const paddingValue =
    padding === 'none'
      ? 0
      : padding === 'sm'
        ? theme.spacing.md
        : padding === 'lg'
          ? theme.spacing.xl
          : theme.spacing.lg;

  const shadow =
    variant === 'flat'
      ? null
      : variant === 'floating'
        ? theme.shadows.floating
        : theme.shadows.soft;

  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: theme.colors.card,
          borderRadius: theme.radius.xl,
          padding: paddingValue,
        },
        shadow,
        style,
      ]}
    >
      {children}
    </View>
  );
}
