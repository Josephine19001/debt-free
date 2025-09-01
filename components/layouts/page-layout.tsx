import { View, Image, ColorValue } from 'react-native';
import { Text } from '@/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  children: React.ReactNode;
  title: string;
  extraSubtitle?: string;
  image?: string;
  btn?: React.ReactNode;
  theme?: 'nutrition' | 'cycle' | 'exercise' | 'settings';
}

const PageLayout = ({ children, title, extraSubtitle, image, btn, theme = 'settings' }: Props) => {
  const getGradientColors = () => {
    switch (theme) {
      case 'nutrition':
        return ['#f0fdf4', '#f1f5f9', '#f1f5f9']; // Very light green
      case 'cycle':
        return ['#fdf2f8', '#f1f5f9', '#f1f5f9']; // Very light pink
      case 'exercise':
        return ['#f5f3ff', '#f1f5f9', '#f1f5f9']; // Very light purple
      case 'settings':
      default:
        return ['#f1f5f9', '#f1f5f9', '#f1f5f9']; // Simple slate
    }
  };

  const gradientColors = getGradientColors();

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
      <View className="flex-row items-center justify-between pb-4 pt-12 px-4">
        <View className="flex-1">
          <Text className="text-3xl font-bold text-black">{title}</Text>
          {extraSubtitle && <Text className="text-sm text-gray-600 mt-1">{extraSubtitle}</Text>}
        </View>
        {image && (
          <Image
            source={require('@/assets/images/avatar.png')}
            className="w-14 h-14 rounded-full mr-4"
          />
        )}
        {btn}
      </View>
      {children}
    </View>
  );
};

export default PageLayout;
