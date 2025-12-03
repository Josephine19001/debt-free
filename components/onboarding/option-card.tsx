import { ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useColors } from '@/lib/hooks/use-colors';
import { useTheme } from '@/context/theme-provider';

interface OptionCardProps {
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  title: string;
  subtitle: string;
  animationDelay?: number;
  accentColor?: 'emerald' | 'blue';
}

export function OptionCard({
  selected,
  onSelect,
  icon,
  title,
  subtitle,
  animationDelay = 300,
  accentColor = 'emerald',
}: OptionCardProps) {
  const colors = useColors();
  const { isDark } = useTheme();

  const getBorderColor = () => {
    if (selected) {
      return accentColor === 'emerald' ? '#10B981' : '#3B82F6';
    }
    return isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  };

  const getBgColor = () => {
    if (selected) {
      return accentColor === 'emerald' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)';
    }
    return isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  };

  const getIconBgColor = () => {
    if (selected) {
      return accentColor === 'emerald' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)';
    }
    return isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  };

  return (
    <Pressable onPress={onSelect}>
      <View
        className="rounded-2xl p-5"
        style={{
          borderWidth: 2,
          borderColor: getBorderColor(),
          backgroundColor: getBgColor(),
        }}
      >
        <View className="flex-row items-center">
          <View
            className="w-12 h-12 rounded-full items-center justify-center mr-4"
            style={{ backgroundColor: getIconBgColor() }}
          >
            {icon}
          </View>
          <View className="flex-1">
            <Text className="font-bold text-lg" style={{ color: colors.text }}>{title}</Text>
            <Text className="text-sm" style={{ color: colors.textMuted }}>{subtitle}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

interface StrategyCardProps {
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  title: string;
  subtitle: string;
  metricLabel: string;
  metricValue: string;
  badge?: string;
  accentColor?: 'emerald' | 'blue';
}

export function StrategyCard({
  selected,
  onSelect,
  icon,
  title,
  subtitle,
  metricLabel,
  metricValue,
  badge,
  accentColor = 'emerald',
}: StrategyCardProps) {
  const colors = useColors();
  const { isDark } = useTheme();

  const getBorderColor = () => {
    if (selected) {
      return accentColor === 'emerald' ? '#10B981' : '#3B82F6';
    }
    return isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  };

  const getBgColor = () => {
    if (selected) {
      return accentColor === 'emerald' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)';
    }
    return isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  };

  const getIconBgColor = () => {
    if (selected) {
      return accentColor === 'emerald' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)';
    }
    return isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  };

  const metricColor = accentColor === 'emerald' ? '#34D399' : '#60A5FA';

  return (
    <Pressable onPress={onSelect}>
      <View
        className="rounded-2xl p-4"
        style={{
          borderWidth: 2,
          borderColor: getBorderColor(),
          backgroundColor: getBgColor(),
        }}
      >
        <View className="flex-row items-center mb-2">
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: getIconBgColor() }}
          >
            {icon}
          </View>
          <View className="flex-1">
            <Text className="font-bold" style={{ color: colors.text }}>{title}</Text>
            <Text className="text-xs" style={{ color: colors.textMuted }}>{subtitle}</Text>
          </View>
          {badge && selected && (
            <View className="bg-emerald-500 px-2 py-1 rounded">
              <Text className="text-white text-xs font-semibold">{badge}</Text>
            </View>
          )}
        </View>
        <View className="flex-row justify-between">
          <Text className="text-sm" style={{ color: colors.textSecondary }}>{metricLabel}</Text>
          <Text className="font-bold text-sm" style={{ color: metricColor }}>{metricValue}</Text>
        </View>
      </View>
    </Pressable>
  );
}
