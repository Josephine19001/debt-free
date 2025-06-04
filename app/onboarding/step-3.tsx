import { View } from 'react-native';
import { OnboardingLayout } from '@/components/layouts';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { SelectableCard } from '@/components/ui';
import { useState } from 'react';
import { getProductCheckFact, PRODUCT_CHECK_FACTS } from '@/lib/data/product-check-facts';
import type { HairFact } from '@/lib/types/hair-fact';
import FactCard from '@/components/ui/fact-card';
import { useOnboarding } from '@/context/onboarding-provider';

export default function Step3Screen() {
  const { data, updateData } = useOnboarding();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(
    data.ingredientCheckResponse || null
  );
  const [fact, setFact] = useState<HairFact | null>(null);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    updateData({ ingredientCheckResponse: answer });
    const selectedFact = getProductCheckFact(answer);
    setFact(selectedFact);
  };

  const handleContinue = () => {
    router.push('/onboarding/step-4');
  };

  return (
    <OnboardingLayout
      onNext={handleContinue}
      currentStep={4}
      totalSteps={16}
      nextButtonLabel="Continue"
      allowContinue={!!selectedAnswer}
    >
      <View className="flex-1">
        <Text className="text-2xl font-bold mb-6">
          Do You Check Ingredients Before Buying Hair Products?
        </Text>

        <View className="space-y-4 mb-8 flex flex-col gap-4">
          {PRODUCT_CHECK_FACTS.map((item) => (
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
