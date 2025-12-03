// Theme color palettes for light and dark modes

export const lightColors = {
  // Backgrounds - slate tones
  // background: '#F8FAFC', // slate-50
  background: '#F8FAFC', // slate-50
  backgroundSecondary: '#F1F5F9', // slate-100
  card: '#F1F5F9', // slate-100
  cardGradientStart: 'rgba(241, 245, 249, 0.95)', // slate-100
  cardGradientEnd: 'rgba(226, 232, 240, 0.98)', // slate-200

  // Text - slate
  text: '#0F172A', // slate-900
  textSecondary: '#64748B', // slate-500
  textMuted: '#94A3B8', // slate-400

  // Borders - slate
  border: 'rgba(100, 116, 139, 0.2)', // slate-500 with opacity
  borderLight: 'rgba(100, 116, 139, 0.1)', // slate-500 with lower opacity

  // Interactive
  tint: '#10B981', // emerald

  // Header - slate
  headerGradientStart: 'rgba(248, 250, 252, 0.95)', // slate-50
  headerGradientEnd: 'rgba(241, 245, 249, 0.9)', // slate-100

  // Icons - slate
  icon: '#475569', // slate-600
  iconMuted: '#64748B', // slate-500

  // Glass card overlays - slate
  glassOverlay: 'rgba(248, 250, 252, 0.5)', // slate-50
  glassBorder: 'rgba(100, 116, 139, 0.15)', // slate-500

  // Tab bar - slate
  tabBar: 'rgba(248, 250, 252, 0.95)', // slate-50
  tabBarBorder: 'rgba(100, 116, 139, 0.15)', // slate-500

  // Shadows
  shadow: '#000000',

  // Input - slate
  inputBackground: 'rgba(100, 116, 139, 0.1)', // slate-500
  inputPlaceholder: '#94A3B8', // slate-400
};

export const darkColors = {
  // Backgrounds
  background: '#0F0F0F',
  backgroundSecondary: '#1A1A1A',
  card: '#1F1F1F',
  cardGradientStart: 'rgba(30, 30, 35, 0.95)',
  cardGradientEnd: 'rgba(20, 20, 25, 0.98)',

  // Text
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',

  // Borders
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(255, 255, 255, 0.05)',

  // Interactive
  tint: '#10B981', // emerald

  // Header
  headerGradientStart: 'rgba(31, 41, 55, 0.9)',
  headerGradientEnd: 'rgba(17, 24, 39, 0.85)',

  // Icons
  icon: '#9CA3AF',
  iconMuted: '#6B7280',

  // Glass card overlays
  glassOverlay: 'rgba(255, 255, 255, 0.08)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',

  // Tab bar
  tabBar: 'rgba(20, 20, 20, 0.95)',
  tabBarBorder: 'rgba(255, 255, 255, 0.1)',

  // Shadows
  shadow: '#000000',

  // Input
  inputBackground: 'rgba(255, 255, 255, 0.05)',
  inputPlaceholder: '#6B7280',
};

export type ThemeColors = typeof lightColors;

export function getThemeColors(isDark: boolean): ThemeColors {
  return isDark ? darkColors : lightColors;
}
