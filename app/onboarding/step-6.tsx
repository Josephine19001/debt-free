import { View } from 'react-native';
import { OnboardingLayout } from '@/components/layouts';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Sparkles } from 'lucide-react-native';

export default function Step6Screen() {
  const handleContinue = () => {
    router.push('/onboarding/step-7');
  };

  return (
    <OnboardingLayout
      onNext={handleContinue}
      currentStep={7}
      totalSteps={16}
      nextButtonLabel="Continue"
      allowContinue={true}
    >
      <View className="flex-1 items-center justify-center">
        <View className="bg-violet-100 p-4 rounded-full mb-6">
          <Sparkles size={40} className="text-violet-500" />
        </View>

        <Text className="text-3xl font-bold text-center mb-6">We appreciate your honesty!</Text>

        <Text className="text-gray-600 text-center text-lg mb-8">
          We understand there aren't a lot of options for hair care products out there for US
          curlies.
        </Text>

        <View className="bg-violet-50 p-4 rounded-xl">
          <Text className="text-base text-center text-violet-700">
            Next, we'll ask you a few questions to help us tailor HairDeets AI to your needs.
          </Text>
        </View>
      </View>
    </OnboardingLayout>
  );
}
