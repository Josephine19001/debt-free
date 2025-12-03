import { BlurView } from 'expo-blur';
import { Tabs, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock } from 'lucide-react-native';
import { HomeIcon, DebtsIcon, AdvisorIcon, SettingsIcon } from '@/components/icons/tab-icons';
import { useTabBar } from '@/context/tab-bar-provider';
import { useUnreadMessages, useUnreadRealtime } from '@/lib/hooks/use-chat';
import { useRevenueCat } from '@/context/revenuecat-provider';
import { useTheme } from '@/context/theme-provider';
import { useColors } from '@/lib/hooks/use-colors';
import * as Haptics from 'expo-haptics';

function CustomTabBar({ state, navigation }: any) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { hideTabBar } = useTabBar();
  const { hasUnread } = useUnreadMessages();
  const { isSubscribed } = useRevenueCat();
  const { isDark } = useTheme();
  const colors = useColors();

  // Set up realtime subscription for unread notifications
  useUnreadRealtime();

  const mainTabs = state.routes.filter((route: any) => route.name !== 'advisor/index');

  const handleAdvisorPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Gate AI Advisor behind subscription
    if (!isSubscribed) {
      router.push('/paywall');
      return;
    }

    hideTabBar();
    router.push('/(tabs)/advisor');
  };

  return (
    <View
      className="absolute bottom-0 left-0 right-0 flex-row items-center gap-3 px-5"
      style={{ paddingBottom: insets.bottom + 10 }}
    >
      {/* Main Tabs Container */}
      <View
        className="flex-1 h-[60px] rounded-[30px] overflow-hidden "
        style={{
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.3 : 0.15,
          shadowRadius: isDark ? 8 : 16,
          elevation: isDark ? 4 : 8,
        }}
      >
        <BlurView intensity={50} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <View
          className="absolute inset-0 rounded-[30px]"
          style={{
            borderWidth: 1,
            borderColor: isDark ? colors.border : 'rgba(0, 0, 0, 0.12)',
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
          }}
        />
        <View className="flex-1 flex-row items-center justify-around px-5 ">
          {mainTabs.map((route: any) => {
            const isFocused =
              state.index === state.routes.findIndex((r: any) => r.key === route.key);

            const onPress = () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const color = isFocused ? '#10B981' : colors.icon;

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                className="items-center justify-center p-2"
              >
                {route.name === 'home/index' && <HomeIcon size={28} color={color} />}
                {route.name === 'debts/index' && <DebtsIcon size={28} color={color} />}
                {route.name === 'settings/index' && <SettingsIcon size={28} color={color} />}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Advisor Button */}
      <Pressable onPress={handleAdvisorPress}>
        <View
          className="w-[60px] h-[60px] rounded-full items-center justify-center overflow-hidden"
          style={{
            shadowColor: isSubscribed ? '#10B981' : '#6B7280',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isSubscribed ? 0.4 : 0.2,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <LinearGradient
            colors={isSubscribed ? ['#10B981', '#059669'] : ['#4B5563', '#374151']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View
            className={`absolute inset-0 rounded-full border ${
              isSubscribed ? 'border-emerald-400/30' : 'border-gray-500/30'
            }`}
          />
          <View style={{ opacity: isSubscribed ? 1 : 0.5 }}>
            <AdvisorIcon size={26} color="#FFFFFF" />
          </View>
          {/* Lock icon for non-subscribers */}
          {!isSubscribed && (
            <View className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-gray-700 items-center justify-center border border-gray-500">
              <Lock size={10} color="#FFFFFF" />
            </View>
          )}
          {/* Unread badge for subscribers */}
          {isSubscribed && hasUnread && (
            <View className="absolute top-1 right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-emerald-500" />
          )}
        </View>
      </Pressable>
    </View>
  );
}

export default function TabLayout() {
  const { isTabBarVisible } = useTabBar();
  const colors = useColors();

  return (
    <Tabs
      tabBar={(props) => (isTabBarVisible ? <CustomTabBar {...props} /> : null)}
      screenOptions={{
        sceneStyle: { backgroundColor: colors.background },
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home/index" />
      <Tabs.Screen name="debts/index" />
      <Tabs.Screen name="settings/index" />
      <Tabs.Screen name="advisor/index" />
    </Tabs>
  );
}
