import { View } from 'react-native';
import { OnboardingLayout } from '@/components/layouts';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { SelectableCard } from '@/components/ui';
import { useState } from 'react';
import { useOnboarding } from '@/context/onboarding-provider';

const SKINCARE_SENSITIVITY = [
  'Yes, I have sensitive skin',
  'Sometimes, with certain products',
  'No, I can use most products',
  "I'm not sure",
];

export default function Step9Screen() {
  const { data, updateData } = useOnboarding();
  const [selectedSensitivity, setSelectedSensitivity] = useState<string | null>(
    data.skinSensitivityResponse || null
  );

  const handleSensitivitySelect = (answer: string) => {
    setSelectedSensitivity(answer);
    updateData({ skinSensitivityResponse: answer });
  };

  const handleContinue = () => {
    router.push('/onboarding/step-10a');
  };

  const canContinue = !!selectedSensitivity;

  return (
    <OnboardingLayout
      onNext={handleContinue}
      currentStep={10}
      totalSteps={16}
      nextButtonLabel="Continue"
      allowContinue={canContinue}
    >
      <View className="flex-1">
        <Text className="text-2xl font-bold mb-6">Do you have sensitive skin?</Text>

        <Text className="text-base text-gray-600 mb-6">
          This helps us recommend gentler products that won't irritate your skin.
        </Text>

        <View className="flex flex-col gap-3 w-full">
          {SKINCARE_SENSITIVITY.map((item) => (
            <SelectableCard
              key={item}
              label={item}
              onPress={() => handleSensitivitySelect(item)}
              selected={selectedSensitivity === item}
            />
          ))}
        </View>
      </View>
    </OnboardingLayout>
  );
}
