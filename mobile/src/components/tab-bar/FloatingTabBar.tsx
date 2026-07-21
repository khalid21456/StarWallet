import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/src/hooks/use-theme';

import { CenterFAB } from './CenterFAB';
import { TabBarItem } from './TabBarItem';

/**
 * Custom bottom tab bar with a centered FAB.
 *
 * The route named `add` is special: it is rendered as the FAB instead
 * of a normal tab item, and it gets injected at index 2 regardless of
 * its position in the routes array (so screen-order in `_layout.tsx`
 * stays declarative).
 */

type IconPair = {
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  label: string;
};

const ROUTE_META: Record<string, IconPair> = {
  index: { icon: 'home-outline', iconActive: 'home', label: 'Home' },
  stats: { icon: 'stats-chart-outline', iconActive: 'stats-chart', label: 'Stats' },
  activity: { icon: 'time-outline', iconActive: 'time', label: 'Activity' },
  budget: { icon: 'wallet-outline', iconActive: 'wallet', label: 'Budget' },
};

export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const addRoute = state.routes.find((r) => r.name === 'add');
  const sideRoutes = state.routes.filter((r) => r.name !== 'add');

  // Split side routes into left (Home, Stats) and right (Activity, Budget).
  // The FAB sits between them.
  const left = sideRoutes.filter((r) => ['index', 'stats'].includes(r.name));
  const right = sideRoutes.filter((r) => ['activity', 'budget'].includes(r.name));

  const renderItem = (routeName: string, key: string) => {
    const meta = ROUTE_META[routeName];
    if (!meta) return null;
    const routeIndex = state.routes.findIndex((r) => r.name === routeName);
    const focused = state.index === routeIndex;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: state.routes[routeIndex].key,
        canPreventDefault: true,
      });
      if (!focused && !event.defaultPrevented) {
        navigation.navigate(routeName);
      }
    };

    return (
      <TabBarItem
        key={key}
        label={meta.label}
        icon={meta.icon}
        iconActive={meta.iconActive}
        focused={focused}
        onPress={onPress}
      />
    );
  };

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: theme.spacing.lg,
        right: theme.spacing.lg,
        bottom: Math.max(insets.bottom, theme.spacing.lg),
      }}
    >
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.card,
            borderRadius: 28,
            paddingHorizontal: theme.spacing.sm,
            height: 64,
          },
          theme.shadows.floating,
        ]}
      >
        {left.map((r) => renderItem(r.name, r.key))}

        {addRoute ? (
          <CenterFAB
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: addRoute.key,
                canPreventDefault: true,
              });
              if (!event.defaultPrevented) {
                navigation.navigate(addRoute.name);
              }
            }}
          />
        ) : null}

        {right.map((r) => renderItem(r.name, r.key))}
      </View>
    </View>
  );
}
