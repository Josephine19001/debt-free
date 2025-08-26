import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock } from 'lucide-react-native';
import { useSubscription } from '@/context/revenuecat-provider';
import { router } from 'expo-router';

interface TrialStatusBannerProps {
  className?: string;
}

export function TrialStatusBanner({ className }: TrialStatusBannerProps) {
  const { isInTrial, trialEndsAt, trialDuration, subscriptionType, isSubscribed } =
    useSubscription();

  // Don't show if user has full subscription
  if (isSubscribed && !isInTrial) return null;

  // Don't show if not in trial
  if (!isInTrial || !trialEndsAt) return null;

  const daysLeft = Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60));

  const timeLeft =
    daysLeft > 0
      ? `${daysLeft} day${daysLeft === 1 ? '' : 's'}`
      : `${hoursLeft} hour${hoursLeft === 1 ? '' : 's'}`;

  // Show trial type based on subscription
  const trialTypeText =
    subscriptionType === 'yearly' ? 'Yearly Trial Active' : 'Weekly Trial Active';

  const handleUpgrade = () => {
    router.push('/');
  };

  return (
    <TouchableOpacity onPress={handleUpgrade} className={className}>
      <LinearGradient
        colors={['#3B82F6', '#1D4ED8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="mx-4 rounded-xl p-4 mb-4"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="bg-white/20 rounded-full p-2 mr-3">
              <Clock size={16} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold text-sm">{trialTypeText}</Text>
              <Text className="text-white/80 text-xs">{timeLeft} left • Tap to upgrade</Text>
            </View>
          </View>
          <View className="bg-white/20 rounded-full px-3 py-1">
            <Text className="text-white text-xs font-medium">Upgrade</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}
