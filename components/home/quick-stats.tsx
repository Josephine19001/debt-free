import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Target, Trophy, TrendingUp, PiggyBank } from 'lucide-react-native';
import { useCurrency } from '@/context/currency-provider';
import { useColors } from '@/lib/hooks/use-colors';
import { useTheme } from '@/context/theme-provider';

interface QuickStatsProps {
  activeCount: number;
  paidOffCount: number;
  totalPaid: number;
  interestSaved: number;
  isLoading?: boolean;
}

export function QuickStats({
  activeCount,
  paidOffCount,
  totalPaid,
  interestSaved,
  isLoading,
}: QuickStatsProps) {
  const { formatCurrency } = useCurrency();
  const colors = useColors();
  const { isDark } = useTheme();
  const stats = [
    { icon: Target, color: '#3B82F6', label: 'Active', value: String(activeCount) },
    { icon: Trophy, color: '#A855F7', label: 'Paid Off', value: String(paidOffCount) },
    { icon: TrendingUp, color: '#10B981', label: 'Paid', value: formatCurrency(totalPaid) },
    { icon: PiggyBank, color: '#F59E0B', label: 'Saved', value: formatCurrency(interestSaved) },
  ];

  return (
    <View className="flex-row flex-wrap mx-3 mt-1">
      {stats.map((stat) => (
        <View key={stat.label} className="w-1/2 p-1">
          <View
            className="rounded-2xl overflow-hidden"
            style={{
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.3 : 0.06,
              shadowRadius: isDark ? 4 : 6,
              elevation: isDark ? 3 : 2,
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
              className="absolute inset-0 rounded-2xl"
              style={{
                borderWidth: 1,
                borderColor: isDark ? colors.border : 'rgba(0, 0, 0, 0.08)',
              }}
            />

            <View className="p-4 flex-row items-center">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: `${stat.color}${isDark ? '20' : '15'}` }}
              >
                <stat.icon size={18} color={stat.color} />
              </View>
              <View>
                <Text style={{ color: colors.textMuted }} className="text-xs uppercase tracking-wider">{stat.label}</Text>
                <Text style={{ color: colors.text }} className="font-bold text-base">
                  {isLoading ? '...' : stat.value}
                </Text>
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
