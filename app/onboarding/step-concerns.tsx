import { View } from 'react-native';
import { OnboardingLayout } from '@/components/layouts';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { SelectableCard } from '@/components/ui';
import { useState } from 'react';
import { useOnboarding } from '@/context/onboarding-provider';

type ConcernType =
  | 'dryness'
  | 'breakage'
  | 'frizz'
  | 'lack_of_shine'
  | 'scalp_issues'
  | 'thinning'
  | 'dandruff'
  | 'oiliness';

// Map user-friendly labels to backend enum values
const CONCERNS_OPTIONS: { value: string; label: string; backendValue: ConcernType }[] = [
  { value: 'dryness', label: 'Dryness & Brittleness', backendValue: 'dryness' },
  { value: 'frizz', label: 'Frizz & Lack of Definition', backendValue: 'frizz' },
  { value: 'breakage', label: 'Hair Breakage', backendValue: 'breakage' },
  { value: 'scalp_issues', label: 'Scalp Issues', backendValue: 'scalp_issues' },
  { value: 'thinning', label: 'Lack of Growth', backendValue: 'thinning' },
  { value: 'lack_of_shine', label: 'Lack of Shine', backendValue: 'lack_of_shine' },
  { value: 'dandruff', label: 'Dandruff', backendValue: 'dandruff' },
  { value: 'oiliness', label: 'Oily Hair/Scalp', backendValue: 'oiliness' },
];

export default function ConcernsScreen() {
  const { data, updateData } = useOnboarding();
  const [selectedConcerns, setSelectedConcerns] = useState<ConcernType[]>(data.concerns || []);

  const handleConcernToggle = (backendValue: ConcernType) => {
    const newConcerns = selectedConcerns.includes(backendValue)
      ? selectedConcerns.filter((c) => c !== backendValue)
      : [...selectedConcerns, backendValue];

    setSelectedConcerns(newConcerns);
    updateData({ concerns: newConcerns });
  };

  const handleContinue = () => {
    router.push('/onboarding/step-scalp-type');
  };

  const canContinue = selectedConcerns.length > 0;

  return (
    <OnboardingLayout
      onNext={handleContinue}
      currentStep={16}
      totalSteps={17}
      nextButtonLabel="Continue"
      allowContinue={canContinue}
    >
      <View className="flex-1">
        <Text className="text-2xl font-bold mb-6">What are your main hair concerns?</Text>

        <Text className="text-base text-gray-600 mb-6">
          Select all that apply. This helps us provide the most relevant recommendations.
        </Text>

        <View className="flex flex-col gap-3">
          {CONCERNS_OPTIONS.map((concern) => (
            <SelectableCard
              key={concern.value}
              label={concern.label}
              onPress={() => handleConcernToggle(concern.backendValue)}
              selected={selectedConcerns.includes(concern.backendValue)}
            />
          ))}
        </View>

        {selectedConcerns.length > 0 && (
          <Text className="text-sm text-gray-500 mt-4">
            {selectedConcerns.length} concern{selectedConcerns.length > 1 ? 's' : ''} selected
          </Text>
        )}
      </View>
    </OnboardingLayout>
  );
}
