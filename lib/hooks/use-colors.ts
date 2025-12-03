import { useMemo } from 'react';
import { useTheme } from '@/context/theme-provider';
import { getThemeColors, type ThemeColors } from '@/lib/config/colors';

export function useColors(): ThemeColors {
  const { isDark } = useTheme();
  return useMemo(() => getThemeColors(isDark), [isDark]);
}
