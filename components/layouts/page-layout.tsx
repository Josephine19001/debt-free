import { View, Image, ColorValue, Dimensions } from 'react-native';
import { Text } from '@/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import WeeklyCalendar from '@/components/nutrition/weekly-calendar';
import { NavigableAvatar } from '@/components/ui/avatar';
import { NavigationErrorBoundary } from '@/components/ui/navigation-error-boundary';

interface Props {
  children: React.ReactNode;
  title: string;
  extraSubtitle?: string;
  image?: string;
  btn?: React.ReactNode;
  theme?: 'nutrition' | 'cycle' | 'exercise' | 'settings' | 'progress';
  // Calendar props - only required when theme is not 'settings'
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  loggedDates?: string[];
}

const PageLayout = ({
  children,
  title,
  extraSubtitle,
  image,
  btn,
  theme = 'settings',
  selectedDate,
  onDateSelect,
  loggedDates,
}: Props) => {
  const { width: screenWidth } = Dimensions.get('window');
  const isTablet = screenWidth >= 768;
  
  const getGradientColors = () => {
    switch (theme) {
      case 'nutrition':
        return ['#f0fdf4', '#f1f5f9', '#f1f5f9']; // Very light green
      case 'cycle':
        return ['#fdf2f8', '#f1f5f9', '#f1f5f9']; // Very light pink
      case 'exercise':
        return ['#f5f3ff', '#f1f5f9', '#f1f5f9']; // Very light purple
      case 'settings':
      case 'progress':
      default:
        return ['#f1f5f9', '#f1f5f9', '#f1f5f9']; // Simple slate
    }
  };

  const gradientColors = getGradientColors();
  const shouldShowCalendar =
    theme !== 'settings' && 
    theme !== 'progress' && 
    selectedDate && 
    !isNaN(selectedDate.getTime()) && 
    onDateSelect;

  return (
    <View className="flex-1 pt-5">
      <LinearGradient
        colors={gradientColors as [ColorValue, ColorValue, ColorValue]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      <View 
        className={`flex-row items-center justify-between pb-4 pt-12 ${isTablet ? 'px-8' : 'px-4'}`}
        style={isTablet ? { maxWidth: 1024, marginHorizontal: 'auto', width: '100%' } : undefined}
      >
        <View className="flex-row items-center flex-1">
          {theme !== 'settings' && (
            <NavigationErrorBoundary size={isTablet ? 56 : 48}>
              <NavigableAvatar size={isTablet ? 56 : 48} />
            </NavigationErrorBoundary>
          )}
          <View className={theme !== 'settings' ? 'ml-3 flex-1' : 'flex-1'}>
            <Text className={`${isTablet ? 'text-4xl' : 'text-3xl'} font-bold text-black`}>{title}</Text>
            {extraSubtitle && (
              <Text className={`${isTablet ? 'text-base' : 'text-sm'} text-gray-600 mt-1`}>
                {extraSubtitle}
              </Text>
            )}
          </View>
        </View>
        {image && (
          <Image
            source={require('@/assets/images/avatar.png')}
            className={`${isTablet ? 'w-16 h-16' : 'w-14 h-14'} rounded-full mr-4`}
          />
        )}
        {btn}
      </View>

      {/* Only show WeeklyCalendar for non-settings themes */}
      {shouldShowCalendar && (
        <NavigationErrorBoundary fallback={<View />}>
          <View style={isTablet ? { maxWidth: 1024, marginHorizontal: 'auto', width: '100%' } : undefined}>
            <WeeklyCalendar
              selectedDate={selectedDate!}
              onDateSelect={onDateSelect!}
              loggedDates={loggedDates || []}
              theme={theme}
            />
          </View>
        </NavigationErrorBoundary>
      )}

      <View style={isTablet ? { maxWidth: 1024, marginHorizontal: 'auto', width: '100%', flex: 1 } : { flex: 1 }}>
        {children}
      </View>
    </View>
  );
};

export default PageLayout;
