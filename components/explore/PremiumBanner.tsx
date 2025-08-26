import { View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Sparkles, ArrowRight } from 'lucide-react-native';

export function PremiumBanner() {
  return (
    <View className="bg-pink-500 rounded-2xl p-6">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <Sparkles size={20} color="white" />
            <Text className="text-white font-bold text-xl ml-2">Try Premium</Text>
          </View>
          <Text className="text-gray-100 text-base">Get unlimited access to all features</Text>
        </View>
        <TouchableOpacity
          className="bg-white rounded-full px-6 py-3"
          onPress={() => router.push('/')}
        >
          <View className="flex-row items-center">
            <Text className="text-black font-bold text-base mr-2">Try for Free</Text>
            <ArrowRight size={16} color="black" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
