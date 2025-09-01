import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Calendar, Clock } from 'lucide-react-native';
import { router } from 'expo-router';

interface NextPeriodPredictionProps {
  daysUntilNext: number | null;
  nextPeriodDate: string | null;
}

export const NextPeriodPrediction = ({
  daysUntilNext,
  nextPeriodDate,
}: NextPeriodPredictionProps) => {
  return (
    <View className="px-4 mb-6">
      <View className="bg-white rounded-2xl p-4 border border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-2xl bg-pink-100 items-center justify-center mr-3">
              <Calendar size={20} color="#EC4899" />
            </View>
            <Text className="text-lg font-semibold text-black">Next Period</Text>
          </View>
          {daysUntilNext !== null && (
            <Text className="text-pink-600 font-bold text-lg">
              in {daysUntilNext > 0 ? daysUntilNext : 0} days
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};
