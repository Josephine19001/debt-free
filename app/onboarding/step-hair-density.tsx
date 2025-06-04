import { View } from 'react-native';
import { OnboardingLayout } from '@/components/layouts';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { SelectableCard } from '@/components/ui';
import { useState } from 'react';
import { useOnboarding } from '@/context/onboarding-provider';
import type { HairDensity } from '@/lib/api/types';

const DENSITY_OPTIONS: { value: HairDensity; label: string; description: string }[] = [
  { value: 'low', label: 'Low Density', description: 'You can see your scalp easily' },
  { value: 'medium', label: 'Medium Density', description: 'Some scalp visibility' },
  { value: 'high', label: 'High Density', description: 'Scalp is hard to see' },
];

export default function HairDensityScreen() {
  const { data, updateData } = useOnboarding();
  const [density, setDensity] = useState<HairDensity | null>(data.hairDensity || null);

  const handleDensitySelect = (value: HairDensity) => {
    setDensity(value);
    updateData({ hairDensity: value });
  };

  const handleContinue = () => {
    router.push('/onboarding/step-hair-length');
  };

  const canContinue = !!density;

  return (
    <OnboardingLayout
      onNext={handleContinue}
      currentStep={14}
      totalSteps={16}
      nextButtonLabel="Continue"
      allowContinue={canContinue}
    >
      <View className="flex-1">
        <Text className="text-2xl font-bold mb-6">What's your hair density?</Text>

        <Text className="text-base text-gray-600 mb-6">
          Hair density refers to how much hair you have on your head. Look in the mirror and check
          how easily you can see your scalp.
        </Text>

        <View className="flex flex-col gap-3">
          {DENSITY_OPTIONS.map((option) => (
            <SelectableCard
              key={option.value}
              label={option.label}
              description={option.description}
              onPress={() => handleDensitySelect(option.value)}
              selected={density === option.value}
            />
          ))}
        </View>
      </View>
    </OnboardingLayout>
  );
}
