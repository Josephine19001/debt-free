import { View, ScrollView } from 'react-native';
import { OnboardingLayout } from '@/components/layouts';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { SelectableCard } from '@/components/ui';
import { useState } from 'react';
import { useOnboarding } from '@/context/onboarding-provider';
import type { HairTexture } from '@/lib/api/types';

const HAIR_TYPES: { type: HairTexture; label: string; description: string }[] = [
  { type: '3A', label: '3A - Loose Curls', description: 'Large, loose curls with shine' },
  {
    type: '3B',
    label: '3B - Springy Curls',
    description: 'Springy ringlets that are well-defined',
  },
  { type: '3C', label: '3C - Tight Curls', description: 'Tight corkscrews with high density' },
  { type: '4A', label: '4A - Soft Coils', description: 'Soft coils that are fine and fragile' },
  {
    type: '4B',
    label: '4B - Z-Pattern Coils',
    description: 'Z-pattern coils with less defined curl pattern',
  },
  { type: '4C', label: '4C - Tight Coils', description: 'Tightest coils with maximum shrinkage' },
];

export default function HairTypeScreen() {
  const { data, updateData } = useOnboarding();
  const [selectedType, setSelectedType] = useState<HairTexture | null>(data.hairTexture || null);

  const handleTypeSelect = (type: HairTexture) => {
    setSelectedType(type);
    updateData({ hairTexture: type });
  };

  const handleContinue = () => {
    router.push('/onboarding/step-2');
  };

  return (
    <OnboardingLayout
      onNext={handleContinue}
      currentStep={2}
      totalSteps={17}
      nextButtonLabel="Continue"
      allowContinue={!!selectedType}
    >
      <View className="flex-1">
        <Text className="text-2xl font-bold mb-4">What's Your Hair Type?</Text>

        <Text className="text-base text-gray-600 mb-6">
          Understanding your hair type helps us recommend the best products and routines for you.
        </Text>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="space-y-3 mb-8 flex flex-col gap-3">
            {HAIR_TYPES.map((hairType) => (
              <SelectableCard
                key={hairType.type}
                label={hairType.label}
                // description={hairType.description}
                onPress={() => handleTypeSelect(hairType.type)}
                selected={selectedType === hairType.type}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </OnboardingLayout>
  );
}
