import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { Text } from '../ui/text';
import { Button } from '../ui/button';
import { useAuth } from '@/context/auth-provider';

export function WelcomeScreen() {
  const { user, loading, checkOnboardingAndRedirect } = useAuth();

  useEffect(() => {
    // If user is already authenticated, check onboarding status
    if (!loading && user) {
      checkOnboardingAndRedirect();
    }
  }, [user, loading, checkOnboardingAndRedirect]);

  const onGetStarted = useCallback(() => {
    router.replace('/onboarding');
  }, []);

  const onSignIn = useCallback(() => {
    router.push('/auth?mode=signin');
  }, []);

  // Show loading while checking auth status
  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="mt-4 text-gray-600">Loading...</Text>
      </View>
    );
  }

  // Only show welcome screen if user is not authenticated
  if (user) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="mt-4 text-gray-600">Redirecting...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white px-4 justify-between pt-5 pb-10">
      <View className="flex-1 justify-center items-center">
        <View className="w-full aspect-square bg-gray-200 rounded-2xl mb-4" />
      </View>

      <View>
        <Text variant="heading" className="mb-8">
          Know what you {'\n'} put in your HAIR!
        </Text>
        <Button variant="primary" label="Get Started" onPress={onGetStarted} />

        <View className="flex-row items-center justify-center gap-2 mb-4">
          <Text variant="body" className="text-center">
            Already have an account?
          </Text>

          <Button variant="link" onPress={onSignIn} label="Sign In" />
        </View>
      </View>
    </View>
  );
}
