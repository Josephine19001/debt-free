import type { PropsWithChildren } from 'react';

import { useReactQueryDevTools } from '@dev-plugins/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Toaster } from 'sonner-native';
import { AuthProvider } from './auth-provider';
import { OnboardingProvider } from './onboarding-provider';
import { SubscriptionProvider } from './subscription-provider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const RootProvider = ({ children }: PropsWithChildren) => {
  useReactQueryDevTools(queryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SubscriptionProvider>
          <OnboardingProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <BottomSheetModalProvider>
                {children}
                <Toaster />
              </BottomSheetModalProvider>
            </GestureHandlerRootView>
          </OnboardingProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};
