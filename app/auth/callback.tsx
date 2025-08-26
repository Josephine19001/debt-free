import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner-native';
import { revenueCatService } from '@/lib/services/revenuecat-service';

export default function AuthCallback() {
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    handleAuthCallback();
  }, []);

  // Helper function to determine where to redirect after auth
  const getPostAuthRoute = async (userId: string): Promise<string> => {
    try {
      // Use the new best practices method
      const result = await revenueCatService.checkSubscriptionStatus(userId);

      if (result.error) {
        console.error('Error checking subscription status:', result.error);
        // Default to paywall if we can't check subscription
        return '/paywall';
      }

      // If user has active subscription, go to explore
      // Otherwise, go to paywall
      return result.isSubscribed ? '/(tabs)/explore' : '/paywall';
    } catch (error) {
      console.error('Error checking subscription status:', error);
      // Default to paywall if we can't check subscription
      return '/paywall';
    }
  };

  const handleAuthCallback = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Auth callback error:', error);
        toast.error('Authentication failed');
        router.replace('/auth?mode=signin');
        return;
      }

      if (data.session?.user) {
        const route = await getPostAuthRoute(data.session.user.id);
        router.replace(route as any);
      } else {
        router.replace('/auth?mode=signin');
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      toast.error('Authentication failed');
      router.replace('/auth?mode=signin');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#8B5CF6" />
      <Text className="mt-4 text-slate-600">
        {isProcessing ? 'Completing sign in...' : 'Redirecting...'}
      </Text>
    </View>
  );
}
