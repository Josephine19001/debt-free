import { View } from 'react-native';
import { OnboardingLayout } from '@/components/layouts';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { SelectableCard } from '@/components/ui';
import { useState } from 'react';

const ANSWERS = [
  'Longer hair',
  'More volume',
  'Less frizz',
  'Less tangles',
  'Less breakage',
  'Less split ends',
  'Less dryness',
  'Learn more about my hair',
];

export default function Step8Screen() {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleContinue = () => {
    router.push('/onboarding/step-9');
  };

  return (
    <OnboardingLayout
      onNext={handleContinue}
      currentStep={8}
      totalSteps={11}
      nextButtonLabel="Continue"
      allowContinue={!!selectedAnswer}
    >
      <View className="flex-1">
        <Text className="text-2xl font-bold mb-6">What’s Your Hair Goal?</Text>

        <View className="space-y-4 mb-8 flex flex-col gap-4">
          {ANSWERS.map((item) => (
            <SelectableCard
              key={item}
              label={item}
              onPress={() => handleAnswerSelect(item)}
              selected={selectedAnswer === item}
            />
          ))}
        </View>
      </View>
    </OnboardingLayout>
  );
}
