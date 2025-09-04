import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-provider';
import { supabase } from '@/lib/supabase/client';

export function useOnboardingStatus() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['onboarding-status', user?.id],
    queryFn: async () => {
      if (!user) {
        return { hasCompletedOnboarding: false };
      }

      try {
        // Ensure account exists first
        const { error: rpcError } = await supabase.rpc('create_missing_account', { 
          p_user_id: user.id 
        });
        
        if (rpcError) {
          console.error('Error ensuring account exists:', rpcError);
        }

        // Get onboarding status
        const { data: account, error } = await supabase
          .from('accounts')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching onboarding status:', error);
          return { hasCompletedOnboarding: false };
        }

        return { hasCompletedOnboarding: account?.onboarding_completed || false };
      } catch (error) {
        console.error('Error in onboarding status check:', error);
        return { hasCompletedOnboarding: false };
      }
    },
    enabled: !!user, // Only run query if user exists
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });
}