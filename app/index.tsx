import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { WelcomeScreen } from '@/components/screens';

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync(Entypo.font);
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) return null;

  return (
    <View onLayout={onLayoutRootView} style={{ flex: 1 }}>
      <WelcomeScreen />
    </View>
  );
}
