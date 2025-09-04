import { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';

import * as SplashScreen from 'expo-splash-screen';
import { WelcomeScreen } from '@/components/screens';
import { useAppInitialization } from '@/lib/hooks/use-app-initialization';
import { DefaultLoader } from '@/components/ui/default-loader';

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const { isLoading, navigationTarget, paywallParams } = useAppInitialization();

  // Navigate when initialization is complete
  useEffect(() => {
    if (isLoading) return;

    const navigate = async () => {
      await SplashScreen.hideAsync();

      switch (navigationTarget) {
        case 'welcome':
          // Show welcome screen - don't navigate
          break;
        case 'onboarding':
          router.replace('/onboarding');
          break;
        case 'paywall':
          router.replace(`/paywall?${paywallParams}` as any);
          break;
        case 'main':
          router.replace('/(tabs)/nutrition');
          break;
      }
    };

    navigate();
  }, [isLoading, navigationTarget, paywallParams]);

  // Show loading state while doing background checks
  if (isLoading) {
    return <DefaultLoader />;
  }

  // Show welcome screen for users without sessions
  if (navigationTarget === 'welcome') {
    return (
      <View style={{ flex: 1 }}>
        <WelcomeScreen />
      </View>
    );
  }

  // Show loader while navigating to other destinations
  return <DefaultLoader />;
}
