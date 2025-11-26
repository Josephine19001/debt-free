import { useRef, useEffect } from 'react';
import { View, Animated } from 'react-native';
import { GlassCard, SectionHeader } from '@/components/layouts';

function useSkeletonAnimation() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return opacity;
}

function SkeletonBox({ className }: { className: string }) {
  const opacity = useSkeletonAnimation();
  return <Animated.View style={{ opacity }} className={className} />;
}

export function DebtDetailSkeleton() {
  const opacity = useSkeletonAnimation();

  return (
    <View className="px-4">
      {/* Header Card */}
      <GlassCard>
        <View className="items-center">
          {/* Interest Rate Badge */}
          <Animated.View
            style={{ opacity }}
            className="h-8 w-28 rounded-full bg-white/10 mb-3"
          />

          {/* Balance */}
          <Animated.View
            style={{ opacity }}
            className="h-12 w-48 rounded bg-white/10 mb-2"
          />
          <Animated.View
            style={{ opacity }}
            className="h-4 w-32 rounded bg-white/10 mb-4"
          />

          {/* Category */}
          <Animated.View
            style={{ opacity }}
            className="h-6 w-24 rounded-full bg-white/10"
          />
        </View>

        {/* Progress Bar */}
        <View className="mt-6">
          <View className="flex-row justify-between mb-2">
            <Animated.View
              style={{ opacity }}
              className="h-4 w-16 rounded bg-white/10"
            />
            <Animated.View
              style={{ opacity }}
              className="h-4 w-12 rounded bg-white/10"
            />
          </View>
          <Animated.View
            style={{ opacity }}
            className="h-3 rounded-full bg-white/10"
          />
        </View>
      </GlassCard>

      {/* Section Header */}
      <View className="mt-4 mb-2 px-1">
        <Animated.View
          style={{ opacity }}
          className="h-5 w-28 rounded bg-white/10"
        />
      </View>

      {/* Chart Card */}
      <GlassCard>
        <Animated.View
          style={{ opacity }}
          className="h-5 w-36 rounded bg-white/10 mb-4"
        />
        <Animated.View
          style={{ opacity }}
          className="h-8 rounded-full bg-white/10 mb-4"
        />
        <View className="flex-row justify-between">
          <Animated.View
            style={{ opacity }}
            className="h-12 w-24 rounded bg-white/10"
          />
          <Animated.View
            style={{ opacity }}
            className="h-12 w-24 rounded bg-white/10"
          />
          <Animated.View
            style={{ opacity }}
            className="h-12 w-20 rounded bg-white/10"
          />
        </View>
      </GlassCard>

      {/* Key Metrics Card */}
      <GlassCard>
        <View className="flex-row flex-wrap">
          <View className="w-1/2 mb-4">
            <Animated.View
              style={{ opacity }}
              className="h-3 w-20 rounded bg-white/10 mb-2"
            />
            <Animated.View
              style={{ opacity }}
              className="h-6 w-24 rounded bg-white/10"
            />
          </View>
          <View className="w-1/2 mb-4">
            <Animated.View
              style={{ opacity }}
              className="h-3 w-16 rounded bg-white/10 mb-2"
            />
            <Animated.View
              style={{ opacity }}
              className="h-6 w-28 rounded bg-white/10"
            />
          </View>
          <View className="w-1/2 mb-4">
            <Animated.View
              style={{ opacity }}
              className="h-3 w-20 rounded bg-white/10 mb-2"
            />
            <Animated.View
              style={{ opacity }}
              className="h-6 w-20 rounded bg-white/10"
            />
          </View>
          <View className="w-1/2 mb-4">
            <Animated.View
              style={{ opacity }}
              className="h-3 w-24 rounded bg-white/10 mb-2"
            />
            <Animated.View
              style={{ opacity }}
              className="h-6 w-20 rounded bg-white/10"
            />
          </View>
          <View className="w-full">
            <Animated.View
              style={{ opacity }}
              className="h-3 w-20 rounded bg-white/10 mb-2"
            />
            <Animated.View
              style={{ opacity }}
              className="h-6 w-40 rounded bg-white/10"
            />
          </View>
        </View>
      </GlassCard>

      {/* Section Header */}
      <View className="mt-4 mb-2 px-1">
        <Animated.View
          style={{ opacity }}
          className="h-5 w-20 rounded bg-white/10"
        />
      </View>

      {/* Scenario Cards */}
      <GlassCard>
        <View className="flex-row items-center mb-4">
          <Animated.View
            style={{ opacity }}
            className="w-10 h-10 rounded-full bg-white/10 mr-3"
          />
          <View>
            <Animated.View
              style={{ opacity }}
              className="h-5 w-36 rounded bg-white/10 mb-1"
            />
            <Animated.View
              style={{ opacity }}
              className="h-3 w-48 rounded bg-white/10"
            />
          </View>
        </View>
        <Animated.View
          style={{ opacity }}
          className="h-8 rounded-full bg-white/10"
        />
      </GlassCard>

      <GlassCard>
        <View className="flex-row items-center mb-4">
          <Animated.View
            style={{ opacity }}
            className="w-10 h-10 rounded-full bg-white/10 mr-3"
          />
          <View>
            <Animated.View
              style={{ opacity }}
              className="h-5 w-32 rounded bg-white/10 mb-1"
            />
            <Animated.View
              style={{ opacity }}
              className="h-3 w-44 rounded bg-white/10"
            />
          </View>
        </View>
        <Animated.View
          style={{ opacity }}
          className="h-8 rounded-full bg-white/10"
        />
      </GlassCard>
    </View>
  );
}
