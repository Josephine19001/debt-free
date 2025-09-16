// components/CircularProgress.tsx
import React, { useEffect, useMemo, useRef } from 'react';
import { View, AccessibilityInfo, Platform, Animated } from 'react-native';
import { Text } from '@/components/ui/text';
import Svg, { Circle } from 'react-native-svg';

type CircularProgressProps = {
  /** current value */
  consumed: number;
  /** goal value (0 => shows 0%) */
  target: number;

  /** visual config */
  size?: number;              // overall square size
  strokeWidth?: number;       // ring thickness
  color?: string;             // progress color
  trackColor?: string;        // background ring color
  isDark?: boolean;           // if no trackColor provided, picks nice dark/light default

  /** behavior */
  animated?: boolean;         // animate changes
  durationMs?: number;        // animation duration
  cap?: 'round' | 'butt';     // strokeLinecap
  showOverflow?: boolean;     // render a thin spinning overflow ring for >100%
  overflowStrokeWidth?: number;

  /** center content */
  showCenterText?: boolean;   // render % text in center
  formatLabel?: (pct: number, consumed: number, target: number) => string;
  children?: React.ReactNode; // custom center content overrides text

  /** accessibility */
  accessibilityLabel?: string;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function CircularProgress({
  consumed,
  target,
  size = 76,
  strokeWidth = 6,
  color = '#7C3AED', // violet-600
  trackColor,
  isDark = false,

  animated = true,
  durationMs = 500,
  cap = 'round',
  showOverflow = true,
  overflowStrokeWidth = 3,

  showCenterText = true,
  formatLabel,
  children,

  accessibilityLabel = 'Progress',
}: CircularProgressProps) {
  const pct = target > 0 ? Math.max(0, consumed / target) : 0;
  const clamped = Math.min(pct, 1); // 0..1 for the main arc
  const overflowPct = Math.max(0, pct - 1); // portion beyond 100%

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const track = useMemo(
    () => trackColor ?? (isDark ? 'rgba(75,85,99,0.32)' : '#E5E7EB'),
    [trackColor, isDark]
  );

  // Animated value 0..1
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) {
      anim.setValue(clamped);
      return;
    }
    Animated.timing(anim, {
      toValue: clamped,
      duration: durationMs,
      useNativeDriver: false, // Fix: SVG animations need useNativeDriver: false
    }).start();
  }, [clamped, animated, durationMs, anim]);

  // dash offset [full -> 0]
  const strokeDashoffset = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  // Optional overflow spin (thin ring that keeps rotating if >100%)
  const overflowRotate = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (showOverflow && overflowPct > 0) {
      const loop = Animated.loop(
        Animated.timing(overflowRotate, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        })
      );
      loop.start();
      return () => loop.stop();
    } else {
      overflowRotate.stopAnimation(() => {
        overflowRotate.setValue(0);
      });
    }
  }, [showOverflow, overflowPct, overflowRotate]);

  const rotateStyle = {
    transform: [
      {
        rotate: overflowRotate.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  };

  // Derived label
  const percentForLabel = Math.round(pct * 100);
  const label =
    formatLabel?.(percentForLabel, consumed, target) ??
    `${percentForLabel}%`;

  // A11y - fix: add dependency array for useEffect
  useEffect(() => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      AccessibilityInfo.announceForAccessibility?.(
        `${accessibilityLabel}: ${percentForLabel}%`
      );
    }
  }, [percentForLabel, accessibilityLabel]);

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ now: Math.min(percentForLabel, 100), min: 0, max: 100 }}
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={track}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Main progress */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap={cap}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          // start at 12 o'clock
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Overflow spinner (only if >100%) */}
      {showOverflow && overflowPct > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              width: size,
              height: size,
              alignItems: 'center',
              justifyContent: 'center',
            },
            rotateStyle,
          ]}
        >
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={(size - overflowStrokeWidth) / 2}
              stroke={color}
              strokeWidth={overflowStrokeWidth}
              strokeLinecap="round"
              fill="none"
              // little arc segment (dash is small, big gap)
              strokeDasharray={`${Math.max(10, circumference * 0.08)} ${circumference}`}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              opacity={0.8}
            />
          </Svg>
        </Animated.View>
      )}

      {/* Center content */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children ?? (showCenterText && (
          <Text
            style={{
              fontWeight: '700',
              fontSize: Math.max(12, Math.floor(size * 0.22)),
              color: isDark ? '#F9FAFB' : '#111827',
            }}
          >
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}