import { View } from 'react-native';
import { OnboardingLayout } from '@/components/layouts';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Text } from '@/components/ui/text';
import Animated, { FadeIn } from 'react-native-reanimated';
import { CheckCircle2 } from 'lucide-react-native';
import Svg, { Circle, LinearGradient, Stop } from 'react-native-svg';
import { useOnboarding } from '@/context/onboarding-provider';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETUP_STEPS = [
  'Reviewing your hair history...',
  'Analyzing ingredient awareness...',
  'Understanding care consistency...',
  'Mapping your moisture needs...',
  'Creating your personalized journey...',
];

export default function Step11Screen() {
  const { data } = useOnboarding();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [allowContinue, setAllowContinue] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) {
          clearInterval(interval);
          setAllowContinue(true);
          return 1;
        }
        return +(prev + 0.2).toFixed(1);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const stepIndex = Math.min(Math.floor(progress * SETUP_STEPS.length), SETUP_STEPS.length - 1);
    setCurrentStep(stepIndex);
  }, [progress]);

  const handleContinue = async () => {
    try {
      await AsyncStorage.setItem('onboarding_data', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
    }
    router.push('/paywall');
  };

  return (
    <OnboardingLayout
      currentStep={17}
      totalSteps={17}
      showHeader={false}
      allowContinue={allowContinue}
      onNext={handleContinue}
    >
      <View className="flex-1 justify-center items-center px-4">
        <View className="relative items-center justify-center mb-4">
          <Svg width={150} height={150}>
            <Circle cx={75} cy={75} r={60} stroke="#e5e7eb" strokeWidth={10} fill="none" />
            <LinearGradient id="grad" x1="0" y1="0" x2="100%" y2="0">
              <Stop offset="0" stopColor="#FF6B6B" stopOpacity={progress} />
              <Stop offset="1" stopColor="#4ECDC4" stopOpacity={progress} />
            </LinearGradient>
            <Circle
              cx={75}
              cy={75}
              r={60}
              stroke="url(#grad)"
              strokeWidth={10}
              fill="none"
              strokeDasharray={`${2 * Math.PI * 60}`}
              strokeDashoffset={2 * Math.PI * 60 * (1 - progress)}
              strokeLinecap="round"
              transform="rotate(-90 75 75)"
            />
          </Svg>
          <Text className="text-3xl font-bold absolute">
            {Math.min(Math.round(progress * 100), 100)}%
          </Text>
        </View>

        <Text className="text-2xl font-semibold mb-12">We're setting everything up...</Text>

        <View className="mt-2 w-full">
          {SETUP_STEPS.map((step, index) => (
            <Animated.View
              key={step}
              entering={FadeIn.delay(index * 1000)}
              className="flex-row items-center mb-4"
            >
              {index <= currentStep && <CheckCircle2 size={24} className="text-green-500 mr-3" />}
              <Text
                className={`text-lg ml-3 ${index <= currentStep ? 'text-black' : 'text-gray-400'}`}
              >
                {step}
              </Text>
            </Animated.View>
          ))}
        </View>
      </View>
    </OnboardingLayout>
  );
}
