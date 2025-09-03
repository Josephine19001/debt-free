import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { SkeletonLoader } from '@/components/progress/skeleton';

interface Props {
  CalendarButton: React.ReactNode;
}

export function ProgressLoadingState({ CalendarButton }: Props) {
  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-4 mb-6">
        <View className="bg-gray-100 rounded-2xl p-1 flex-row">
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={i} className="flex-1 py-2.5 rounded-xl items-center justify-center">
              <View className="bg-gray-200 rounded h-5 w-16" />
            </View>
          ))}
        </View>
      </View>

      {/* Charts skeleton */}
      <SkeletonLoader />
    </View>
  );
}
