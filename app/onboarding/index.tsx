import { useState, useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { ScanLine, Shield, Heart, Sparkles, Eye, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  FadeIn,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const steps = ['Welcome', 'Discover', 'Analyze'];

// Icon backgrounds for each step
const stepBackgrounds = [
  {
    gradientColors: ['#1a1a2e', '#16213e', '#0f3460'],
    primaryIcon: ScanLine,
    primaryColor: '#8B5CF6',
    secondaryIcons: [
      { icon: Sparkles, color: '#FFD700', size: 30 },
      { icon: Heart, color: '#FF69B4', size: 25 },
      { icon: Shield, color: '#10B981', size: 28 },
    ],
  },
  {
    gradientColors: ['#2d1b69', '#11998e', '#38ef7d'],
    primaryIcon: Eye,
    primaryColor: '#10B981',
    secondaryIcons: [
      { icon: ScanLine, color: '#8B5CF6', size: 35 },
      { icon: Sparkles, color: '#FFA500', size: 28 },
      { icon: Heart, color: '#FF69B4', size: 30 },
    ],
  },
  {
    gradientColors: ['#667eea', '#764ba2', '#f093fb'],
    primaryIcon: CheckCircle,
    primaryColor: '#FF69B4',
    secondaryIcons: [
      { icon: Shield, color: '#10B981', size: 32 },
      { icon: Eye, color: '#8B5CF6', size: 28 },
      { icon: Sparkles, color: '#FFD700', size: 26 },
    ],
  },
];

function StepIndicator({ step }: { step: number }) {
  return (
    <View className="flex-row justify-center absolute top-16 left-0 right-0 z-10">
      {steps.map((_, i) => (
        <Animated.View
          key={i}
          className={`h-2 mx-1 rounded-full ${i === step ? 'w-6 bg-pink-500' : 'w-2 bg-white/40'}`}
          entering={FadeIn.delay(i * 200)}
        />
      ))}
    </View>
  );
}

// Animated icon background for each step
function AnimatedIconBackground({
  stepIndex,
  isActive,
  children,
}: {
  stepIndex: number;
  isActive: boolean;
  children: React.ReactNode;
}) {
  const opacity = useSharedValue(0);
  const iconScale = useSharedValue(1);
  const iconRotation = useSharedValue(0);
  const floatingY = useSharedValue(0);

  const stepConfig = stepBackgrounds[stepIndex];
  const PrimaryIcon = stepConfig.primaryIcon;

  useEffect(() => {
    if (isActive) {
      opacity.value = withTiming(1, { duration: 500 });

      // Primary icon animations
      iconScale.value = withRepeat(
        withSequence(withTiming(1.2, { duration: 2000 }), withTiming(1, { duration: 2000 })),
        -1,
        true
      );

      iconRotation.value = withRepeat(withTiming(360, { duration: 8000 }), -1, false);

      // Floating animation for secondary icons
      floatingY.value = withRepeat(
        withSequence(withTiming(-20, { duration: 2000 }), withTiming(20, { duration: 2000 })),
        -1,
        true
      );
    } else {
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const primaryIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }, { rotate: `${iconRotation.value}deg` }],
  }));

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatingY.value }],
  }));

  return (
    <Animated.View
      style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, animatedStyle]}
    >
      <LinearGradient
        colors={stepConfig.gradientColors as [string, string, ...string[]]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        }}
      />

      {/* Primary central icon */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: height * 0.25,
            left: width / 2 - 50,
            width: 100,
            height: 100,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 50,
          },
          primaryIconStyle,
        ]}
      >
        <PrimaryIcon size={60} color={stepConfig.primaryColor} />
      </Animated.View>

      {/* Secondary floating icons */}
      {stepConfig.secondaryIcons.map((iconConfig, index) => {
        const IconComponent = iconConfig.icon;
        const positions = [
          { top: 120, left: 50 },
          { top: 180, right: 60 },
          { bottom: 250, left: 40 },
        ];
        const position = positions[index] || positions[0];

        return (
          <Animated.View
            key={index}
            style={[
              {
                position: 'absolute',
                ...position,
              },
              floatingStyle,
            ]}
          >
            <IconComponent size={iconConfig.size} color={iconConfig.color} />
          </Animated.View>
        );
      })}

      {children}
    </Animated.View>
  );
}

