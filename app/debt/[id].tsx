import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import {
  Trash2,
  Edit3,
  Calendar,
  CreditCard,
} from 'lucide-react-native';
import { PageLayout, SectionHeader } from '@/components/layouts';
import { useDebt, useDeleteDebt } from '@/lib/hooks/use-debts';
import { showConfirmAlert } from '@/lib/utils/alert';
import {
  formatCurrency,
  formatPercentage,
  calculateDebtProgress,
  calculatePayoffMonths,
  calculateTotalInterest,
  formatDate,
  formatDuration,
  calculatePayoffDate,
} from '@/lib/utils/debt-calculator';
import { DEBT_CATEGORY_CONFIG } from '@/lib/types/debt';
import {
  DebtDetailSkeleton,
  ExtraPaymentSlider,
  RefinanceSlider,
  PaymentChart,
  MetricCard,
  StatRow,
} from '@/components/debts';

export default function DebtDetailScreen() {
  const params = useLocalSearchParams();
  const id = typeof params.id === 'string' ? params.id : params.id?.[0] ?? '';
  const router = useRouter();
  const { data: debt, isLoading } = useDebt(id);
  const deleteDebt = useDeleteDebt();

  const [extraPayment, setExtraPayment] = useState(0);
  const [newRate, setNewRate] = useState(0);

  useEffect(() => {
    if (debt && newRate === 0) {
      setNewRate(debt.interest_rate);
    }
  }, [debt, newRate]);

  const handleDelete = () => {
    if (!debt) return;
    showConfirmAlert({
      title: 'Delete Debt',
      message: `Are you sure you want to delete "${debt.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      onConfirm: async () => {
        await deleteDebt.mutateAsync(id);
        router.back();
      },
      destructive: true,
    });
  };

  const handleEdit = () => {
    router.push(`/debt/edit/${id}`);
  };

  if (isLoading) {
    return (
      <PageLayout title="" showBackButton>
        <DebtDetailSkeleton />
      </PageLayout>
    );
  }

  if (!debt) {
    return (
      <PageLayout title="Not Found" showBackButton>
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-gray-400 text-center">
            Debt not found. It may have been deleted.
          </Text>
        </View>
      </PageLayout>
    );
  }

  const progress = calculateDebtProgress(debt);
  const categoryConfig = DEBT_CATEGORY_CONFIG[debt.category];
  const originalMonths = calculatePayoffMonths(
    debt.current_balance,
    debt.interest_rate,
    debt.minimum_payment
  );
  const totalInterest = calculateTotalInterest(
    debt.current_balance,
    debt.interest_rate,
    debt.minimum_payment
  );
  const payoffDate = calculatePayoffDate(originalMonths);
  const capitalPaid = debt.original_balance - debt.current_balance;

  const headerActions = (
    <View className="flex-row items-center">
      <Pressable
        onPress={handleEdit}
        className="w-9 h-9 rounded-full overflow-hidden items-center justify-center mr-2"
      >
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <View className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.03]" />
        <Edit3 size={18} color="#9CA3AF" />
      </Pressable>
      <Pressable
        onPress={handleDelete}
        className="w-9 h-9 rounded-full overflow-hidden items-center justify-center"
      >
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <View className="absolute inset-0 rounded-full border border-red-500/30 bg-red-500/10" />
        <Trash2 size={18} color="#EF4444" />
      </Pressable>
    </View>
  );

  return (
    <PageLayout title={debt.name} showBackButton rightAction={headerActions}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Hero Card - Balance & Progress */}
        <View className="mx-4 mt-2 rounded-2xl overflow-hidden">
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill}>
            <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.05)' }} />
          </BlurView>
          <View className="absolute inset-0 rounded-2xl border border-white/10" />

          <View className="p-5">
            {/* Category & Rate */}
            <View className="flex-row items-center justify-between mb-4">
              <View className={`${categoryConfig.bgColor} px-3 py-1 rounded-full`}>
                <Text style={{ color: categoryConfig.color }} className="text-xs font-medium">
                  {categoryConfig.label}
                </Text>
              </View>
              <View className="bg-red-500/20 px-3 py-1 rounded-full">
                <Text className="text-red-400 font-bold text-sm">
                  {formatPercentage(debt.interest_rate)} APR
                </Text>
              </View>
            </View>

            {/* Balance */}
            <View className="items-center mb-4">
              <Text className="text-gray-400 text-sm mb-1">Current Balance</Text>
              <Text className="text-white font-bold text-4xl">
                {formatCurrency(debt.current_balance)}
              </Text>
              <Text className="text-gray-500 text-sm mt-1">
                of {formatCurrency(debt.original_balance)} original
              </Text>
            </View>

            {/* Progress Bar */}
            <View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-400 text-sm">Progress</Text>
                <Text className="text-emerald-400 font-semibold">{progress}%</Text>
              </View>
              <View className="h-3 bg-white/10 rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: progress >= 75 ? '#10B981' : progress >= 50 ? '#F59E0B' : '#3B82F6',
                  }}
                />
              </View>
              <View className="flex-row justify-between mt-2">
                <Text className="text-emerald-400 text-xs font-medium">
                  {formatCurrency(capitalPaid)} paid
                </Text>
                <Text className="text-gray-500 text-xs">
                  {formatCurrency(debt.current_balance)} left
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Stats Row */}
        <View className="flex-row mx-3 mt-2">
          <MetricCard
            icon={Calendar}
            iconColor="#10B981"
            iconBgColor="bg-emerald-500/20"
            label="Due Date"
            value={`${debt.due_date}${debt.due_date === 1 ? 'st' : debt.due_date === 2 ? 'nd' : debt.due_date === 3 ? 'rd' : 'th'}`}
            subValue="of month"
          />
          <MetricCard
            icon={CreditCard}
            iconColor="#3B82F6"
            iconBgColor="bg-blue-500/20"
            label="Payment"
            value={formatCurrency(debt.minimum_payment)}
            subValue="per month"
          />
        </View>

        {/* Payment Breakdown Section */}
        <SectionHeader title="Payment Breakdown" />

        {/* Payment Chart */}
        <PaymentChart debt={debt} />

        {/* Payoff Timeline */}
        <StatRow
          items={[
            { label: 'Payoff Date', value: formatDate(payoffDate), valueColor: 'text-white' },
            { label: 'Time Left', value: formatDuration(originalMonths), valueColor: 'text-gray-400' },
          ]}
        />

        {/* What If Section */}
        <SectionHeader title="What If..." />

        {/* Extra Payment Slider */}
        <ExtraPaymentSlider
          debt={debt}
          extraPayment={extraPayment}
          onExtraPaymentChange={setExtraPayment}
        />

        {/* Refinance Slider */}
        <RefinanceSlider
          debt={debt}
          newRate={newRate}
          onNewRateChange={setNewRate}
        />
      </ScrollView>
    </PageLayout>
  );
}
