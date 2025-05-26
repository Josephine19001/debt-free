import { View, Image, Pressable, Animated } from 'react-native';
import { OnboardingLayout } from '@/components/layouts';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { SelectableCard } from '@/components/ui';
import { useState, useRef, useCallback } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import { TestTube, ArrowRight } from 'lucide-react-native';

const POROSITY_TEST_FACTS = [
  'Yes – it floated',
  'It stayed in the middle',
  'It sank',
  'I don’t know',
];

export default function Step5Screen() {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleContinue = () => {
    router.push('/onboarding/step-6');
  };

  const openPorosityTest = useCallback(() => {
    setIsBottomSheetOpen(true);
    bottomSheetRef.current?.expand();
  }, []);

  const closePorosityTest = useCallback(() => {
    setIsBottomSheetOpen(false);
    bottomSheetRef.current?.close();
  }, []);
  return (
    <>
      <OnboardingLayout
        onNext={handleContinue}
        currentStep={5}
        totalSteps={11}
        nextButtonLabel="Continue"
        allowContinue={!!selectedAnswer}
      >
        <View>
          <Text className="text-2xl font-bold mb-6 mt-4">Have you tried the porosity test?</Text>

          <View className="space-y-4 mb-8 flex flex-col gap-4">
            {POROSITY_TEST_FACTS.map((item) => (
              <SelectableCard
                key={item}
                label={item}
                onPress={() => handleAnswerSelect(item)}
                selected={selectedAnswer === item}
              />
            ))}
          </View>

          <Pressable onPress={openPorosityTest} className="bg-yellow-100 p-4 rounded-lg">
            <View className="flex-row items-center gap-2">
              <TestTube size={24} className="text-yellow-800" />
              <Text className="text-yellow-800 font-bold">How to do the porosity test</Text>
            </View>
          </Pressable>
        </View>
      </OnboardingLayout>
      <>
        {isBottomSheetOpen && (
          <Animated.View
            className="absolute inset-0 bg-black/60"
            onTouchStart={closePorosityTest}
          />
        )}

        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={['60%']}
          enablePanDownToClose
          index={-1}
          backgroundStyle={{ backgroundColor: 'white' }}
          onClose={() => setIsBottomSheetOpen(false)}
          handleIndicatorStyle={{ backgroundColor: '#94A3B8' }}
        >
          <Pressable onPress={closePorosityTest} className="self-end px-4">
            <Text className="text-gray-700 pr-4">Close</Text>
          </Pressable>
          <View className="flex-1 p-4">
            <Image
              source={require('@/assets/images/porosity-test.png')}
              className="w-full h-72 rounded-t-3xl mb-4"
              resizeMode="cover"
            />
            <Text className="text-base text-gray-700 mb-4">
              Take a strand of clean hair and drop it in a glass of water:
            </Text>
            <View className="space-y-2">
              <View className="flex-row items-center gap-2">
                <ArrowRight size={24} className="text-gray-700" />
                <Text>If it floats: Low porosity</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <ArrowRight size={24} className="text-gray-700" />
                <Text>If it stays in middle: Medium porosity</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <ArrowRight size={24} className="text-gray-700" />
                <Text>If it sinks: High porosity</Text>
              </View>
            </View>
          </View>
        </BottomSheet>
      </>
    </>
  );
}
