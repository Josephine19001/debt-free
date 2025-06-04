import { View } from 'react-native';
import { OnboardingLayout } from '@/components/layouts';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { SelectableCard } from '@/components/ui';
import { useState } from 'react';
import { useOnboarding } from '@/context/onboarding-provider';
import type { ScalpType } from '@/lib/api/types';

const SCALP_TYPE_OPTIONS: { value: ScalpType; label: string; description: string }[] = [
  { value: 'oily', label: 'Oily', description: 'Scalp feels greasy, hair gets oily quickly' },
  { value: 'normal', label: 'Normal', description: 'Balanced scalp, not too oily or dry' },
  { value: 'dry', label: 'Dry', description: 'Scalp feels tight or flaky, hair lacks moisture' },
  { value: 'sensitive', label: 'Sensitive', description: 'Scalp is easily irritated by products' },
];

export default function ScalpTypeScreen() {
  const { data, updateData } = useOnboarding();
  const [scalpType, setScalpType] = useState<ScalpType | null>(data.scalpType || null);

  const handleScalpTypeSelect = (value: ScalpType) => {
    setScalpType(value);
    updateData({ scalpType: value });
  };

  const handleContinue = () => {
    router.push('/onboarding/step-11');
  };

  const canContinue = !!scalpType;

  return (
    <OnboardingLayout
      onNext={handleContinue}
      currentStep={17}
      totalSteps={17}
      nextButtonLabel="Complete Profile"
      allowContinue={canContinue}
    >
      <View className="flex-1">
        <Text className="text-2xl font-bold mb-6">What's your scalp type?</Text>

        <Text className="text-base text-gray-600 mb-6">
          Understanding your scalp type helps us recommend the right products for your scalp health.
        </Text>

        <View className="flex flex-col gap-3">
          {SCALP_TYPE_OPTIONS.map((option) => (
            <SelectableCard
              key={option.value}
              label={option.label}
              description={option.description}
              onPress={() => handleScalpTypeSelect(option.value)}
              selected={scalpType === option.value}
            />
          ))}
        </View>
      </View>
    </OnboardingLayout>
  );
}
