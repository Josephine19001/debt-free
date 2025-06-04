import { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSubscription } from '../context/subscription-provider';
import { toast } from 'sonner-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '@/components/ui';

// Global __DEV__ is available in React Native
declare const __DEV__: boolean;

export default function PaywallScreen() {
  const {
    products,
    loading: subscriptionLoading,
    purchaseSubscription,
    restorePurchases,
  } = useSubscription();

  const [selectedPlan, setSelectedPlan] = useState<string>('yearly');
  const [loading, setLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);

  const features = [
    {
      icon: 'scan' as const,
      title: 'Unlimited Product Scanning',
    },
    {
      icon: 'people' as const,
      title: 'Join Hair Community',
    },
    {
      icon: 'analytics' as const,
      title: 'AI Hair Journey Tracking',
    },
    {
      icon: 'chatbubbles' as const,
      title: 'Community Support & Tips',
    },
  ];

  const handleRestore = async () => {
    try {
      setRestoreLoading(true);
      await restorePurchases();
    } catch (error) {
      console.error('Restore error in paywall:', error);
    } finally {
      setRestoreLoading(false);
    }
  };

  const handlePurchase = async () => {
    try {
      setLoading(true);
      await AsyncStorage.setItem('selected_subscription_plan', selectedPlan);
      router.replace('/auth?mode=signup');
    } catch (error) {
      toast.error('Failed to continue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueFree = async () => {
    try {
      setLoading(true);
      await AsyncStorage.setItem('selected_subscription_plan', 'free');
      router.replace('/auth?mode=signup');
    } catch (error) {
      toast.error('Failed to continue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        toast.error('Unable to open link');
      }
    } catch (error) {
      console.error('Error opening link:', error);
      toast.error('Unable to open link');
    }
  };

  const yearlyProduct = products.find((p) => p.productId.includes('yearly'));
  const monthlyProduct = products.find((p) => p.productId.includes('monthly'));

  const yearlyPrice = yearlyProduct?.localizedPrice || '$39.99';
  const monthlyPrice = monthlyProduct?.localizedPrice || '$4.99';
  const yearlyMonthlyPrice = yearlyProduct
    ? (parseFloat(yearlyProduct.price) / 12).toFixed(2)
    : '3.33';

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full border border-slate-200"
        >
          <Ionicons name="chevron-back" size={20} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleRestore}
          disabled={restoreLoading || subscriptionLoading}
          className="px-3 py-2"
        >
          <Text
            className={`text-lg font-medium ${restoreLoading ? 'text-slate-400' : 'text-slate-700'}`}
          >
            {restoreLoading ? 'Restoring...' : 'Restore'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Development Debug Section */}
      {__DEV__ && (
        <View className="px-6 py-4 bg-yellow-50 border-y border-yellow-200">
          <Text className="text-sm font-bold text-yellow-800 mb-2">🛠️ Development Mode</Text>
          <Text className="text-xs text-yellow-700 mb-3">
            IAP Status: {subscriptionLoading ? 'Loading...' : 'Ready'} | Products: {products.length}
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={handleRestore}
              className="flex-1 bg-yellow-200 px-3 py-2 rounded"
              disabled={restoreLoading}
            >
              <Text className="text-yellow-800 text-xs font-medium text-center">
                {restoreLoading ? 'Testing...' : 'Test Restore'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => console.log('Products:', products)}
              className="flex-1 bg-yellow-200 px-3 py-2 rounded"
            >
              <Text className="text-yellow-800 text-xs font-medium text-center">Log Products</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Main Content - Using full height */}
      <View className="flex-1 justify-between px-6">
        {/* Top Section */}
        <View>
          {/* Main Header */}
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-black text-center leading-tight">
              Finally, hair care that gets it
            </Text>
            <Text className="text-slate-600 text-center mt-3 text-lg">
              Join the community that understands your hair
            </Text>
          </View>

          <View className="mb-8">
            {features.map((feature, index) => (
              <View key={index} className="flex-row items-center mb-5">
                <View className="w-8 h-8 border border-black items-center justify-center mr-4">
                  <Ionicons name={feature.icon} size={18} color="#000" />
                </View>
                <Text className="text-lg font-medium text-black flex-1">{feature.title}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-xl font-bold text-black mb-6 text-center">Choose Your Plan</Text>

          <View className="flex-row gap-4 items-center justify-center">
            <TouchableOpacity
              className={`flex-1 p-4 border rounded-xl relative ${
                selectedPlan === 'yearly' ? 'border-black' : 'border-slate-300'
              }`}
              onPress={() => setSelectedPlan('yearly')}
            >
              <View className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <View className="bg-black px-3 py-1 rounded-full">
                  <Text className="text-white text-xs font-bold">SAVE 40%</Text>
                </View>
              </View>
              <View className="items-center">
                <Text className="text-lg font-bold text-center text-black">Annual Plan</Text>
                <Text className="text-base font-bold text-center text-black">
                  ${yearlyMonthlyPrice}/month
                </Text>
                <Text className="text-sm text-center text-slate-500">
                  Billed yearly ({yearlyPrice})
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 p-4 border rounded-xl ${
                selectedPlan === 'monthly' ? 'border-black' : 'border-slate-300'
              }`}
              onPress={() => setSelectedPlan('monthly')}
            >
              <View className="items-center">
                <Text className="text-lg font-bold text-center text-black">Monthly Plan</Text>
                <Text className="text-base font-bold text-center text-black">
                  {monthlyPrice}/month
                </Text>
                <Text className="text-sm text-center text-slate-500">Billed monthly</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View className="items-center mt-4">
            <Text className="text-base text-slate-600 font-medium">
              ✓ Cancel anytime • No commitments
            </Text>
          </View>
        </View>

        {/* Bottom Section - Buttons and Terms */}
        <View className="pb-6">
          <Button
            variant="primary"
            label="Start 14-Day Free Trial"
            onPress={handlePurchase}
            disabled={loading || subscriptionLoading}
            loading={loading || subscriptionLoading}
            className="mb-3"
          />

          <Button
            variant="secondary"
            label="Continue with Limited Access"
            onPress={handleContinueFree}
            disabled={loading || subscriptionLoading}
            loading={loading || subscriptionLoading}
            className="mb-4"
          />

          <View className="items-center mb-4">
            <Text className="text-slate-500 text-sm text-center">
              Free includes 5 scans, basic tracking & community viewing
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
