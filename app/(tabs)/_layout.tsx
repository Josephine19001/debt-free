import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { HomeIcon, DebtsIcon, SettingsIcon } from '@/components/icons/tab-icons';
import { useTabBar } from '@/context/tab-bar-provider';

export default function TabLayout() {
  const { isTabBarVisible } = useTabBar();

  return (
    <Tabs
      screenOptions={{
        sceneStyle: { backgroundColor: '#0F0F0F' },
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#9BA1A6',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: isTabBarVisible
          ? {
              position: 'absolute',
              backgroundColor: 'transparent',
              borderTopWidth: 0,
              height: 60,
              paddingTop: 8,
              paddingBottom: 16,
              paddingHorizontal: 20,
              elevation: 0,
              bottom: 25,
              marginHorizontal: 40,
              borderRadius: 30,
              overflow: 'hidden',
              alignSelf: 'center',
            }
          : { display: 'none' },
        tabBarBackground: () =>
          isTabBarVisible ? (
            <View style={[StyleSheet.absoluteFill, { borderRadius: 30, overflow: 'hidden' }]}>
              <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill}>
                <View
                  style={{
                    ...StyleSheet.absoluteFillObject,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 30,
                  }}
                />
              </BlurView>
            </View>
          ) : null,
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          tabBarIcon: ({ color }) => <HomeIcon size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="debts/index"
        options={{
          tabBarIcon: ({ color }) => <DebtsIcon size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          tabBarIcon: ({ color }) => <SettingsIcon size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
