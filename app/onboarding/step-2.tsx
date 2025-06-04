import { View } from 'react-native';
import { OnboardingLayout } from '@/components/layouts';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { SelectableCard } from '@/components/ui';
import { useState } from 'react';
import { getJourneyFact, HAIR_JOURNEY_FACTS } from '@/lib/data/hair-journey-facts';
import type { HairFact } from '@/lib/types/hair-fact';
import FactCard from '@/components/ui/fact-card';
import { useOnboarding } from '@/context/onboarding-provider';

export default function Step2Screen() {
  const { data, updateData } = useOnboarding();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(
    data.hardestPartResponse || null
  );
  const [fact, setFact] = useState<HairFact | null>(null);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    updateData({ hardestPartResponse: answer });
    const selectedFact = getJourneyFact(answer);
    setFact(selectedFact);
  };

  const handleContinue = () => {
    router.push('/onboarding/step-3');
  };

  return (
    <OnboardingLayout
      onNext={handleContinue}
      currentStep={3}
      totalSteps={16}
      nextButtonLabel="Continue"
      allowContinue={!!selectedAnswer}
    >
      <View className="flex-1">
        <Text className="text-2xl font-bold mb-6">
          What's Been the Hardest Part of Your Hair Journey?
        </Text>

        <View className="space-y-4 mb-8 flex flex-col gap-4">
          {HAIR_JOURNEY_FACTS.map((item) => (
            <SelectableCard
              key={item.answer}
              label={item.answer}
              onPress={() => handleAnswerSelect(item.answer)}
              selected={selectedAnswer === item.answer}
            />
          ))}
        </View>

        {fact && <FactCard fact={fact} />}
      </View>
    </OnboardingLayout>
  );
}
