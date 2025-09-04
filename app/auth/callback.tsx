import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner-native';
// Navigation logic moved to useAppInitialization hook

export default function AuthCallback() {
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    handleAuthCallback();
  }, []);

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
        // Navigation handled by useAppInitialization hook - just go to main page
        router.replace('/');
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
