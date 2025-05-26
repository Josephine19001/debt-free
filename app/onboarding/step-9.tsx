import { View, Dimensions } from 'react-native';
import { OnboardingLayout } from '@/components/layouts';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text } from '@/components/ui/text';
import Carousel from 'react-native-reanimated-carousel';
import { Quote } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import * as StoreReview from 'expo-store-review';

const REVIEWS = [
  {
    quote: 'I finally understood why my hair was breaking.',
    author: 'Adesua',
    age: 27,
  },
  {
    quote: 'No more guessing. I scan products, get answers, and move on.',
    author: 'Yvonne',
    age: 33,
  },
  {
    quote: "H'Deets is the stylist I never had.",
    author: 'Jordan',
    age: 24,
  },
];

export default function Step9Screen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const width = Dimensions.get('window').width;

  const handleReviewNow = async () => {
    const isAvailable = await StoreReview.hasAction();
    if (isAvailable) {
      await StoreReview.requestReview();
    } else {
      router.push('/onboarding/step-10');
    }
  };

  const handleRemindLater = () => {
    router.push('/onboarding/step-10');
  };

  const renderReview = ({ item }: { item: (typeof REVIEWS)[number] }) => (
    <View className="mx-6 p-6 rounded-2xl bg-purple-50 shadow-sm">
      <View className="items-center">
        <View className="bg-purple-100 p-3 rounded-full mb-4">
          <Quote size={20} className="text-purple-500" />
        </View>
        <Text className="text-lg text-center font-medium mb-2 leading-relaxed">"{item.quote}"</Text>
        <Text className="text-gray-600">
          – {item.author}, {item.age}
        </Text>
      </View>
    </View>
  );

  return (
    <OnboardingLayout
      title="You're in good company"
      subtitle="Here's what other community members are saying"
      currentStep={9}
      totalSteps={10}
      hideContinueButton
    >
      <View className="flex-1">
        <Carousel
          width={width}
          height={220}
          autoPlay
          autoPlayInterval={4000}
          scrollAnimationDuration={1000}
          data={REVIEWS}
          loop
          mode="parallax"
          renderItem={renderReview}
          onProgressChange={(_, absoluteProgress) => {
            setCurrentIndex(Math.round(absoluteProgress));
          }}
        />

        <View className="flex-row justify-center gap-2 mt-4">
          {REVIEWS.map((_, index) => (
            <View
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={index}
              className={`h-2 w-2 rounded-full ${
                index === currentIndex ? 'bg-purple-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </View>

        <View className="mt-10 items-center">
          <View className="flex-row mb-6 px-4 py-2 bg-yellow-100 rounded-full">
            {[...Array(5)].map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <Text key={i} className="text-lg mx-1">
                ⭐
              </Text>
            ))}
          </View>

          <View className="w-full gap-4 px-6">
            <Button
              variant="primary"
              label="Yes, rate now"
              onPress={handleReviewNow}
              className="bg-black"
            />
            <Button
              variant="secondary"
              label="Remind me later"
              onPress={handleRemindLater}
              className="bg-gray-100"
            />
          </View>
        </View>
      </View>
    </OnboardingLayout>
  );
}
