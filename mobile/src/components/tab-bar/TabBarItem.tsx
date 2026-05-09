import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/src/hooks/use-theme';
import { Text } from '@/src/ui/Text';

type TabBarItemProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive?: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  onPress: () => void;
};

/**
 * Single tab cell. Animates a small lift + color shift when focused
 * via Reanimated (already a dependency). Filled icon variant kicks in
 * when active to match iOS-fintech conventions.
 */
export function TabBarItem({ label, icon, iconActive, focused, onPress }: TabBarItemProps) {
  const theme = useTheme();
  const lift = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    lift.value = withTiming(focused ? 1 : 0, { duration: 180 });
  }, [focused, lift]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -2 * lift.value }, { scale: 1 + 0.05 * lift.value }],
  }));

  const tint = focused ? theme.colors.primary : theme.colors.textSecondary;
  const glyph = focused && iconActive ? iconActive : icon;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6 }}
    >
      <Animated.View style={animatedIconStyle}>
        <Ionicons name={glyph} size={24} color={tint} />
      </Animated.View>
      <Text
        variant="label"
        style={{
          marginTop: 4,
          color: tint,
          textTransform: 'none',
          letterSpacing: 0.1,
          fontSize: 11,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
