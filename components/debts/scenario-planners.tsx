import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { GlassCard } from '@/components/layouts';
import { Debt } from '@/lib/types/debt';
import {
  formatCurrency,
  formatPercentage,
  formatDate,
  formatDuration,
  calculateExtraPaymentScenario,
  calculateRefinanceScenario,
  calculateTotalInterest,
  calculatePayoffMonths,
} from '@/lib/utils/debt-calculator';
import { TrendingDown, Calendar, DollarSign, Percent } from 'lucide-react-native';

interface ExtraPaymentSliderProps {
  debt: Debt;
  extraPayment: number;
  onExtraPaymentChange: (value: number) => void;
}

export function ExtraPaymentSlider({
  debt,
  extraPayment,
  onExtraPaymentChange,
}: ExtraPaymentSliderProps) {
  const scenario = calculateExtraPaymentScenario(debt, extraPayment);
  const maxExtra = Math.min(500, debt.current_balance / 2);

  return (
    <GlassCard>
      <View className="flex-row items-center mb-4">
        <View className="w-10 h-10 rounded-full bg-emerald-500/20 items-center justify-center mr-3">
          <DollarSign size={20} color="#10B981" />
        </View>
        <View>
          <Text className="text-white font-semibold">Extra Monthly Payment</Text>
          <Text className="text-gray-400 text-xs">See how extra payments accelerate payoff</Text>
        </View>
      </View>

      {/* Slider */}
      <View className="mb-4">
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-400 text-sm">Extra Payment</Text>
          <Text className="text-emerald-400 font-bold text-lg">
            +{formatCurrency(extraPayment)}/mo
          </Text>
        </View>
        <Slider
          value={extraPayment}
          onValueChange={onExtraPaymentChange}
          minimumValue={0}
          maximumValue={maxExtra}
          step={10}
          minimumTrackTintColor="#10B981"
          maximumTrackTintColor="rgba(255,255,255,0.1)"
          thumbTintColor="#10B981"
        />
        <View className="flex-row justify-between">
          <Text className="text-gray-500 text-xs">$0</Text>
          <Text className="text-gray-500 text-xs">{formatCurrency(maxExtra)}</Text>
        </View>
      </View>

      {/* Results */}
      {extraPayment > 0 && (
        <View className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
          <View className="flex-row justify-between mb-3">
            <View className="flex-row items-center">
              <Calendar size={16} color="#10B981" />
              <Text className="text-gray-400 text-sm ml-2">New Payoff Date</Text>
            </View>
            <Text className="text-white font-semibold">
              {formatDate(scenario.new_payoff_date)}
            </Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <View className="flex-row items-center">
              <TrendingDown size={16} color="#10B981" />
              <Text className="text-gray-400 text-sm ml-2">Time Saved</Text>
            </View>
            <Text className="text-emerald-400 font-bold">
              {scenario.months_saved} months
            </Text>
          </View>

          <View className="flex-row justify-between">
            <View className="flex-row items-center">
              <DollarSign size={16} color="#10B981" />
              <Text className="text-gray-400 text-sm ml-2">Interest Saved</Text>
            </View>
            <Text className="text-emerald-400 font-bold">
              {formatCurrency(scenario.total_interest_saved)}
            </Text>
          </View>
        </View>
      )}
    </GlassCard>
  );
}

interface RefinanceSliderProps {
  debt: Debt;
  newRate: number;
  onNewRateChange: (value: number) => void;
}

