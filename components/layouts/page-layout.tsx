import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useColors } from '@/lib/hooks/use-colors';
import { useTheme } from '@/context/theme-provider';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string | React.ReactNode;
  showBackButton?: boolean;
  rightAction?: React.ReactNode;
  headerStyle?: 'default' | 'transparent' | 'glass';
}

export function PageLayout({
  children,
  title,
  showBackButton = false,
  rightAction,
  headerStyle = 'default',
}: PageLayoutProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();

  const renderHeader = () => {
    if (!title && !showBackButton && !rightAction) return null;

    return (
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        {headerStyle === 'glass' && (
          <>
            <LinearGradient
              colors={[colors.headerGradientStart, colors.headerGradientEnd]}
              style={StyleSheet.absoluteFill}
            />
            <View style={[styles.headerGlassBorder, { backgroundColor: colors.border }]} />
          </>
        )}
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            {showBackButton && (
              <Pressable
                onPress={() => router.back()}
                style={styles.backButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ChevronLeft size={28} color={colors.text} strokeWidth={2} />
              </Pressable>
            )}
            {title && !showBackButton && (
              typeof title === 'string'
                ? <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
                : title
            )}
          </View>
          <View style={styles.headerCenter}>
            {title && showBackButton && (
              typeof title === 'string'
                ? <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
                : title
            )}
          </View>
          <View style={styles.headerRight}>{rightAction}</View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      <View style={[styles.content]}>{children}</View>
    </View>
  );
}

interface GlassCardProps {
  children: React.ReactNode;
  style?: object;
  className?: string;
}

export function GlassCard({ children, style }: GlassCardProps) {
  const colors = useColors();
  const { isDark } = useTheme();
  return (
    <View
      style={[
        styles.glassCard,
        {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.06,
          shadowRadius: isDark ? 4 : 6,
          elevation: isDark ? 3 : 2,
          backgroundColor: isDark ? colors.card : '#FFFFFF',
        },
        style,
      ]}
    >
      {isDark && (
        <LinearGradient
          colors={[colors.cardGradientStart, colors.cardGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View
        style={[
          styles.glassCardBorder,
          { borderColor: isDark ? colors.glassBorder : 'rgba(0, 0, 0, 0.08)' },
        ]}
      />
      <View style={styles.glassCardContent}>{children}</View>
    </View>
  );
}

interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  const colors = useColors();
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  headerLeft: {
    minWidth: 44,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    minWidth: 44,
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  headerGlassBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  backButton: {
    padding: 4,
    marginLeft: -4,
  },
  content: {
    flex: 1,
  },
  glassCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 8,
    position: 'relative',
  },
  glassCardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 1,
  },
  glassCardContent: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});

export default PageLayout;
