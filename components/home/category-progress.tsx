import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { Debt, DebtCategory, DEBT_CATEGORY_CONFIG } from '@/lib/types/debt';
import { useCurrency } from '@/context/currency-provider';

interface CategoryProgressProps {
  debts: Debt[];
  isLoading?: boolean;
}

interface CategoryData {
  category: DebtCategory;
  currentBalance: number;
  originalBalance: number;
  progress: number;
  color: string;
  label: string;
}

function CircularProgress({
  progress,
  color,
  size = 56,
  strokeWidth = 5,
}: {
  progress: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Svg width={size} height={size}>
      {/* Background circle with category color tint */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={`${color}30`}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress circle */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
}

export function CategoryProgress({ debts, isLoading }: CategoryProgressProps) {
  const { formatCurrency } = useCurrency();

  // Group debts by category and calculate progress
  const categoryData: CategoryData[] = Object.entries(
    debts.reduce(
      (acc, debt) => {
        if (!acc[debt.category]) {
          acc[debt.category] = { currentBalance: 0, originalBalance: 0 };
        }
        acc[debt.category].currentBalance += debt.current_balance;
        acc[debt.category].originalBalance += debt.original_balance;
        return acc;
      },
      {} as Record<DebtCategory, { currentBalance: number; originalBalance: number }>
    )
  )
    .map(([category, data]) => {
      const config = DEBT_CATEGORY_CONFIG[category as DebtCategory];
      const progress =
        data.originalBalance > 0
          ? Math.round(((data.originalBalance - data.currentBalance) / data.originalBalance) * 100)
          : 0;
      return {
        category: category as DebtCategory,
        currentBalance: data.currentBalance,
        originalBalance: data.originalBalance,
        progress,
        color: config.color,
        label: config.label,
      };
    })
    .sort((a, b) => b.originalBalance - a.originalBalance);

  if (categoryData.length === 0) {
    return null;
  }

  return (
    <View className="flex-row flex-wrap mx-3">
      {categoryData.map((item) => (
        <View key={item.category} className="w-1/2 p-1">
          <View className="rounded-2xl overflow-hidden">
            <LinearGradient
              colors={['#1a1a1f', '#141418']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View className="absolute inset-0 rounded-2xl border border-white/[0.08]" />

            <View className="p-4 items-center">
              <View className="relative items-center justify-center">
                <CircularProgress progress={item.progress} color={item.color} />
                <View className="absolute items-center justify-center">
                  <Text className="text-white text-xs font-bold">{item.progress}%</Text>
                </View>
              </View>
              <Text
                className="text-xs mt-2 text-center font-medium"
                style={{ color: item.color }}
                numberOfLines={1}
              >
                {item.label}
              </Text>
              <Text className="text-white text-xs font-medium">
                {isLoading ? '...' : formatCurrency(item.currentBalance)}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
