import { useEffect, ReactNode } from 'react';
import { router, usePathname } from 'expo-router';
import { useAuth } from '@/context/auth-provider';
import { useRevenueCat } from '@/context/revenuecat-provider';

interface RootSubscriptionGuardProps {
  children: ReactNode;
}

/**
 * Root-level subscription guard - last line of defense
 * Monitors all routes and blocks access to protected areas
 * even if other security layers fail
 */
export function RootSubscriptionGuard({ children }: RootSubscriptionGuardProps) {
  const { user } = useAuth();
  const { shouldShowPaywall, loading, isInGracePeriod } = useRevenueCat();
  const currentPath = usePathname();

  useEffect(() => {
    // Only check after loading is complete and we have a user
    if (loading || !user) return;
    
    // Define protected routes that require subscription
    const protectedRoutes = [
      '/(tabs)',
      '/log-meal',
      '/log-exercise', 
      '/log-water',
      '/log-mood',
      '/log-symptoms',
      '/log-supplements',
      '/scan-food',
      '/cycle-history',
      '/edit-period'
    ];

    // Check if current route is protected
    const isProtectedRoute = protectedRoutes.some(route => 
      currentPath.includes(route) || currentPath.startsWith(route)
    );

    if (isProtectedRoute) {
      // SECURITY CHECK: Block access if no valid subscription
      if (shouldShowPaywall) {
        console.warn('🛡️ ROOT GUARD: Blocking unauthorized access to protected route:', currentPath);
        
        // Force redirect to paywall
        const source = isInGracePeriod ? 'grace_period' : 'security_block';
        router.replace(`/paywall?source=${source}&dismissible=false&successRoute=${encodeURIComponent(currentPath)}`);
        return;
      }
    }

    // Allow access - user has valid subscription or is on public route
  }, [user, shouldShowPaywall, loading, currentPath, isInGracePeriod]);

  return <>{children}</>;
}