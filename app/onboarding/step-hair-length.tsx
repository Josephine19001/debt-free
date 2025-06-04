import { View } from 'react-native';
import { OnboardingLayout } from '@/components/layouts';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { SelectableCard } from '@/components/ui';
import { useState } from 'react';
import { useOnboarding } from '@/context/onboarding-provider';

type HairLengthOption = 'short' | 'medium' | 'long' | 'very_long';

const LENGTH_OPTIONS: { value: HairLengthOption; label: string; description: string }[] = [
  { value: 'short', label: 'Short', description: 'Above shoulders' },
  { value: 'medium', label: 'Medium', description: 'Shoulder to mid-back' },
  { value: 'long', label: 'Long', description: 'Mid-back to waist' },
  { value: 'very_long', label: 'Very Long', description: 'Below waist' },
];

export default function HairLengthScreen() {
  const { data, updateData } = useOnboarding();
  const [length, setLength] = useState<HairLengthOption | null>(data.hairLength || null);

  const handleLengthSelect = (value: HairLengthOption) => {
    setLength(value);
    updateData({ hairLength: value });
  };

  const handleContinue = () => {
    router.push('/onboarding/step-concerns');
  };

  const canContinue = !!length;

  return (
    <OnboardingLayout
      onNext={handleContinue}
      currentStep={15}
      totalSteps={16}
      nextButtonLabel="Continue"
      allowContinue={canContinue}
    >
      <View className="flex-1">
        <Text className="text-2xl font-bold mb-6">What's your current hair length?</Text>

        <Text className="text-base text-gray-600 mb-6">
          Hair length affects product application and styling recommendations.
        </Text>

        <View className="flex flex-col gap-3">
          {LENGTH_OPTIONS.map((option) => (
            <SelectableCard
              key={option.value}
              label={option.label}
              description={option.description}
              onPress={() => handleLengthSelect(option.value)}
              selected={length === option.value}
            />
          ))}
        </View>
      </View>
    </OnboardingLayout>
  );
}
