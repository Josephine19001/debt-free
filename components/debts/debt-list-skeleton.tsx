import { useRef, useEffect } from 'react';
import { View, Animated } from 'react-native';
import { GlassCard } from '@/components/layouts';

function SkeletonItem() {
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

  return (
    <GlassCard>
      <View className="flex-row items-center">
        {/* Rank */}
        <Animated.View
          style={{ opacity }}
          className="w-8 h-8 rounded-full bg-white/10 mr-3"
        />

        <View className="flex-1">
          {/* Name & Rate */}
          <View className="flex-row items-center justify-between mb-2">
            <Animated.View
              style={{ opacity }}
              className="h-5 w-32 rounded bg-white/10"
            />
            <Animated.View
              style={{ opacity }}
              className="h-5 w-16 rounded-full bg-white/10"
            />
          </View>

          {/* Category */}
          <Animated.View
            style={{ opacity }}
            className="h-3 w-20 rounded bg-white/10 mb-2"
          />

          {/* Balance */}
          <Animated.View
            style={{ opacity }}
            className="h-7 w-28 rounded bg-white/10 mb-2"
          />

          {/* Progress Bar */}
          <Animated.View
            style={{ opacity }}
            className="h-2 rounded-full bg-white/10 mb-1"
          />

          {/* Progress Labels */}
          <View className="flex-row justify-between">
            <Animated.View
              style={{ opacity }}
              className="h-3 w-16 rounded bg-white/10"
            />
            <Animated.View
              style={{ opacity }}
              className="h-3 w-20 rounded bg-white/10"
            />
          </View>
        </View>

        {/* Chevron */}
        <Animated.View
          style={{ opacity }}
          className="w-5 h-5 rounded bg-white/10 ml-3"
        />
      </View>
    </GlassCard>
  );
}

interface DebtListSkeletonProps {
  count?: number;
}

export function DebtListSkeleton({ count = 3 }: DebtListSkeletonProps) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonItem key={i} />
      ))}
    </View>
  );
}
