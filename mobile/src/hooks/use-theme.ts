import { useColorScheme } from 'react-native';

import { darkTheme, lightTheme, type Theme } from '@/src/theme';

/**
 * Returns the active theme based on the device color scheme.
 * Re-renders automatically when the user toggles dark mode.
 */
export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
}
