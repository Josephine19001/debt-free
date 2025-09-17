import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/context/theme-provider';
import { cn } from '@/lib/utils';
import { WeekType, WEEK_OPTIONS } from '@/lib/utils/progress-date-utils';

interface Props {
  selectedWeek: WeekType;
  onWeekChange: (week: WeekType) => void;
  isLoading?: boolean;
}

export function WeekSelectionTabs({ selectedWeek, onWeekChange, isLoading }: Props) {
  const { theme } = useTheme();
  if (isLoading) {
    return (
      <View className="px-4 mb-6">
        <View className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-2xl p-1 flex-row`}>
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={i} className="flex-1 py-2.5 rounded-xl items-center justify-center">
              <View className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded h-5 w-16`} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View className="px-4 mb-6">
      <View className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-2xl p-1 flex-row gap-2`}>
        {WEEK_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => onWeekChange(option.value)}
            className={cn(
              'flex-1 py-2.5 rounded-xl items-center justify-center',
              selectedWeek === option.value 
                ? 'bg-pink-500 shadow-sm' 
                : theme === 'dark' ? 'bg-gray-700' : 'bg-white'
            )}
          >
            <Text
              className={cn(
                'text-sm font-medium',
                selectedWeek === option.value 
                  ? 'text-white' 
                  : theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
              )}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}