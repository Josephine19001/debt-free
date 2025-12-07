import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingDown } from 'lucide-react-native';
import { useCurrency } from '@/context/currency-provider';
import { useColors } from '@/lib/hooks/use-colors';
import { useTheme } from '@/context/theme-provider';

interface OverviewCardProps {
  totalBalance: number;
  totalOriginal: number;
  monthlyPayment: number;
  debtFreeDate: string;
  isLoading?: boolean;
}

export function OverviewCard({
  totalBalance,
  totalOriginal,
  monthlyPayment,
  debtFreeDate,
  isLoading,
}: OverviewCardProps) {
  const { formatCurrency } = useCurrency();
  const colors = useColors();
  const { isDark } = useTheme();
  const progress = totalOriginal > 0
    ? Math.round(((totalOriginal - totalBalance) / totalOriginal) * 100)
    : 0;
  const hasDebts = totalBalance > 0;

  return (
    <View
      className="mx-4 my-2 rounded-3xl overflow-hidden"
      style={{
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: isDark ? 0.3 : 0.08,
        shadowRadius: isDark ? 6 : 10,
        elevation: isDark ? 4 : 3,
        backgroundColor: isDark ? colors.card : '#FFFFFF',
      }}
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
        className="absolute inset-0 rounded-3xl"
        style={{
          borderWidth: 1,
          borderColor: isDark ? colors.border : 'rgba(0, 0, 0, 0.08)',
        }}
      />

      <View className="p-5">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-5">
          <View className="flex-row items-center">
            <View className="w-11 h-11 rounded-2xl bg-emerald-500/15 items-center justify-center mr-3">
              <TrendingDown size={22} color="#10B981" />
            </View>
            <View>
              <Text style={{ color: colors.textSecondary }} className="text-xs uppercase tracking-wider">Total Debt</Text>
              <Text style={{ color: colors.text }} className="text-3xl font-bold -mt-0.5">
                {isLoading ? '...' : formatCurrency(totalBalance)}
              </Text>
            </View>
          </View>
          {hasDebts && (
            <View className="bg-emerald-500/15 px-3 py-2 rounded-xl">
              <Text className="text-emerald-400 font-bold text-lg">{progress}%</Text>
              <Text className="text-emerald-400/60 text-xs">paid</Text>
            </View>
          )}
        </View>

        {/* Progress Bar */}
        {hasDebts && (
          <View className="mb-5">
            <View className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: colors.borderLight }}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ height: '100%', width: `${progress}%`, borderRadius: 999 }}
              />
            </View>
          </View>
        )}

        {/* Stats */}
        <View
          className="flex-row rounded-2xl p-4"
          style={{ backgroundColor: isDark ? colors.borderLight : 'rgba(0, 0, 0, 0.04)' }}
        >
          <View className="flex-1 border-r pr-4" style={{ borderColor: isDark ? colors.border : 'rgba(0, 0, 0, 0.1)' }}>
            <Text style={{ color: colors.textMuted }} className="text-xs uppercase tracking-wider mb-1">Monthly</Text>
            <Text style={{ color: colors.text }} className="font-bold text-lg">
              {isLoading ? '...' : formatCurrency(monthlyPayment)}
            </Text>
          </View>
          <View className="flex-1 pl-4">
            <Text style={{ color: colors.textMuted }} className="text-xs uppercase tracking-wider mb-1">Debt Free</Text>
            <Text style={{ color: colors.text }} className="font-bold text-lg">
              {isLoading ? '...' : debtFreeDate}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
