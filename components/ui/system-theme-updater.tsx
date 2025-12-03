import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/context/theme-provider';

/**
 * Component that updates system UI elements (status bar, keyboard appearance)
 * based on the current theme. Must be placed inside ThemeProvider.
 *
 * This affects:
 * - Status bar text/icons color (light/dark)
 * - iOS keyboard appearance (light/dark) - controlled via keyboardAppearance prop on TextInput
 * - iOS alerts use system appearance by default
 */
export function SystemThemeUpdater() {
  const { isDark } = useTheme();

  // StatusBar style: 'light' = white text (for dark backgrounds), 'dark' = black text (for light backgrounds)
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}
