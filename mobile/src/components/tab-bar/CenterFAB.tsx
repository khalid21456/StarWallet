import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/src/hooks/use-theme';

type CenterFABProps = {
  onPress: () => void;
};

/**
 * Floating "+" button that visually breaks the top edge of the tab
 * bar. Solid primary fill (gradient deferred until expo-linear-gradient
 * is added — see README "Future polish").
 */
export function CenterFAB({ onPress }: CenterFABProps) {
  const theme = useTheme();
  const SIZE = 56;

  return (
    <View
      style={{
        width: SIZE,
        alignItems: 'center',
        // Lift the FAB above the bar so it appears to float.
        marginTop: -SIZE / 2,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add transaction"
        onPress={onPress}
        style={({ pressed }) => [
          {
            width: SIZE,
            height: SIZE,
            borderRadius: theme.radius.pill,
            backgroundColor: theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.96 : 1 }],
            // Halo effect — outer ring matches the card so the FAB
            // visually "punches through" the tab bar's top edge.
            borderWidth: 4,
            borderColor: theme.colors.card,
          },
          theme.shadows.medium,
        ]}
      >
        <Ionicons name="add" size={28} color={theme.colors.textOnPrimary} />
      </Pressable>
    </View>
  );
}
