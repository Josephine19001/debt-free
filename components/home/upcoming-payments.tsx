import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Debt } from '@/lib/types/debt';
import { useRecordPayment } from '@/lib/hooks/use-debts';
import { useCurrency } from '@/context/currency-provider';
import { useColors } from '@/lib/hooks/use-colors';
import { useTheme } from '@/context/theme-provider';

interface UpcomingPaymentsProps {
  debts: Debt[];
  paidDebtIds?: Set<string>;
}

export function UpcomingPayments({ debts, paidDebtIds = new Set() }: UpcomingPaymentsProps) {
  const router = useRouter();
  const { formatCurrency } = useCurrency();
  const colors = useColors();
  const { isDark } = useTheme();
  const { mutate: recordPayment, isPending } = useRecordPayment();
  const today = new Date();
  const currentDay = today.getDate();

  const getDaysUntilDue = (dueDate: number) => {
    if (dueDate >= currentDay) return dueDate - currentDay;
    return (30 - currentDay) + dueDate;
  };

  const handleMarkPaid = (debt: Debt) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    recordPayment({
      debt_id: debt.id,
      amount: debt.minimum_payment,
    });
  };

  const upcomingPayments = debts
    .filter(d => d.status === 'active' && !paidDebtIds.has(d.id))
    .map(d => ({ ...d, daysUntil: getDaysUntilDue(d.due_date) }))
    .filter(d => d.daysUntil <= 7)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 5);

  if (upcomingPayments.length === 0) return null;

  return (
    <View
      className="mx-4 my-2 rounded-2xl overflow-hidden"
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

      <View className="p-4">
        {upcomingPayments.map((debt, index) => {
          const isUrgent = debt.daysUntil <= 2;
          const isDueToday = debt.daysUntil === 0;
          const dueText = isDueToday ? 'Due Today' :
                          debt.daysUntil === 1 ? 'Tomorrow' :
                          `In ${debt.daysUntil} days`;

          return (
            <View
              key={debt.id}
              className="py-3"
              style={index < upcomingPayments.length - 1 ? { borderBottomWidth: 1, borderBottomColor: colors.borderLight } : undefined}
            >
              <Pressable
                onPress={() => router.push(`/debt/${debt.id}`)}
                className="flex-row items-center"
              >
                <View
                  className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                  style={{ backgroundColor: isUrgent ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)' }}
                >
                  <Clock size={14} color={isUrgent ? '#EF4444' : '#F59E0B'} />
                </View>
                <View className="flex-1">
                  <Text style={{ color: colors.text }} className="font-medium" numberOfLines={1}>{debt.name}</Text>
                  <Text className={`text-xs ${isUrgent ? 'text-red-400' : 'text-amber-400'}`}>
                    {dueText}
                  </Text>
                </View>
                <Text style={{ color: colors.text }} className="font-bold mr-3">{formatCurrency(debt.minimum_payment)}</Text>
              </Pressable>

              {/* Mark Paid Button - show for debts due within 2 days */}
              {isUrgent && (
                <Pressable
                  onPress={() => handleMarkPaid(debt)}
                  disabled={isPending}
                  className="flex-row items-center justify-center mt-3 py-2.5 rounded-xl bg-emerald-500/15"
                >
                  <Check size={16} color="#10B981" />
                  <Text className="text-emerald-400 font-semibold ml-2 text-sm">Mark as Paid</Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
