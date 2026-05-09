import { ThemeProvider, type Theme as NavTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { darkTheme, lightTheme } from '@/src/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

/**
 * Bridges our design-system theme into React Navigation so the
 * navigator's default surface colors match our pastel background
 * (no white flashes on push/pop).
 */
function toNavTheme(scheme: 'light' | 'dark'): NavTheme {
  const t = scheme === 'dark' ? darkTheme : lightTheme;
  return {
    dark: scheme === 'dark',
    colors: {
      primary: t.colors.primary,
      background: t.colors.background,
      card: t.colors.card,
      text: t.colors.textPrimary,
      border: t.colors.border,
      notification: t.colors.danger,
    },
    fonts: {
      regular: { fontFamily: 'System', fontWeight: '400' },
      medium: { fontFamily: 'System', fontWeight: '500' },
      bold: { fontFamily: 'System', fontWeight: '700' },
      heavy: { fontFamily: 'System', fontWeight: '800' },
    },
  };
}

export default function RootLayout() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';

  return (
    <SafeAreaProvider>
      <ThemeProvider value={toNavTheme(scheme)}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
