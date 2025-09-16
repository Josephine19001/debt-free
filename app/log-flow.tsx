import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { router, useLocalSearchParams } from 'expo-router';
import SubPageLayout from '@/components/layouts/sub-page';
import { useTheme } from '@/context/theme-provider';
import { FlowIcon, FlowLevels, type FlowLevel } from '@/components/icons/flow-icons';
import { useFlowForDate, useSaveFlow } from '@/lib/hooks/use-cycle-flo-style';

export default function LogFlowScreen() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const selectedDate = date ? new Date(date) : new Date();
  const dateString = selectedDate.toISOString().split('T')[0];
  
  const { isDark } = useTheme();
  const { data: existingFlowData, isLoading } = useFlowForDate(dateString);
  const saveFlowMutation = useSaveFlow();
  
  const [selectedFlow, setSelectedFlow] = useState<FlowLevel | null>(
    existingFlowData?.flow_level || null
  );
  const [notes, setNotes] = useState(existingFlowData?.notes || '');

  // Update state when data loads
  React.useEffect(() => {
    if (existingFlowData) {
      setSelectedFlow(existingFlowData.flow_level || null);
      setNotes(existingFlowData.notes || '');
    }
  }, [existingFlowData]);

  const flowOptions: FlowLevel[] = ['spotting', 'light', 'moderate', 'heavy'];

  const handleSave = async () => {
    if (!selectedFlow) {
      return;
    }

    try {
      await saveFlowMutation.mutateAsync({
        date: dateString,
        flow_level: selectedFlow,
        notes: notes.trim() || undefined,
      });
      router.back();
    } catch (error) {
      // Error handling is done in the mutation
      console.error('Failed to save flow data:', error);
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <SubPageLayout
        title="Log Flow"
        onBack={() => router.back()}
      >
        <View className="flex-1 justify-center items-center">
          <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading...
          </Text>
        </View>
      </SubPageLayout>
    );
  }

  return (
    <SubPageLayout
      title="Log Flow"
      onBack={() => router.back()}
      rightElement={
        <TouchableOpacity
          onPress={handleSave}
          disabled={!selectedFlow || saveFlowMutation.isPending}
          className={`px-4 py-2 rounded-full ${
            selectedFlow && !saveFlowMutation.isPending
              ? isDark
                ? 'bg-pink-600'
                : 'bg-pink-500'
              : isDark
              ? 'bg-gray-700'
              : 'bg-gray-300'
          }`}
        >
          <Text
            className={`font-medium ${
              selectedFlow && !saveFlowMutation.isPending
                ? 'text-white'
                : isDark
                ? 'text-gray-400'
                : 'text-gray-500'
            }`}
          >
            {saveFlowMutation.isPending ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      }
    >
      <View className="flex-1 px-4 py-6">
        {/* Date Header */}
        <View className="mb-8">
          <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {formatDate(selectedDate)}
          </Text>
          <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
            Track your flow intensity
          </Text>
        </View>

        {/* Flow Level Selection */}
        <View className="mb-8">
          <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Flow Level
          </Text>
          
          <View className="space-y-3">
            {flowOptions.map((level) => (
              <TouchableOpacity
                key={level}
                onPress={() => setSelectedFlow(level)}
                className={`flex-row items-center p-4 rounded-xl border-2 ${
                  selectedFlow === level
                    ? isDark
                      ? 'bg-pink-900/30 border-pink-600'
                      : 'bg-pink-50 border-pink-500'
                    : isDark
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                }`}
              >
                <View className="mr-4">
                  <FlowIcon level={level} size={24} />
                </View>
                
                <View className="flex-1">
                  <Text
                    className={`text-base font-medium ${
                      selectedFlow === level
                        ? isDark
                          ? 'text-pink-100'
                          : 'text-pink-900'
                        : isDark
                        ? 'text-gray-200'
                        : 'text-gray-900'
                    }`}
                  >
                    {FlowLevels[level]}
                  </Text>
                </View>
                
                {selectedFlow === level && (
                  <View
                    className={`w-6 h-6 rounded-full items-center justify-center ${
                      isDark ? 'bg-pink-600' : 'bg-pink-500'
                    }`}
                  >
                    <View className="w-2 h-2 rounded-full bg-white" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes Section */}
        <View className="mb-8">
          <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Notes (Optional)
          </Text>
          
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any additional details about your flow..."
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            multiline
            numberOfLines={4}
            className={`p-4 rounded-xl border text-base ${
              isDark
                ? 'bg-gray-800 border-gray-700 text-gray-100'
                : 'bg-white border-gray-200 text-gray-900'
            }`}
            style={{ textAlignVertical: 'top' }}
          />
        </View>
      </View>
    </SubPageLayout>
  );
}