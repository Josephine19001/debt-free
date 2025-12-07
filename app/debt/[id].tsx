import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Trash2, Edit3, Calendar, CreditCard, Check } from 'lucide-react-native';
import { toast } from 'sonner-native';
import { PageLayout, SectionHeader } from '@/components/layouts';
import { GlassBottomSheet, GlassBottomSheetRef, BottomSheetTextInput, BottomSheetScrollView } from '@/components/ui/glass-bottom-sheet';
import { useDebt, useDeleteDebt, useRecordPayment, useDebtPayments } from '@/lib/hooks/use-debts';
import * as Haptics from 'expo-haptics';
import { showConfirmAlert } from '@/lib/utils/alert';
import {
  formatPercentage,
  calculateDebtProgress,
  calculatePayoffMonths,
  calculateTotalInterest,
  formatDate,
  formatDuration,
  calculatePayoffDate,
} from '@/lib/utils/debt-calculator';
import { useCurrency } from '@/context/currency-provider';
import { useColors } from '@/lib/hooks/use-colors';
import { useTheme } from '@/context/theme-provider';
import { DEBT_CATEGORY_CONFIG } from '@/lib/types/debt';
import {
  DebtDetailSkeleton,
  ExtraPaymentSlider,
  RefinanceSlider,
  PaymentChart,
  MetricCard,
  StatRow,
} from '@/components/debts';
import { MOCK_DATA, MOCK_PAYMENTS, DEMO_MODE } from '@/lib/config/mock-data';

