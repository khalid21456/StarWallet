import React from 'react';
import { ActivityIndicator, Pressable, type PressableProps, View } from 'react-native';

import { useTheme } from '@/src/hooks/use-theme';

import { Text } from './Text';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'md' | 'lg';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
};

/**
 * Pressable button with three visual variants. Uses RN `Pressable`'s
 * built-in `pressed` state to dim the background — keeps the
 * dependency-free promise (no haptics/reanimated needed for press).
 */
export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  ...rest
}: ButtonProps) {
  const theme = useTheme();

  const height = size === 'lg' ? 56 : 48;
  const horizontal = size === 'lg' ? theme.spacing.xl : theme.spacing.lg;

  return (
    <Pressable
      {...rest}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          height,
          paddingHorizontal: horizontal,
          borderRadius: theme.radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          backgroundColor:
            variant === 'primary'
              ? theme.colors.primary
              : variant === 'secondary'
                ? theme.colors.primarySoft
                : 'transparent',
        },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        {loading ? (
          <ActivityIndicator
            color={variant === 'primary' ? theme.colors.textOnPrimary : theme.colors.primary}
          />
        ) : (
          <Text
            variant="body"
            weight="600"
            tone={
              variant === 'primary'
                ? 'textOnPrimary'
                : variant === 'secondary'
                  ? 'textPrimary'
                  : 'primary'
            }
          >
            {label}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
