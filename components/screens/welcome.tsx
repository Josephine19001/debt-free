import { View, ActivityIndicator, Dimensions, Text as RNText } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Text } from '../ui/text';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-provider';
import { useRevenueCat } from '@/context/revenuecat-provider';
import { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { Sparkles, Heart, Shield, ScanLine } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  FadeIn,
  SlideInUp,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

function IconBackground({ children }: { children: React.ReactNode }) {
  const sparklesOpacity = useSharedValue(0.3);
  const heartScale = useSharedValue(1);
  const shieldRotation = useSharedValue(0);
  const scanLineY = useSharedValue(-20);

  useEffect(() => {
    // Animated sparkles
    sparklesOpacity.value = withRepeat(
      withSequence(withTiming(0.8, { duration: 2000 }), withTiming(0.3, { duration: 2000 })),
      -1,
      true
    );

    // Pulsing heart
    heartScale.value = withRepeat(
      withSequence(withTiming(1.2, { duration: 1500 }), withTiming(1, { duration: 1500 })),
      -1,
      true
    );

    // Rotating shield
    shieldRotation.value = withRepeat(withTiming(10, { duration: 3000 }), -1, true);

    // Moving scan line
    scanLineY.value = withRepeat(
      withSequence(withTiming(height * 0.3, { duration: 3000 }), withTiming(-20, { duration: 0 })),
      -1,
      false
    );
  }, []);

  const sparklesStyle = useAnimatedStyle(() => ({
    opacity: sparklesOpacity.value,
  }));

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const shieldStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${shieldRotation.value}deg` }],
  }));

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
  }));

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460'] as [string, string, ...string[]]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        }}
      />

      {/* Floating icons */}
      <Animated.View style={[{ position: 'absolute', top: 100, right: 50 }, sparklesStyle]}>
        <Sparkles size={40} color="#FFD700" />
      </Animated.View>

      <Animated.View style={[{ position: 'absolute', top: 200, left: 30 }, heartStyle]}>
        <Heart size={35} color="#FF69B4" />
      </Animated.View>

      <Animated.View style={[{ position: 'absolute', top: 150, right: 80 }, shieldStyle]}>
        <Shield size={30} color="#10B981" />
      </Animated.View>

      <Animated.View style={[{ position: 'absolute', top: 300, left: 60 }, scanLineStyle]}>
        <ScanLine size={45} color="#8B5CF6" />
      </Animated.View>

      <Animated.View style={[{ position: 'absolute', bottom: 200, right: 40 }, sparklesStyle]}>
        <Sparkles size={25} color="#FFA500" />
      </Animated.View>

      {children}
    </View>
  );
}

export function WelcomeScreen() {
  const { user, loading } = useAuth();
  const { offerings, loading: revenueCatLoading } = useRevenueCat();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/(tabs)/explore');
    }
  }, [user, loading]);

  console.log('offerings', offerings);

  const onYearlySubscription = useCallback(() => {
    router.replace('/auth?mode=signup&plan=yearly');
  }, []);

  const onMonthlySubscription = useCallback(() => {
    router.replace('/auth?mode=signup&plan=monthly');
  }, []);

  // Get packages from offerings state
  const yearlyPackage =
    offerings?.current?.availablePackages?.find(
      (pkg: PurchasesPackage) =>
        pkg.packageType === 'ANNUAL' ||
        pkg.identifier.includes('annual') ||
        pkg.identifier.includes('yearly') ||
        pkg.product.identifier.includes('yearly')
    ) || null;

  const monthlyPackage =
    offerings?.current?.availablePackages?.find(
      (pkg: PurchasesPackage) =>
        pkg.packageType === 'MONTHLY' ||
        pkg.identifier.includes('monthly') ||
        pkg.product.identifier.includes('monthly')
    ) || null;

  // Helper function to format price
  const formatPrice = (pkg: PurchasesPackage | null, isYearly: boolean = false) => {
    console.log('pkg', pkg);

    if (!pkg) return isYearly ? '$1.67/month' : '$2.99';

    const price = pkg.product.priceString;
    if (isYearly && pkg.product.price) {
      // Calculate monthly equivalent for yearly plan
      const yearlyPrice = pkg.product.price;
      const monthlyEquivalent = (yearlyPrice / 12).toFixed(2);
      return `$${monthlyEquivalent}/month`;
    }
    return price;
  };

  const onSignIn = useCallback(() => {
    router.push('/auth?mode=signin');
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#fff" />
        <Text className="mt-4 text-white">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (user) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#fff" />
        <Text className="mt-4 text-white">Redirecting...</Text>
      </SafeAreaView>
    );
  }

  return (
    <IconBackground>
      <SafeAreaView className="flex-1 justify-between">
        {/* Main headline positioned in the center */}
        <Animated.View
          className="flex-1 px-6 items-center justify-center"
          entering={FadeIn.delay(500).duration(1000)}
        >
          <Animated.Text
            className="text-5xl font-bold text-white text-center leading-tight"
            entering={SlideInUp.delay(800).duration(800)}
          >
            Don't Just Buy! Know For Sure!
          </Animated.Text>
        </Animated.View>

        {/* Bottom section with buttons */}
        <Animated.View className="px-6 pb-8" entering={SlideInUp.delay(1500).duration(800)}>
          {revenueCatLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator size="small" color="#fff" />
              <Text className="text-white/60 text-sm mt-2">Loading subscription options...</Text>
            </View>
          ) : (
            <>
              {/* Yearly Subscription */}
              <Animated.View entering={FadeIn.delay(1800).duration(600)}>
                <View className="relative">
                  <Button
                    title={`Yearly - ${formatPrice(yearlyPackage, true)}`}
                    onPress={onYearlySubscription}
                    variant="primary"
                    size="large"
                  />
                  <View className="absolute -top-2 -right-2 bg-green-500 px-2 py-1 rounded-full">
                    <Text className="text-white text-xs font-bold">Save 44% + 7 Days Free</Text>
                  </View>
                </View>
                <Text className="text-white/60 text-xs text-center mt-1 mb-3">
                  {yearlyPackage?.product.priceString}/year - Billed annually
                </Text>
              </Animated.View>

              {/* Monthly Subscription */}
              <Animated.View entering={FadeIn.delay(1900).duration(600)}>
                <View className="relative">
                  <Button
                    title={`Monthly - ${formatPrice(monthlyPackage)}`}
                    onPress={onMonthlySubscription}
                    variant="secondary"
                    size="large"
                  />
                  <View className="absolute -top-2 -right-2 bg-green-500 px-2 py-1 rounded-full">
                    <Text className="text-white text-xs font-bold">3 Days Free</Text>
                  </View>
                </View>
                <Text className="text-white/60 text-xs text-center mt-1 mb-4">Billed monthly</Text>
              </Animated.View>
            </>
          )}

          <Animated.View
            className="flex-row items-center justify-center"
            entering={FadeIn.delay(2000).duration(600)}
          >
            <Text className="text-white/80 text-sm">Already have an account? </Text>
            <Text onPress={onSignIn} className="text-pink-300 text-sm font-bold underline">
              Sign In
            </Text>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    </IconBackground>
  );
}
