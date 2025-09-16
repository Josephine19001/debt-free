import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import {  Beef, Wheat } from 'lucide-react-native';
import { OliveOilIcon } from '@/components/icons/olive-oil-icon';
import { MacroBreakdownSkeleton } from './nutrition-skeleton';
import { useThemedStyles } from '@/lib/utils/theme';
import { useTheme } from '@/context/theme-provider';
import CircularProgress from '@/components/CircularProgress';

interface MacroBreakdownProps {
  macroData: {
    calories: { consumed: number; target: number };
    protein: { consumed: number; target: number };
    carbs: { consumed: number; target: number };
    fat: { consumed: number; target: number };
  };
  isLoading?: boolean;
}

const MacroCard = ({
  title,
  consumed,
  target,
  unit,
  color,
  icon,
}: {
  title: string;
  consumed: number;
  target: number;
  unit: string;
  color: string;
  icon: React.ElementType;
}) => {
  const themed = useThemedStyles();
  const { isDark } = useTheme();
  const remaining = target - consumed;

  return (
    <View className={themed("bg-white rounded-xl p-3 border border-gray-100", "bg-gray-800 rounded-xl p-3 border border-gray-700")}>
      {/* Top - Icon and progress circle */}
      <View className="items-center mb-3">
        <CircularProgress
          consumed={consumed}
          target={target}
          size={48}
          strokeWidth={4}
          color={color}
          isDark={isDark}
          showCenterText={false}
          animated={true}
          showOverflow={true}
        >
          <View
            className="w-7 h-7 rounded-full items-center justify-center"
            style={{ 
              backgroundColor: isDark 
                ? `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.2)` 
                : `${color}20` 
            }}
          >
            {icon === OliveOilIcon ? (
              <OliveOilIcon size={14} color={color} />
            ) : (
              React.createElement(icon, { size: 14, color })
            )}
          </View>
        </CircularProgress>
      </View>

      {/* Bottom - Text content */}
      <View className="items-center">
        <View className="flex-row items-baseline mb-1">
          <Text className={themed("text-xl font-bold text-gray-900", "text-xl font-bold text-white")}>
            {remaining}
          </Text>
          <Text className={themed("text-sm font-medium text-gray-700", "text-sm font-medium text-gray-300")}>
            {unit}
          </Text>
        </View>
        <Text className={themed("text-xs text-gray-600 text-center", "text-xs text-gray-400 text-center")}>
          {title} left
        </Text>
        <Text className={themed("text-xs text-gray-500", "text-xs text-gray-400")}>
          {Math.round((consumed / target) * 100)}%
        </Text>
      </View>
    </View>
  );
};

export default function MacroBreakdown({ macroData, isLoading = false }: MacroBreakdownProps) {
  // Show skeleton only when loading
  if (isLoading) {
    return <MacroBreakdownSkeleton />;
  }

  // Check if we have valid targets
  const hasValidTargets =
    macroData.protein.target > 0 && macroData.carbs.target > 0 && macroData.fat.target > 0;

  // Use default targets when no valid targets are set
  const getDisplayData = (macro: { consumed: number; target: number }, defaultTarget: number) => ({
    consumed: hasValidTargets ? macro.consumed : 0,
    target: hasValidTargets ? macro.target : defaultTarget,
  });

  return (
    <View className="px-4 mb-6">
      {/* Three cards in a row */}
      <View className="flex-row gap-2">
        <View className="flex-1">
          <MacroCard
            title="Protein"
            consumed={getDisplayData(macroData.protein, 150).consumed}
            target={getDisplayData(macroData.protein, 150).target}
            unit="g"
            color="#EF4444"
            icon={Beef}
          />
        </View>

        <View className="flex-1">
          <MacroCard
            title="Carbs"
            consumed={getDisplayData(macroData.carbs, 250).consumed}
            target={getDisplayData(macroData.carbs, 250).target}
            unit="g"
            color="#F59E0B"
            icon={Wheat}
          />
        </View>

        <View className="flex-1">
          <MacroCard
            title="Fat"
            consumed={getDisplayData(macroData.fat, 67).consumed}
            target={getDisplayData(macroData.fat, 67).target}
            unit="g"
            color="#8B5CF6"
            icon={OliveOilIcon}
          />
        </View>
      </View>
    </View>
  );
}
