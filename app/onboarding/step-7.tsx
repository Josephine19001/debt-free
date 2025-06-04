import { View } from 'react-native';
import { OnboardingLayout } from '@/components/layouts';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { SelectableCard } from '@/components/ui';
import { useState } from 'react';
import { useOnboarding } from '@/context/onboarding-provider';

const ANSWERS = ['Daily', 'Weekly', 'Monthly', 'When I remember', 'Only before protective styles'];

export default function Step7Screen() {
  const { data, updateData } = useOnboarding();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(
    data.hairCareFrequencyResponse || null
  );

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    updateData({ hairCareFrequencyResponse: answer });
  };

  const handleContinue = () => {
    router.push('/onboarding/step-8');
  };

  return (
    <OnboardingLayout
      onNext={handleContinue}
      currentStep={8}
      totalSteps={16}
      nextButtonLabel="Continue"
      allowContinue={!!selectedAnswer}
    >
      <View className="flex-1">
        <Text className="text-2xl font-bold mb-6">How Often Do You Care for Your Hair?</Text>

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
