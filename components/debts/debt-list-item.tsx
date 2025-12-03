import { View, Text, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { GlassCard } from '@/components/layouts';
import { Debt, DEBT_CATEGORY_CONFIG } from '@/lib/types/debt';
import {
  formatPercentage,
  calculateDebtProgress,
  calculateTotalInterest,
} from '@/lib/utils/debt-calculator';
import { useCurrency } from '@/context/currency-provider';
import { useColors } from '@/lib/hooks/use-colors';
import { useTheme } from '@/context/theme-provider';

interface DebtListItemProps {
  debt: Debt;
  onPress: () => void;
  showRank?: boolean;
  rank?: number;
}

export function DebtListItem({ debt, onPress, showRank, rank }: DebtListItemProps) {
  const { formatCurrency } = useCurrency();
  const colors = useColors();
  const { isDark } = useTheme();
  const progress = calculateDebtProgress(debt);
  const categoryConfig = DEBT_CATEGORY_CONFIG[debt.category];
  const capitalPaid = debt.original_balance - debt.current_balance;
  const interestRemaining = calculateTotalInterest(
    debt.current_balance,
    debt.interest_rate,
    debt.minimum_payment
  );

  return (
    <Pressable onPress={onPress}>
      <GlassCard>
        <View className="flex-row items-center">
          {/* Rank Badge (for Avalanche priority) */}
          {showRank && rank !== undefined && (
            <View className="w-8 h-8 rounded-full bg-emerald-500/20 items-center justify-center mr-3">
              <Text className="text-emerald-400 font-bold text-sm">#{rank}</Text>
            </View>
          )}

          {/* Main Content */}
          <View className="flex-1">
            {/* Header: Name & Interest Rate */}
            <View className="flex-row items-center justify-between mb-1">
              <Text style={{ color: colors.text }} className="font-semibold text-base flex-1" numberOfLines={1}>
                {debt.name}
              </Text>
              <View className="bg-red-500/20 px-2 py-0.5 rounded-full ml-2">
                <Text className="text-red-400 font-bold text-sm">
                  {formatPercentage(debt.interest_rate)}
                </Text>
              </View>
            </View>

            {/* Category Label */}
            <Text style={{ color: colors.textMuted }} className="text-xs mb-2">
              {categoryConfig.label}
            </Text>

            {/* Balance */}
            <Text style={{ color: colors.text }} className="font-bold text-xl mb-2">
              {formatCurrency(debt.current_balance)}
            </Text>

            {/* Progress Bar */}
            <View className="h-2 rounded-full overflow-hidden mb-1" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <View
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </View>

            {/* Capital & Interest Info */}
            <View className="flex-row justify-between mt-2">
              <View>
                <Text style={{ color: colors.textMuted }} className="text-xs">Capital Paid</Text>
                <Text className="text-emerald-400 font-semibold text-sm">
                  {formatCurrency(capitalPaid)}
                </Text>
              </View>
              <View className="items-end">
                <Text style={{ color: colors.textMuted }} className="text-xs">Interest Left</Text>
                <Text className="text-red-400 font-semibold text-sm">
                  {formatCurrency(interestRemaining)}
                </Text>
              </View>
            </View>
          </View>

          {/* Chevron */}
          <View className="ml-3">
            <ChevronRight size={20} color={colors.icon} />
          </View>
        </View>
      </GlassCard>
    </Pressable>
  );
}
