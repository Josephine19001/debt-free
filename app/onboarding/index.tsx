import { View } from 'react-native';
import { OnboardingLayout } from '@/components/layouts';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { SelectableCard } from '@/components/ui';
import { useState } from 'react';
import { getFactForAnswer, GIVING_UP_FACTS } from '@/lib/data/hair-facts';
import type { HairFact } from '@/lib/types/hair-fact';

export default function Step4Screen() {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [fact, setFact] = useState<HairFact | null>(null);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    const selectedFact = getFactForAnswer(answer);
    setFact(selectedFact);
  };

  console.log(selectedAnswer);

  const handleContinue = () => {
    router.push('/onboarding/step-2');
  };

  return (
    <OnboardingLayout
      onNext={handleContinue}
      currentStep={1}
      totalSteps={11}
      nextButtonLabel="Continue"
      allowContinue={!!selectedAnswer}
    >
      <View className="flex-1">
        <Text className="text-2xl font-bold mb-6">
          Have You Ever Felt Like Giving Up on Your Natural Hair?
        </Text>

        <View className="flex-col  gap-4 mb-8">
          {GIVING_UP_FACTS.map((item) => (
            <SelectableCard
              key={item.answer}
              label={item.answer}
              onPress={() => handleAnswerSelect(item.answer)}
              selected={selectedAnswer === item.answer}
              className="w-full"
            />
          ))}
        </View>

        {fact && (
          <View className="bg-orange-100 p-4 rounded-xl">
            <Text className="text-orange-900 font-bold mb-4">Did you know? 🤔</Text>
            <Text className="text-orange-800 mb-4">{fact.fact}</Text>
            <Text className="text-orange-800 mb-4">{fact.description}</Text>
            <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-orange-200">
              <Text className="text-orange-700 font-medium">{fact.source}</Text>
              <Text className="text-orange-600">{fact.year}</Text>
            </View>
          </View>
        )}
      </View>
    </OnboardingLayout>
  );
}
