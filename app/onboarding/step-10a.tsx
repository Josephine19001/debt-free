import { View } from 'react-native';
import { OnboardingLayout } from '@/components/layouts';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { SelectableCard } from '@/components/ui';
import { useState } from 'react';
import { useOnboarding } from '@/context/onboarding-provider';

const CHEMICAL_PROCESSING = ['Colored', 'Bleached', 'Permed', 'Relaxed', 'None of the above'];

export default function Step10aScreen() {
  const { data, updateData } = useOnboarding();
  const [selectedProcessing, setSelectedProcessing] = useState<string | null>(
    data.chemicalProcessingResponse || null
  );

  const handleProcessingSelect = (answer: string) => {
    setSelectedProcessing(answer);
    updateData({ chemicalProcessingResponse: answer });
  };

  const handleContinue = () => {
    router.push('/onboarding/step-10');
  };

  const canContinue = !!selectedProcessing;

  return (
    <OnboardingLayout
      onNext={handleContinue}
      currentStep={11}
      totalSteps={16}
      nextButtonLabel="Continue"
      allowContinue={canContinue}
    >
      <View className="flex-1">
        <Text className="text-2xl font-bold mb-6">Has your hair been chemically processed?</Text>

        <Text className="text-base text-gray-600 mb-6">
          Chemical processing affects how your hair responds to products and styling.
        </Text>

        <View className="flex flex-col gap-3 w-full">
          {CHEMICAL_PROCESSING.map((item) => (
            <SelectableCard
              key={item}
              label={item}
              onPress={() => handleProcessingSelect(item)}
              selected={selectedProcessing === item}
            />
          ))}
        </View>
      </View>
    </OnboardingLayout>
  );
}
