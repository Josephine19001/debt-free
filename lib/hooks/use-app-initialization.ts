import { useAuth } from '@/context/auth-provider';
import { useRevenueCat } from '@/context/revenuecat-provider';
import { useOnboardingStatus } from './use-onboarding-status';

export interface AppInitializationState {
  isLoading: boolean;
  user: any;
  hasCompletedOnboarding: boolean;
  navigationTarget: 'welcome' | 'onboarding' | 'paywall' | 'main';
  paywallParams?: string;
}

export function useAppInitialization(): AppInitializationState {
  const { user, loading: authLoading } = useAuth();
  const {
    loading: revenueCatLoading,
    offerings,
    shouldShowPaywall,
    isInGracePeriod,
  } = useRevenueCat();
  const { data: onboardingData, isLoading: onboardingLoading } = useOnboardingStatus();

  // Calculate if we're still loading  
  // For users with sessions, wait for all data including RevenueCat data and proper subscription status
  const isLoading = Boolean(
    authLoading || 
    revenueCatLoading || 
    (user && (onboardingLoading || !offerings))
  );

  // Determine navigation target (Hard paywall - subscription required for all features)
  let navigationTarget: AppInitializationState['navigationTarget'] = 'welcome';
  let paywallParams: string | undefined;

  if (!isLoading && user) {
    const hasCompletedOnboarding = onboardingData?.hasCompletedOnboarding || false;

    if (!hasCompletedOnboarding) {
      navigationTarget = 'onboarding';
    } else if (shouldShowPaywall) {
      // Hard paywall - user must subscribe to access any features
      navigationTarget = 'paywall';
      const source = isInGracePeriod ? 'grace_period' : 'feature_gate';
      const dismissible = false; // Hard paywall - no dismissing
      paywallParams = `source=${source}&dismissible=${dismissible}&successRoute=/(tabs)/nutrition`;
    } else {
      // User has valid subscription or is in grace period - access granted
      navigationTarget = 'main';
    }
  } else if (!isLoading && !user) {
    navigationTarget = 'welcome';
  }

  return {
    isLoading,
    user,
    hasCompletedOnboarding: onboardingData?.hasCompletedOnboarding ?? false,
    navigationTarget,
    paywallParams,
  };
}