function NavigationButtons({
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
  nextLabel = 'Next',
}: {
  onNext: () => void;
  onBack?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  nextLabel?: string;
}) {
  return (
    <Animated.View
      className="flex-row justify-between items-center px-8 py-6 pb-8"
      entering={FadeIn.delay(600)}
    >
      <Animated.View entering={FadeIn.delay(700)}>
        <Button
          title="Back"
          onPress={onBack}
          variant="secondary"
          size="medium"
          className="flex-row items-center"
        />
      </Animated.View>

      <Animated.View entering={FadeIn.delay(800)}>
        <Button
          title={nextLabel}
          onPress={onNext}
          variant="primary"
          size="medium"
          className="flex-row items-center"
        />
      </Animated.View>
    </Animated.View>
  );
}

// Optimized step container with smooth content transitions
function StepContainer({
  title,
  subtitle,
  isActive,
  children,
}: {
  title: string;
  subtitle: string;
  isActive: boolean;
  children: React.ReactNode;
}) {
  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      opacity.value = withTiming(1, { duration: 600 });
      translateY.value = withTiming(0, { duration: 600 });
    } else {
      opacity.value = withTiming(0, { duration: 300 });
      translateY.value = withTiming(50, { duration: 300 });
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!isActive) return null;

  return (
    <View className="flex-1 justify-end">
      <Animated.View className="bg-black rounded-t-[32px] pt-8" style={animatedStyle}>
        <View className="px-8">
          <Animated.Text
            className="text-3xl font-bold text-white text-left mb-4 leading-tight"
            entering={FadeIn.delay(400)}
          >
            {title}
          </Animated.Text>
          <Animated.Text
            className="text-lg text-white/90 text-left mb-6 leading-relaxed"
            entering={FadeIn.delay(500)}
          >
            {subtitle}
          </Animated.Text>
        </View>
        {children}
      </Animated.View>
    </View>
  );
}

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  const goNext = () => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setTimeout(() => {
      if (step < steps.length - 1) {
        setStep((s) => s + 1);
      } else {
        // Navigate to paywall after onboarding completion
        router.replace('/');
      }
      setIsTransitioning(false);
    }, 200); // Small delay for smooth transition
  };

  const goBack = () => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setTimeout(() => {
      if (step === 0) {
        // Go back to welcome screen on first onboarding step
        router.replace('/');
      } else {
        setStep((s) => s - 1);
      }
      setIsTransitioning(false);
    }, 200);
  };

  const stepData = [
    {
      title: "What's Really in Your Products?",
      subtitle: 'Toxic ingredients hide in your favorite beauty products.',
      nextLabel: 'Find Out',
    },
    {
      title: 'Knowledge is Power',
      subtitle: 'Scan any product. Know every ingredient. Stay safe.',
      nextLabel: 'Get Protected',
    },
    {
      title: 'Beauty Made Simple',
      subtitle: 'Build a collection you trust.',
      nextLabel: 'Start Scanning',
    },
  ];

  return (
    <View className="flex-1 bg-black">
      <StepIndicator step={step} />

      {/* Render all backgrounds but only show the active one */}
      {stepBackgrounds.map((_, index) => (
        <AnimatedIconBackground key={index} stepIndex={index} isActive={index === step}>
          <StepContainer
            title={stepData[index].title}
            subtitle={stepData[index].subtitle}
            isActive={index === step}
          >
            <NavigationButtons
              onNext={goNext}
              onBack={goBack}
              isFirstStep={index === 0}
              isLastStep={index === steps.length - 1}
              nextLabel={stepData[index].nextLabel}
            />
          </StepContainer>
        </AnimatedIconBackground>
      ))}
    </View>
  );
}
