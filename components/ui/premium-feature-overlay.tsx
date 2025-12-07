import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Lock, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useColors } from '@/lib/hooks/use-colors';
import { useTheme } from '@/context/theme-provider';
import * as Haptics from 'expo-haptics';

interface PremiumFeatureOverlayProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function PremiumFeatureOverlay({
  children,
  title = 'Premium Feature',
  description = 'Unlock powerful tools to accelerate your debt-free journey',
}: PremiumFeatureOverlayProps) {
  const colors = useColors();
  const { isDark } = useTheme();
  const router = useRouter();

  const handleUnlock = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/paywall');
  };

  return (
    <View className="relative">
      {/* Blurred content */}
      <View pointerEvents="none">
        {children}
      </View>

      {/* Blur overlay */}
      <View style={StyleSheet.absoluteFill} className="rounded-2xl overflow-hidden">
        <BlurView
          intensity={isDark ? 25 : 20}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)',
          }}
        />
      </View>

      {/* Upgrade prompt overlay */}
      <View style={StyleSheet.absoluteFill} className="items-center justify-center px-8">
        <Pressable
          onPress={handleUnlock}
          className="items-center"
          style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
        >
          {/* Lock icon with glow effect */}
          <View
            className="w-16 h-16 rounded-full items-center justify-center mb-4"
            style={{
              backgroundColor: isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.15)',
              borderWidth: 2,
              borderColor: 'rgba(251, 191, 36, 0.4)',
            }}
          >
            <Lock size={28} color="#FBBF24" />
          </View>

          {/* Title with premium badge */}
          <View className="flex-row items-center mb-2">
            <Sparkles size={16} color="#FBBF24" />
            <Text
              style={{ color: colors.text }}
              className="font-bold text-lg ml-2"
            >
              {title}
            </Text>
          </View>

          {/* Description */}
          <Text
            style={{ color: colors.textSecondary }}
            className="text-center text-sm mb-4"
          >
            {description}
          </Text>

          {/* Unlock button */}
          <View
            className="px-6 py-3 rounded-full flex-row items-center"
            style={{
              backgroundColor: '#FBBF24',
            }}
          >
            <Lock size={16} color="#1F2937" />
            <Text className="text-gray-800 font-semibold ml-2">
              Unlock Premium
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
