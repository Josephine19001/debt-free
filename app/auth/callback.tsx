import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { router } from 'expo-router';

export default function AuthCallback() {
  useEffect(() => {
    // Since we no longer use OAuth, redirect to main auth
    router.replace('/auth?mode=signin');
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#000" />
      <Text className="mt-4 text-slate-600">Redirecting...</Text>
    </View>
  );
}
