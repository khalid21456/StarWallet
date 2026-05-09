import { Tabs } from 'expo-router';
import React from 'react';

import { FloatingTabBar } from '@/src/components/tab-bar/FloatingTabBar';

/**
 * Tab navigator. The default tab bar is replaced with our custom
 * `FloatingTabBar`; the route order below dictates the navigation
 * `state.index` ordering — the bar itself is responsible for visually
 * lifting the `add` route into a center FAB.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="stats" options={{ title: 'Stats' }} />
      <Tabs.Screen name="add" options={{ title: 'Add' }} />
      <Tabs.Screen name="activity" options={{ title: 'Activity' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
