import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Crown, Infinity } from 'lucide-react-native';
import { useDailyScanLimit } from '@/lib/hooks/use-daily-scan-limit';

export function ScanStatusBanner() {
  const { remainingScans, isSubscribed, totalDailyLimit } = useDailyScanLimit();

  if (isSubscribed) {
    return (
      <View className="absolute top-16 left-4 right-4 z-10">
        <LinearGradient
          colors={['#10B981', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="rounded-lg p-3"
        >
          <View className="flex-row items-center">
            <Crown size={16} color="white" />
            <Text className="text-white font-semibold text-sm ml-2">Pro Unlimited</Text>
            <View className="ml-auto flex-row items-center">
              <Infinity size={16} color="white" />
              <Text className="text-white text-xs ml-1">Unlimited scans</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View className="absolute top-16 left-4 right-4 z-10">
      <LinearGradient
        colors={remainingScans > 0 ? ['#3B82F6', '#1D4ED8'] : ['#EF4444', '#DC2626']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="rounded-lg p-3"
      >
        <View className="flex-row items-center">
          <Camera size={16} color="white" />
          <Text className="text-white font-semibold text-sm ml-2">
            {remainingScans > 0 ? 'Free Tier' : 'Daily Limit Reached'}
          </Text>
          <View className="ml-auto">
            <Text className="text-white text-xs">
              {remainingScans}/{totalDailyLimit} scans today
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
