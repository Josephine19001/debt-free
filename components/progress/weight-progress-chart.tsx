import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/context/theme-provider';
import { Scale, TrendingDown, TrendingUp, Minus, Plus } from 'lucide-react-native';
import {
  WeightEntry,
  useBodyMeasurements,
} from '@/lib/hooks/use-weight-tracking';
import { AddWeightModal } from '@/components/weight/modals/AddWeightModal';
import { WeightChartSkeletonLoader, chartHeight } from './skeleton';

interface Props {
  weightEntries: WeightEntry[];
  goalWeight?: number;
  isLoading?: boolean;
}

export const WeightProgressChart = ({ weightEntries, goalWeight, isLoading }: Props) => {
  const { theme } = useTheme();
  const hasData = weightEntries.length > 0;

  // Modal state
  const [showAddEntry, setShowAddEntry] = useState(false);

  // Hooks
  const { data: bodyMeasurements } = useBodyMeasurements();


  if (!hasData) {
    return (
      <View className={`${theme === 'dark' ? 'bg-slate-700' : 'bg-white'} rounded-3xl p-6 mx-4 mb-4`}>
        <View className="flex-row justify-between items-center mb-2">
          <Text className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Weight Progress</Text>
          <Pressable
            onPress={() => setShowAddEntry(true)}
            className="bg-pink-500 px-3 py-2 rounded-xl flex-row items-center gap-2"
          >
            <Plus size={16} color="white" />
            <Text className="text-white font-medium text-sm">Log Weight</Text>
          </Pressable>
        </View>
        <View className="mb-6 flex flex-row gap-2 items-center">
          <Text className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>--</Text>
          <Text className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>kg</Text>
        </View>

        <View className="flex flex-col items-center justify-center h-64 px-6">
          <View className={`rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-slate-100'} p-4 flex items-center justify-center mb-4`}>
            <Scale size={24} color={theme === 'dark' ? '#9CA3AF' : '#64748b'} />
          </View>
          <Text className={`text-2xl font-bold mb-4 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No weight data</Text>
          <Text className={`text-lg text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Start logging your weight to track your progress
          </Text>
        </View>

        {/* Add Weight Modal */}
        <AddWeightModal
          visible={showAddEntry}
          bodyMeasurements={bodyMeasurements || null}
          onClose={() => setShowAddEntry(false)}
        />
      </View>
    );
  }

  // Get current and starting weights
  const currentWeight = weightEntries[weightEntries.length - 1]?.weight || 0;
  const startingWeight = weightEntries[0]?.weight || 0;
  const weightChange = currentWeight - startingWeight;
  const units = weightEntries[0]?.units || 'kg';

  // Calculate chart boundaries
  const weights = weightEntries.map((entry) => entry.weight);
  const minWeight = Math.min(...weights, goalWeight || Infinity);
  const maxWeight = Math.max(...weights, goalWeight || -Infinity);
  const padding = (maxWeight - minWeight) * 0.1 || 1; // 10% padding or minimum 1 unit
  const chartMin = minWeight - padding;
  const chartMax = maxWeight + padding;
  const range = chartMax - chartMin;

  // Y-axis steps
  const yAxisSteps = 5;
  const yAxisStep = range / yAxisSteps;

  // Calculate positions for line chart
  const getY = (weight: number) => {
    if (!isFinite(weight) || range === 0) return chartHeight / 2;
    return ((chartMax - weight) / range) * chartHeight;
  };

  const getX = (index: number) => {
    if (weightEntries.length <= 1) return 56;
    return 56 + (index / (weightEntries.length - 1)) * (300 - 56); // Account for y-axis labels
  };

  // Trend calculation
  const getTrendIcon = () => {
    if (Math.abs(weightChange) < 0.1) {
      return <Minus size={16} color="#6B7280" />;
    }
    return weightChange > 0 ? (
      <TrendingUp size={16} color="#EF4444" />
    ) : (
      <TrendingDown size={16} color="#10B981" />
    );
  };

  const getTrendText = () => {
    if (Math.abs(weightChange) < 0.1) {
      return 'Stable';
    }
    const changeText = `${Math.abs(weightChange).toFixed(1)}${units}`;
    return weightChange > 0 ? `+${changeText}` : `-${changeText}`;
  };

  const getTrendColor = () => {
    if (Math.abs(weightChange) < 0.1) return 'text-gray-600';
    return weightChange > 0 ? 'text-red-500' : 'text-green-500';
  };

  // Skeleton loader component

  if (isLoading) {
    return <WeightChartSkeletonLoader />;
  }

  return (
    <View className={`${theme === 'dark' ? 'bg-slate-700' : 'bg-white'} rounded-3xl p-6 mx-4 mb-4`}>
      <View className="flex-row justify-between items-center mb-2">
        <Text className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Weight Progress</Text>
        <Pressable
          onPress={() => setShowAddEntry(true)}
          className="bg-pink-500 px-3 py-2 rounded-xl flex-row items-center gap-2"
        >
          <Plus size={16} color="white" />
          <Text className="text-white font-medium text-sm">Log Weight</Text>
        </Pressable>
      </View>
      <View className="mb-2 flex flex-row gap-2 items-center">
        <Text className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{currentWeight.toFixed(1)}</Text>
        <Text className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{units}</Text>
      </View>

      {/* Trend indicator */}
      <View className="mb-6 flex flex-row items-center gap-2">
        {getTrendIcon()}
        <Text className={`text-sm font-medium ${getTrendColor()}`}>
          {getTrendText()} from start
        </Text>
      </View>

      {/* Chart Container */}
      <View className="relative" style={{ height: chartHeight + 40 }}>
        {/* Y-axis grid lines and labels */}
        {Array.from({ length: yAxisSteps + 1 }).map((_, i) => {
          const value = chartMax - i * yAxisStep;
          const yPosition = (i / yAxisSteps) * chartHeight;
          return (
            <View
              key={i}
              className="absolute left-0 flex-row items-center w-full"
              style={{ top: yPosition }}
            >
              <Text className="text-xs text-gray-400 w-12 text-right mr-2">{value.toFixed(1)}</Text>
              <View className={`flex-1 h-[1px] ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'}`} />
            </View>
          );
        })}

        {/* Goal weight line */}
        {goalWeight && goalWeight >= chartMin && goalWeight <= chartMax && (
          <View
            className="absolute left-14 right-0 border-t-2 border-dashed border-pink-400"
            style={{ top: getY(goalWeight) }}
          >
            <View className="absolute -right-2 -top-3 bg-pink-100 px-2 py-1 rounded-full">
              <Text className="text-xs font-medium text-pink-700">Goal</Text>
            </View>
          </View>
        )}

        {/* Weight line chart */}
        <View className="absolute" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
          {/* Connecting lines */}
          {weightEntries.map((entry, index) => {
            if (index === weightEntries.length - 1) return null;
            const nextEntry = weightEntries[index + 1];
            const x1 = getX(index);
            const y1 = getY(entry.weight);
            const x2 = getX(index + 1);
            const y2 = getY(nextEntry.weight);

            const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            const angle = Math.atan2(y2 - y1, x2 - x1);

            return (
              <View
                key={`line-${index}`}
                className="absolute bg-pink-500"
                style={{
                  height: 2,
                  width: distance,
                  left: x1,
                  top: y1 - 1,
                  transform: [{ rotate: `${angle}rad` }],
                  transformOrigin: 'left center',
                }}
              />
            );
          })}

          {/* Data points */}
          {weightEntries.map((entry, index) => (
            <View
              key={entry.id}
              className="absolute"
              style={{
                left: getX(index) - 4,
                top: getY(entry.weight) - 4,
              }}
            >
              <View className="w-2 h-2 rounded-full bg-pink-500 border-2 border-white shadow-sm" />
            </View>
          ))}
        </View>

        {/* X-axis labels (dates) */}
        <View className="absolute bottom-0 left-14 right-0 flex-row justify-between">
          {weightEntries.length > 0 && (
            <>
              <Text className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {new Date(weightEntries[0].measured_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
              {weightEntries.length > 1 && (
                <Text className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {new Date(weightEntries[weightEntries.length - 1].measured_at).toLocaleDateString(
                    'en-US',
                    {
                      month: 'short',
                      day: 'numeric',
                    }
                  )}
                </Text>
              )}
            </>
          )}
        </View>
      </View>

      {/* Legend */}
      <View className="flex-row justify-center items-center gap-4 mt-4">
        <View className="flex-row items-center gap-2">
          <View className="w-3 h-3 rounded-full bg-pink-500" />
          <Text className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>Weight</Text>
        </View>
        {goalWeight && (
          <View className="flex-row items-center gap-2">
            <View className="w-3 h-0.5 bg-pink-400 border-dashed" />
            <Text className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
              Goal ({goalWeight}
              {units === 'metric' ? 'kg' : 'lbs'})
            </Text>
          </View>
        )}
      </View>

      {/* Add Weight Modal */}
      <AddWeightModal
        visible={showAddEntry}
        bodyMeasurements={bodyMeasurements || null}
        onClose={() => setShowAddEntry(false)}
      />
    </View>
  );
};