export default function DebtDetailScreen() {
  const { formatCurrency } = useCurrency();
  const colors = useColors();
  const { isDark } = useTheme();
  const params = useLocalSearchParams();
  const id = typeof params.id === 'string' ? params.id : params.id?.[0] ?? '';
  const router = useRouter();
  const { data: realDebt, isLoading: realLoading } = useDebt(id);
  const { data: realPayments } = useDebtPayments(id);

  // Use mock data in demo mode
  const debt = DEMO_MODE
    ? MOCK_DATA.debts.find((d) => d.id === id) || MOCK_DATA.debts[0]
    : realDebt;
  const payments = DEMO_MODE ? MOCK_PAYMENTS : realPayments;
  const isLoading = DEMO_MODE ? false : realLoading;
  const deleteDebt = useDeleteDebt();
  const recordPayment = useRecordPayment();
  const paymentSheetRef = useRef<GlassBottomSheetRef>(null);
  const historySheetRef = useRef<GlassBottomSheetRef>(null);
  const paymentInputRef = useRef<any>(null);

  const [extraPayment, setExtraPayment] = useState<number | null>(null);
  const [newRate, setNewRate] = useState<number | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    if (debt) {
      if (extraPayment === null) {
        setExtraPayment(debt.minimum_payment);
      }
      if (newRate === null) {
        setNewRate(debt.interest_rate);
      }
    }
  }, [debt, extraPayment, newRate]);

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

  const handleOpenPaymentSheet = () => {
    if (debt) {
      setPaymentAmount(debt.minimum_payment.toString());
      paymentSheetRef.current?.expand();
      // Focus input after sheet animation completes
      setTimeout(() => {
        paymentInputRef.current?.focus();
      }, 100);
    }
  };

  const handleRecordPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0 || !debt) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    paymentSheetRef.current?.close();
    const result = await recordPayment.mutateAsync({
      debt_id: debt.id,
      amount,
    });
    setPaymentAmount('');

    if (result.debt_paid_off) {
      setTimeout(() => {
        toast.success(`🥳 ${debt.name} is paid off! You're crushing it! 🙌`);
      }, 500);
    }
  };

  const handleQuickPay = (amount: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPaymentAmount(amount.toString());
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
        <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <View className="absolute inset-0 rounded-full" style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }} />
        <Edit3 size={18} color={colors.icon} />
      </Pressable>
      <Pressable
        onPress={handleDelete}
        className="w-9 h-9 rounded-full overflow-hidden items-center justify-center"
      >
        <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
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
        <View
          className="mx-4 mt-2 rounded-2xl overflow-hidden"
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
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill}>
              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                }}
              />
            </BlurView>
          )}
          <View className="absolute inset-0 rounded-2xl" style={{ borderWidth: 1, borderColor: isDark ? colors.border : 'rgba(0, 0, 0, 0.08)' }} />

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
              <Text style={{ color: colors.textSecondary }} className="text-sm mb-1">Current Balance</Text>
              <Text style={{ color: colors.text }} className="font-bold text-4xl">
                {formatCurrency(debt.current_balance)}
              </Text>
              <Text style={{ color: colors.textMuted }} className="text-sm mt-1">
                of {formatCurrency(debt.original_balance)} original
              </Text>
            </View>

            {/* Progress Bar */}
            <View>
              <View className="flex-row justify-between mb-2">
                <Text style={{ color: colors.textSecondary }} className="text-sm">Progress</Text>
                <Text className="text-emerald-400 font-semibold">{progress}%</Text>
              </View>
              <View className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    backgroundColor:
                      progress >= 75 ? '#10B981' : progress >= 50 ? '#F59E0B' : '#3B82F6',
                  }}
                />
              </View>
              <View className="flex-row justify-between mt-2">
                <Text className="text-emerald-400 text-xs font-medium">
                  {formatCurrency(capitalPaid)} paid
                </Text>
                <Text style={{ color: colors.textMuted }} className="text-xs">
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
            value={`${debt.due_date}${
              debt.due_date === 1
                ? 'st'
                : debt.due_date === 2
                ? 'nd'
                : debt.due_date === 3
                ? 'rd'
                : 'th'
            }`}
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
            {
              label: 'Time Left',
              value: formatDuration(originalMonths),
              valueColor: 'text-gray-400',
            },
          ]}
        />

        {/* Payment History Section */}
        {payments && payments.length > 0 && (
          <>
            <SectionHeader title="Payment History" />
            <View
              className="mx-4 rounded-2xl overflow-hidden"
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
                <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill}>
                  <View
                    style={{
                      ...StyleSheet.absoluteFillObject,
                      backgroundColor: 'rgba(255,255,255,0.05)',
                    }}
                  />
                </BlurView>
              )}
              <View className="absolute inset-0 rounded-2xl" style={{ borderWidth: 1, borderColor: isDark ? colors.border : 'rgba(0, 0, 0, 0.08)' }} />

              {payments.slice(0, 5).map((payment, index) => {
                const paymentDate = new Date(payment.payment_date);
                const formattedDate = paymentDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <View
                    key={payment.id}
                    className="flex-row items-center justify-between p-4"
                    style={index !== Math.min(payments.length - 1, 4) ? { borderBottomWidth: 1, borderBottomColor: colors.borderLight } : undefined}
                  >
                    <View className="flex-row items-center flex-1">
                      <View className="w-10 h-10 rounded-full bg-emerald-500/20 items-center justify-center mr-3">
                        <Check size={18} color="#10B981" />
                      </View>
                      <View>
                        <Text style={{ color: colors.text }} className="font-medium">
                          {formatCurrency(payment.amount)}
                        </Text>
                        <Text style={{ color: colors.textMuted }} className="text-xs">{formattedDate}</Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text style={{ color: colors.textSecondary }} className="text-xs">
                        Principal: {formatCurrency(payment.principal_paid)}
                      </Text>
                      <Text style={{ color: colors.textMuted }} className="text-xs">
                        Interest: {formatCurrency(payment.interest_paid)}
                      </Text>
                    </View>
                  </View>
                );
              })}

              <Pressable
                onPress={() => historySheetRef.current?.expand()}
                className="p-3"
                style={{ borderTopWidth: 1, borderTopColor: colors.borderLight }}
              >
                <Text className="text-emerald-400 text-center text-sm font-medium">
                  See all {payments.length} payment{payments.length !== 1 ? 's' : ''}
                </Text>
              </Pressable>
            </View>
          </>
        )}

        {/* What If Section */}
        <SectionHeader title="What If..." />

        {/* Extra Payment Slider */}
        <ExtraPaymentSlider
          debt={debt}
          extraPayment={extraPayment ?? debt.minimum_payment}
          onExtraPaymentChange={setExtraPayment}
        />

        {/* Refinance Slider */}
        <RefinanceSlider
          debt={debt}
          newRate={newRate ?? debt.interest_rate}
          onNewRateChange={setNewRate}
        />
      </ScrollView>

      {/* Record Payment Button */}
      {debt.status !== 'paid_off' && (
        <View className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-4">
          <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          <Pressable
            onPress={handleOpenPaymentSheet}
            className="bg-emerald-500 rounded-2xl py-4 flex-row items-center justify-center"
          >
            <Check size={20} color="#FFFFFF" />
            <Text className="text-white font-semibold text-lg ml-2">Record Payment</Text>
          </Pressable>
        </View>
      )}

      {/* Payment Bottom Sheet */}
      <GlassBottomSheet ref={paymentSheetRef} snapPoints={['50%', '90%']}>
        <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
          <Text style={{ color: colors.text }} className="text-xl font-semibold mb-2">Record Payment</Text>
          <Text style={{ color: colors.textSecondary }} className="text-sm mb-6">
            Enter the amount you paid towards {debt.name}
          </Text>

          {/* Amount Input */}
          <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.textSecondary }} className="text-sm mb-2">Payment Amount</Text>
            <View className="flex-row items-center">
              <Text style={{ color: colors.text }} className="text-3xl font-bold mr-1">$</Text>
              <BottomSheetTextInput
                ref={paymentInputRef}
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                keyboardType="decimal-pad"
                keyboardAppearance={isDark ? 'dark' : 'light'}
                placeholder="0"
                placeholderTextColor={colors.inputPlaceholder}
                className="text-3xl font-bold flex-1"
                style={{ padding: 0, color: colors.text, fontSize: 30, fontWeight: 'bold' }}
              />
            </View>
          </View>

          {/* Quick Amount Buttons */}
          <View className="flex-row gap-2 mb-6">
            <Pressable
              onPress={() => handleQuickPay(debt.minimum_payment)}
              className="flex-1 py-3 rounded-xl"
              style={{
                backgroundColor: paymentAmount === debt.minimum_payment.toString() ? 'rgba(16, 185, 129, 0.2)' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                borderWidth: 1,
                borderColor: paymentAmount === debt.minimum_payment.toString() ? 'rgba(16, 185, 129, 0.5)' : colors.border,
              }}
            >
              <Text style={{ color: colors.text }} className="text-center font-medium">
                Min ({formatCurrency(debt.minimum_payment)})
              </Text>
            </Pressable>
            <Pressable
              onPress={() => handleQuickPay(debt.minimum_payment * 2)}
              className="flex-1 py-3 rounded-xl"
              style={{
                backgroundColor: paymentAmount === (debt.minimum_payment * 2).toString() ? 'rgba(16, 185, 129, 0.2)' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                borderWidth: 1,
                borderColor: paymentAmount === (debt.minimum_payment * 2).toString() ? 'rgba(16, 185, 129, 0.5)' : colors.border,
              }}
            >
              <Text style={{ color: colors.text }} className="text-center font-medium">
                2x ({formatCurrency(debt.minimum_payment * 2)})
              </Text>
            </Pressable>
            <Pressable
              onPress={() => handleQuickPay(debt.current_balance)}
              className="flex-1 py-3 rounded-xl"
              style={{
                backgroundColor: paymentAmount === debt.current_balance.toString() ? 'rgba(16, 185, 129, 0.2)' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                borderWidth: 1,
                borderColor: paymentAmount === debt.current_balance.toString() ? 'rgba(16, 185, 129, 0.5)' : colors.border,
              }}
            >
              <Text style={{ color: colors.text }} className="text-center font-medium">Full</Text>
            </Pressable>
          </View>

          {/* Confirm Button */}
          <Pressable
            onPress={handleRecordPayment}
            disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || recordPayment.isPending}
            className="rounded-2xl py-4"
            style={{ backgroundColor: paymentAmount && parseFloat(paymentAmount) > 0 ? '#10B981' : (isDark ? '#374151' : '#D1D5DB') }}
          >
            <Text className="text-white font-semibold text-lg text-center">
              {recordPayment.isPending ? 'Recording...' : 'Confirm Payment'}
            </Text>
          </Pressable>
        </BottomSheetScrollView>
      </GlassBottomSheet>

      {/* Payment History Bottom Sheet */}
      {payments && payments.length > 0 && (
        <GlassBottomSheet ref={historySheetRef} snapPoints={['70%']}>
          <View className="px-5 pt-2 pb-4 flex-1">
            <Text style={{ color: colors.text }} className="text-xl font-semibold mb-2">Payment History</Text>
            <Text style={{ color: colors.textSecondary }} className="text-sm mb-4">
              {payments.length} payments recorded for {debt.name}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              {payments.map((payment, index) => {
                const paymentDate = new Date(payment.payment_date);
                const formattedDate = paymentDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <View
                    key={payment.id}
                    className="flex-row items-center justify-between py-3"
                    style={index !== payments.length - 1 ? { borderBottomWidth: 1, borderBottomColor: colors.borderLight } : undefined}
                  >
                    <View className="flex-row items-center flex-1">
                      <View className="w-10 h-10 rounded-full bg-emerald-500/20 items-center justify-center mr-3">
                        <Check size={18} color="#10B981" />
                      </View>
                      <View>
                        <Text style={{ color: colors.text }} className="font-medium">
                          {formatCurrency(payment.amount)}
                        </Text>
                        <Text style={{ color: colors.textMuted }} className="text-xs">{formattedDate}</Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text style={{ color: colors.textSecondary }} className="text-xs">
                        Principal: {formatCurrency(payment.principal_paid)}
                      </Text>
                      <Text style={{ color: colors.textMuted }} className="text-xs">
                        Interest: {formatCurrency(payment.interest_paid)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </GlassBottomSheet>
      )}
    </PageLayout>
  );
}
