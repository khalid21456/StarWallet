import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/src/hooks/use-theme';
import type { CategoryTone } from '@/src/constants/categories';

type IconBubbleProps = {
  tone: CategoryTone;
  icon: keyof typeof Ionicons.glyphMap;
  size?: number;
};

const INK_KEY: Record<CategoryTone, 'peachInk' | 'lavenderInk' | 'softBlueInk' | 'mintInk'> = {
  peach: 'peachInk',
  lavender: 'lavenderInk',
  softBlue: 'softBlueInk',
  mint: 'mintInk',
};

/**
 * Pastel circular container for a category/transaction icon.
 * Background uses the soft tone, glyph uses the matching `Ink` color
 * for AA contrast on either color scheme.
 */
export function IconBubble({ tone, icon, size = 48 }: IconBubbleProps) {
  const theme = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors[tone],
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={icon} size={size * 0.5} color={theme.colors[INK_KEY[tone]]} />
    </View>
  );
}
