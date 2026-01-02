import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Linking, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Bot, MessageCircle, Sparkles, Check, TrendingDown, Percent } from 'lucide-react-native';
import { useRevenueCat } from '@/context/revenuecat-provider';
import { useColors } from '@/lib/hooks/use-colors';
import { useTheme } from '@/context/theme-provider';
import { APP_URLS } from '@/lib/config/urls';
import { toast } from 'sonner-native';

const TRIAL_DAYS = 7;

type PlanType = 'weekly' | 'yearly';

const features = [
  {
    icon: Bot,
    title: 'AI Debt Advisor',
    description: 'Get personalized advice for your situation',
  },
  {
    icon: TrendingDown,
    title: 'Extra Payment Calculator',
    description: 'See how extra payments save you money',
  },
  {
    icon: Percent,
    title: 'Refinance Simulator',
    description: 'Find out how much lower rates could save',
  },
  {
    icon: Sparkles,
    title: 'Smart Recommendations',
    description: 'AI-powered insights to pay off debt faster',
  },
];

export default function PaywallScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const { offerings, purchasePackage, restorePurchases } = useRevenueCat();
  const colors = useColors();
  const { isDark } = useTheme();

  // Get packages from RevenueCat offerings
  const weeklyPackage = offerings?.current?.weekly;
  const yearlyPackage = offerings?.current?.annual;

  // Use RevenueCat formatted price strings (includes currency symbol)
  const weeklyPriceString = weeklyPackage?.product.priceString;
  const yearlyPriceString = yearlyPackage?.product.priceString;
  const yearlyPerMonthString = yearlyPackage?.product.pricePerMonthString;

  // Numeric prices for calculations
  const weeklyPrice = weeklyPackage?.product.price ?? 0;
  const yearlyPrice = yearlyPackage?.product.price ?? 0;

  // Calculate savings: weekly * 52 weeks vs yearly
  const weeklyAnnualCost = weeklyPrice * 52;
  const savingsPercent = weeklyAnnualCost > 0 ? Math.round((1 - yearlyPrice / weeklyAnnualCost) * 100) : 0;

  const handleStartTrial = async () => {
    const packageToPurchase = selectedPlan === 'yearly' ? yearlyPackage : weeklyPackage;

    if (!packageToPurchase) {
      // Fallback if RevenueCat not loaded
      router.replace('/(tabs)/home');
      return;
    }

    setIsLoading(true);
    const result = await purchasePackage(packageToPurchase);
    setIsLoading(false);

    if (result.success) {
      router.replace('/(tabs)/home');
    }
  };

  const handleRestorePurchases = async () => {
    setIsLoading(true);
    try {
      const customerInfo = await restorePurchases();
      const hasActiveSubscription = Object.keys(customerInfo.entitlements.active).length > 0;
      if (hasActiveSubscription) {
        toast.success('Purchases restored successfully');
        router.replace('/(tabs)/home');
      } else {
        toast.info('No previous purchases found');
      }
    } catch {
      toast.error('Failed to restore purchases');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 pt-4">
            {/* Header */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 rounded-3xl bg-emerald-500/20 items-center justify-center mb-4">
                <Bot size={40} color="#10B981" />
              </View>
              <Text className="text-2xl font-bold text-center mb-2" style={{ color: colors.text }}>
                Unlock AI Advisor
              </Text>
              <Text className="text-center" style={{ color: colors.textSecondary }}>
                Your personal debt-free coach
              </Text>
            </View>

            {/* Features */}
            <View className="rounded-2xl overflow-hidden mb-6">
              <LinearGradient
                colors={isDark ? ['#1a1a1f', '#141418'] : ['#F8FAFC', '#F1F5F9']}
                style={StyleSheet.absoluteFill}
              />
              <View
                className="absolute inset-0 rounded-2xl"
                style={{
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                }}
              />
              <View className="p-5">
                {features.map((feature, index) => (
                  <View
                    key={feature.title}
                    className={`flex-row items-center ${
                      index < features.length - 1 ? 'pb-4 mb-4' : ''
                    }`}
                    style={
                      index < features.length - 1
                        ? {
                            borderBottomWidth: 1,
                            borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                          }
                        : {}
                    }
                  >
                    <View className="w-12 h-12 rounded-xl bg-emerald-500/15 items-center justify-center mr-4">
                      <feature.icon size={24} color="#10B981" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-base" style={{ color: colors.text }}>
                        {feature.title}
                      </Text>
                      <Text className="text-sm" style={{ color: colors.textMuted }}>
                        {feature.description}
                      </Text>
                    </View>
                    <Check size={20} color="#10B981" />
                  </View>
                ))}
              </View>
            </View>

            {/* Plan Selection - Row Layout */}
            <View className="flex-row mb-6">
              {/* Yearly Plan */}
              <Pressable onPress={() => setSelectedPlan('yearly')} className="flex-1 mr-2">
                <View className="rounded-2xl overflow-hidden">
                  <LinearGradient
                    colors={
                      selectedPlan === 'yearly'
                        ? isDark
                          ? ['#0f1f1a', '#0a1512']
                          : ['#ecfdf5', '#d1fae5']
                        : isDark
                        ? ['#1a1a1f', '#141418']
                        : ['#F8FAFC', '#F1F5F9']
                    }
                    style={StyleSheet.absoluteFill}
                  />
                  <View
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      borderWidth: 2,
                      borderColor:
                        selectedPlan === 'yearly'
                          ? '#10B981'
                          : isDark
                          ? 'rgba(255,255,255,0.1)'
                          : 'rgba(0,0,0,0.1)',
                    }}
                  />
                  {/* Save Badge */}
                  <View className="absolute top-0 right-0 bg-emerald-500 px-2 py-1 rounded-bl-xl rounded-tr-xl">
                    <Text className="text-white text-xs font-bold">-{savingsPercent}%</Text>
                  </View>
                  <View className="p-4 items-center">
                    <View
                      className={`w-5 h-5 rounded-full border-2 mb-3 items-center justify-center ${
                        selectedPlan === 'yearly'
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-gray-500'
                      }`}
                    >
                      {selectedPlan === 'yearly' && <Check size={12} color="#fff" />}
                    </View>
                    <Text className="font-bold text-lg mb-1" style={{ color: colors.text }}>
                      Yearly
                    </Text>
                    <Text className="font-bold text-2xl" style={{ color: colors.text }}>
                      {yearlyPriceString}
                    </Text>
                    <Text className="text-sm" style={{ color: colors.textMuted }}>
                      {yearlyPerMonthString}/mo
                    </Text>
                  </View>
                </View>
              </Pressable>

              {/* Weekly Plan */}
              <Pressable onPress={() => setSelectedPlan('weekly')} className="flex-1 ml-2">
                <View className="rounded-2xl overflow-hidden">
                  <LinearGradient
                    colors={
                      selectedPlan === 'weekly'
                        ? isDark
                          ? ['#0f1f1a', '#0a1512']
                          : ['#ecfdf5', '#d1fae5']
                        : isDark
                        ? ['#1a1a1f', '#141418']
                        : ['#F8FAFC', '#F1F5F9']
                    }
                    style={StyleSheet.absoluteFill}
                  />
                  <View
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      borderWidth: 2,
                      borderColor:
                        selectedPlan === 'weekly'
                          ? '#10B981'
                          : isDark
                          ? 'rgba(255,255,255,0.1)'
                          : 'rgba(0,0,0,0.1)',
                    }}
                  />
                  <View className="p-4 items-center">
                    <View
                      className={`w-5 h-5 rounded-full border-2 mb-3 items-center justify-center ${
                        selectedPlan === 'weekly'
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-gray-500'
                      }`}
                    >
                      {selectedPlan === 'weekly' && <Check size={12} color="#fff" />}
                    </View>
                    <Text className="font-bold text-lg mb-1" style={{ color: colors.text }}>
                      Weekly
                    </Text>
                    <Text className="font-bold text-2xl" style={{ color: colors.text }}>
                      {weeklyPriceString}
                    </Text>
                    <Text className="text-sm" style={{ color: colors.textMuted }}>
                      /week
                    </Text>
                  </View>
                </View>
              </Pressable>
            </View>

            {/* Trial Info - Only for Yearly */}
            {/* {selectedPlan === 'yearly' && (
              <View
                className="rounded-xl p-4 mb-6"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
              >
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-lg bg-amber-500/20 items-center justify-center mr-3">
                    <Text className="text-amber-400 font-bold">7</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium" style={{ color: colors.text }}>{TRIAL_DAYS}-Day Free Trial</Text>
                    <Text className="text-sm" style={{ color: colors.textMuted }}>Cancel anytime, no charge</Text>
                  </View>
                </View>
              </View>
            )} */}
          </View>
        </ScrollView>

        {/* Fixed Bottom Section */}
        <View className="px-6 pb-4">
          {/* CTA Button */}
          <Pressable
            onPress={handleStartTrial}
            disabled={isLoading}
            className={`rounded-2xl overflow-hidden mb-4 ${isLoading ? 'opacity-70' : ''}`}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <View className="py-4 px-6 items-center">
              <Text className="text-white font-bold text-lg">
                {isLoading
                  ? 'Processing...'
                  : selectedPlan === 'yearly'
                  ? 'Start 7-Day Free Trial'
                  : 'Subscribe Now'}
              </Text>
              {selectedPlan === 'yearly' ? (
                <Text className="text-emerald-200 text-sm mt-1">
                  Then {yearlyPriceString}/year
                </Text>
              ) : (
                <Text className="text-emerald-200 text-sm mt-1">{weeklyPriceString}/week</Text>
              )}
            </View>
          </Pressable>

          {/* Continue for Free */}
          <Pressable onPress={() => router.replace('/(tabs)/home')} className="mb-4">
            <Text
              className="text-center text-base font-medium"
              style={{ color: colors.textSecondary }}
            >
              Continue for Free
            </Text>
          </Pressable>

          {/* Secondary Actions */}
          <View className="items-center">
            <View className="flex-row items-center">
              <Pressable onPress={() => Linking.openURL(APP_URLS.terms)}>
                <Text className="text-xs underline" style={{ color: colors.textMuted }}>
                  Terms
                </Text>
              </Pressable>
              <Text className="mx-2" style={{ color: colors.textMuted }}>
                |
              </Text>
              <Pressable onPress={() => Linking.openURL(APP_URLS.privacy)}>
                <Text className="text-xs underline" style={{ color: colors.textMuted }}>
                  Privacy
                </Text>
              </Pressable>
              <Text className="mx-2" style={{ color: colors.textMuted }}>
                |
              </Text>
              <Pressable onPress={handleRestorePurchases} disabled={isLoading}>
                <Text className="text-xs underline" style={{ color: colors.textMuted }}>
                  Restore Purchases
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
