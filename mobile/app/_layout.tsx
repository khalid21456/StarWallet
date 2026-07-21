import { ThemeProvider, type Theme as NavTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { seedDefaultData } from '@/src/db/bootstrap';
import { db } from '@/src/db/db';
import { truncateDatabase } from '@/src/db/schema';
import { darkTheme, lightTheme } from '@/src/theme';
import { FONT_FAMILY } from '@/src/theme/typography';

// TEMPORARY one-time reset: wipes all existing categories/budgets/transactions
// so the new per-category budget feature starts from a clean slate. Remove
// this line after running the app once — leaving it in would wipe data on
// every launch.
truncateDatabase(db);

seedDefaultData();

// Keep the native splash screen up until the custom font has loaded, so the
// app never flashes system-font text before swapping to Playwrite NZ Basic.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

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
      regular: { fontFamily: FONT_FAMILY, fontWeight: 'normal' },
      medium: { fontFamily: FONT_FAMILY, fontWeight: 'normal' },
      bold: { fontFamily: FONT_FAMILY, fontWeight: 'normal' },
      heavy: { fontFamily: FONT_FAMILY, fontWeight: 'normal' },
    },
  };
}

export default function RootLayout() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const [fontsLoaded] = useFonts({
    [FONT_FAMILY]: require('../fonts/Playwrite_NZ_Basic/PlaywriteNZBasic-VariableFont_wght.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

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