export function RefinanceSlider({
  debt,
  newRate,
  onNewRateChange,
}: RefinanceSliderProps) {
  const scenario = calculateRefinanceScenario(debt, newRate);
  const currentRatePercent = debt.interest_rate * 100;
  const minRate = Math.max(0.01, currentRatePercent - 15);
  const newRatePercent = newRate * 100;
  const isLowerRate = newRate < debt.interest_rate;

  return (
    <GlassCard>
      <View className="flex-row items-center mb-4">
        <View className="w-10 h-10 rounded-full bg-cyan-500/20 items-center justify-center mr-3">
          <Percent size={20} color="#06B6D4" />
        </View>
        <View>
          <Text className="text-white font-semibold">Refinance Simulator</Text>
          <Text className="text-gray-400 text-xs">See savings with a lower interest rate</Text>
        </View>
      </View>

      {/* Slider */}
      <View className="mb-4">
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-400 text-sm">New Interest Rate</Text>
          <Text className={`font-bold text-lg ${isLowerRate ? 'text-cyan-400' : 'text-gray-400'}`}>
            {newRatePercent.toFixed(2)}%
          </Text>
        </View>
        <Slider
          value={newRatePercent}
          onValueChange={(val) => onNewRateChange(val / 100)}
          minimumValue={minRate}
          maximumValue={currentRatePercent}
          step={0.25}
          minimumTrackTintColor="#06B6D4"
          maximumTrackTintColor="rgba(255,255,255,0.1)"
          thumbTintColor="#06B6D4"
        />
        <View className="flex-row justify-between">
          <Text className="text-gray-500 text-xs">{minRate.toFixed(1)}%</Text>
          <Text className="text-gray-500 text-xs">{currentRatePercent.toFixed(2)}% (current)</Text>
        </View>
      </View>

      {/* Results */}
      {isLowerRate && (
        <View className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
          <Text className="text-cyan-400 font-semibold mb-3">
            Refinance at {newRatePercent.toFixed(2)}% and save:
          </Text>

          <View className="flex-row justify-between mb-3">
            <View className="flex-row items-center">
              <Calendar size={16} color="#06B6D4" />
              <Text className="text-gray-400 text-sm ml-2">New Payoff Date</Text>
            </View>
            <Text className="text-white font-semibold">
              {formatDate(scenario.new_payoff_date)}
            </Text>
          </View>

          <View className="flex-row justify-between">
            <View className="flex-row items-center">
              <DollarSign size={16} color="#06B6D4" />
              <Text className="text-gray-400 text-sm ml-2">Total Interest Saved</Text>
            </View>
            <Text className="text-cyan-400 font-bold text-lg">
              {formatCurrency(scenario.total_interest_saved)}
            </Text>
          </View>
        </View>
      )}
    </GlassCard>
  );
}

interface PrincipalInterestChartProps {
  debt: Debt;
}

export function PrincipalInterestChart({ debt }: PrincipalInterestChartProps) {
  const totalInterest = calculateTotalInterest(
    debt.current_balance,
    debt.interest_rate,
    debt.minimum_payment
  );
  const totalPaid = debt.current_balance + totalInterest;
  const principalPercent = Math.round((debt.current_balance / totalPaid) * 100);
  const interestPercent = 100 - principalPercent;

  return (
    <GlassCard>
      <Text className="text-white font-semibold mb-4">Total Cost Breakdown</Text>

      {/* Simple Bar Chart */}
      <View className="h-8 flex-row rounded-full overflow-hidden mb-4">
        <View
          className="bg-emerald-500 items-center justify-center"
          style={{ width: `${principalPercent}%` }}
        >
          {principalPercent > 20 && (
            <Text className="text-white text-xs font-bold">{principalPercent}%</Text>
          )}
        </View>
        <View
          className="bg-red-500 items-center justify-center"
          style={{ width: `${interestPercent}%` }}
        >
          {interestPercent > 20 && (
            <Text className="text-white text-xs font-bold">{interestPercent}%</Text>
          )}
        </View>
      </View>

      {/* Legend */}
      <View className="flex-row justify-between">
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-emerald-500 mr-2" />
          <View>
            <Text className="text-gray-400 text-xs">Principal</Text>
            <Text className="text-white font-semibold">
              {formatCurrency(debt.current_balance)}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-red-500 mr-2" />
          <View>
            <Text className="text-gray-400 text-xs">Interest</Text>
            <Text className="text-red-400 font-semibold">
              {formatCurrency(totalInterest)}
            </Text>
          </View>
        </View>

        <View>
          <Text className="text-gray-400 text-xs">Total</Text>
          <Text className="text-white font-semibold">
            {formatCurrency(totalPaid)}
          </Text>
        </View>
      </View>
    </GlassCard>
  );
}
