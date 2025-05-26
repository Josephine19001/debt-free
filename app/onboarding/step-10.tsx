import { View } from 'react-native';
import { OnboardingLayout } from '@/components/layouts';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { SelectableCard } from '@/components/ui';
import { useState } from 'react';

const ANSWERS = [
  'TikTok',
  'Instagram',
  'YouTube',
  'Facebook',
  'Twitter',
  'Reddit',
  'Search (Apple, Google, etc.)',
  'Other',
];

export default function Step11Screen() {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleContinue = () => {
    router.push('/onboarding/step-11');
  };

  return (
    <OnboardingLayout
      onNext={handleContinue}
      currentStep={10}
      totalSteps={11}
      nextButtonLabel="Continue"
      allowContinue={!!selectedAnswer}
    >
      <View className="flex-1">
        <Text className="text-2xl font-bold mb-6">How did you hear about HairDeets AI?</Text>

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
