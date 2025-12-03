import { View, Text, Pressable, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ChevronRight } from 'lucide-react-native';
import LogoIcon from '@/assets/svg/logo-icon';
import { useColors } from '@/lib/hooks/use-colors';
import { useTheme } from '@/context/theme-provider';

export function WelcomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const { isDark } = useTheme();

  const handleGetStarted = () => {
    router.push('/onboarding');
  };

  const handleSignIn = () => {
    router.push('/auth?mode=signin');
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6">
          {/* Top Section with Logo/Brand */}
          <View className="flex-1 justify-center items-center">
            {/* App Icon */}
            <Animated.View
              entering={FadeIn.delay(200).duration(600)}
              className="mb-6"
            >
              <LogoIcon width={100} height={100} />
            </Animated.View>

            {/* App Name */}
            <Animated.Text
              entering={FadeInUp.delay(400).duration(600)}
              className="text-4xl font-bold text-center mb-3"
              style={{ color: colors.text }}
            >
              Debt Free
            </Animated.Text>

            {/* Tagline */}
            <Animated.Text
              entering={FadeInUp.delay(500).duration(600)}
              className="text-lg text-center px-4"
              style={{ color: colors.textSecondary }}
            >
              Your journey to financial freedom starts here
            </Animated.Text>
          </View>

          {/* Bottom Section with Actions */}
          <Animated.View
            entering={FadeInDown.delay(600).duration(600)}
            className="pb-8"
          >
            {/* Get Started Button */}
            <Pressable
              onPress={handleGetStarted}
              className="rounded-2xl overflow-hidden mb-4"
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <View className="py-4 px-6 flex-row items-center justify-center">
                <Text className="text-white font-bold text-lg mr-2">
                  Get Started
                </Text>
                <ChevronRight size={20} color="#ffffff" />
              </View>
            </Pressable>

            {/* Sign In Link */}
            <Pressable onPress={handleSignIn} className="py-3">
              <Text className="text-center" style={{ color: colors.textSecondary }}>
                Already have an account?{' '}
                <Text className="text-emerald-400 font-semibold">Sign In</Text>
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}
