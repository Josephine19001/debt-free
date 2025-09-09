import { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { Clock, Heart, X, Save, RotateCcw, MessageSquare } from 'lucide-react-native';

interface WeeklyPlanProps {
  plan: {
    plan_name: string;
    plan_description?: string;
    days: Array<{
      date: string;
      day_name: string;
      is_rest_day: boolean;
      workout_type: string;
      duration_minutes: number;
      intensity?: 'low' | 'moderate' | 'high';
      exercises: Array<{
        name: string;
        category?: string;
        duration_minutes: number;
        sets?: number;
        reps?: string;
        calories_estimate: number;
        instructions: string;
      }>;
      rest_day_activities?: string[];
      daily_tips?: string[];
    }>;
    weekly_goals: {
      total_workouts: number;
      total_minutes: number;
      estimated_calories: number;
      focus_areas?: string[];
    };
    safety_reminders?: string[];
  };
  onClose: () => void;
  onSave?: (plan: any) => void;
  onRegenerate?: (context: string) => void;
}

export function WeeklyPlanDisplay({ plan, onClose, onSave, onRegenerate }: WeeklyPlanProps) {
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [regenerateContext, setRegenerateContext] = useState('');

  const handleDayPress = (day: any) => {
    if (day.is_rest_day) {
      alert('🛌 Rest Day\n\nTake a break today! Your body needs recovery.');
    } else if (day.exercises.length === 0) {
      alert('💪 No workout planned\n\nThis day is free - consider light activity or rest.');
    } else {
      // Show workout details
      const exerciseList = day.exercises
        .map((ex: any) => `• ${ex.name} (${ex.duration_minutes}min)`)
        .join('\n');
      alert(
        `🏋️ ${day.workout_type}\n\n${exerciseList}\n\nDuration: ${day.duration_minutes} minutes`
      );
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(plan);
      Alert.alert('Success', 'Weekly plan has been saved!', [{ text: 'OK', onPress: onClose }]);
    } else {
      Alert.alert('Error', 'Save functionality is not available.');
    }
  };

  const handleRegenerateRequest = () => {
    if (regenerateContext.trim()) {
      if (onRegenerate) {
        onRegenerate(regenerateContext.trim());
        setShowRegenerateModal(false);
        setRegenerateContext('');
        onClose();
      }
    } else {
      Alert.alert('Context Required', 'Please provide some context for what you want to focus on.');
    }
  };

  return (
    <Modal visible={true} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl flex-1 max-h-[90%]">
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-gray-100">
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900">{plan.plan_name}</Text>
              <Text className="text-purple-600 text-sm mt-1">7-Day Plan</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2">
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* Weekly Summary */}
            <View className="my-6 p-4 bg-purple-50 rounded-2xl">
              <View className="flex-row justify-between">
                <View className="items-center">
                  <Text className="text-purple-600 text-xs uppercase font-medium">Workouts</Text>
                  <Text className="text-purple-900 text-base font-bold" numberOfLines={1}>
                    {plan.weekly_goals.total_workouts}
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-purple-600 text-xs uppercase font-medium">Duration</Text>
                  <Text className="text-purple-900 text-base font-bold" numberOfLines={1}>
                    {plan.weekly_goals.total_minutes}min
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-purple-600 text-xs uppercase font-medium">Calories</Text>
                  <Text className="text-purple-900 text-base font-bold" numberOfLines={1}>
                    {plan.weekly_goals.estimated_calories}
                  </Text>
                </View>
              </View>
            </View>

            {/* Daily Plans - Simple Grid */}
            {plan.days.map((day, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleDayPress(day)}
                className="mb-3 p-4 bg-gray-50 rounded-2xl"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-gray-900 font-bold">{day.day_name}</Text>
                    <Text className="text-gray-600 text-sm">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    {day.is_rest_day ? (
                      <>
                        <Heart size={16} color="#10B981" />
                        <Text className="text-green-700 text-sm ml-1">Rest</Text>
                      </>
                    ) : day.exercises.length > 0 ? (
                      <View className="items-end">
                        <View className="flex-row items-center">
                          <Clock size={16} color="#8B5CF6" />
                          <Text className="text-purple-700 text-sm ml-1 font-medium">
                            {day.duration_minutes}min
                          </Text>
                        </View>
                        <Text className="text-gray-600 text-sm mt-1">{day.workout_type}</Text>
                        {day.exercises.length > 0 && (
                          <Text className="text-gray-500 text-xs mt-1">
                            {day.exercises[0].name}
                          </Text>
                        )}
                      </View>
                    ) : (
                      <Text className="text-gray-400 text-sm">Free day</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Action Buttons */}
          <View className="p-6 pt-4 border-t border-gray-100 bg-white">
            <View className="flex-row gap-3">
              {/* <TouchableOpacity
                onPress={() => setShowRegenerateModal(true)}
                className="flex-1 bg-gray-100 py-4 rounded-xl flex-row items-center justify-center"
              >
                <RotateCcw size={16} color="#6B7280" />
                <Text className="text-gray-700 font-semibold ml-2">Regenerate</Text>
              </TouchableOpacity> */}
              <TouchableOpacity
                onPress={handleSave}
                className="flex-1 bg-purple-500 py-4 rounded-xl flex-row items-center justify-center"
              >
                <Save size={16} color="white" />
                <Text className="text-white font-semibold ml-2">Save Plan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Regenerate Context Modal */}
      {/* <Modal visible={showRegenerateModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6"> */}
      {/* <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">Regenerate Plan</Text>
              <TouchableOpacity onPress={() => setShowRegenerateModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View> */}

      {/* <View className="mb-6">
              <Text className="text-gray-700 mb-3">
                What would you like to focus on in your new plan?
              </Text>
              <View className="bg-purple-50 rounded-xl p-4 mb-4">
                <View className="flex-row items-center mb-2">
                  <MessageSquare size={16} color="#8B5CF6" />
                  <Text className="text-purple-900 font-medium ml-2">Examples:</Text>
                </View>
                <Text className="text-purple-800 text-sm leading-relaxed">
                  • "More cardio workouts"{'\n'}• "Focus on upper body strength"{'\n'}• "Add yoga
                  and flexibility"{'\n'}• "Shorter 20-minute workouts"{'\n'}• "Target core and abs"
                </Text>
              </View>
              <TextInput
                value={regenerateContext}
                onChangeText={setRegenerateContext}
                placeholder="Describe what you want to focus on..."
                multiline
                numberOfLines={4}
                className="bg-gray-50 rounded-xl p-4 text-gray-900 text-base"
                textAlignVertical="top"
              />
            </View> */}

      {/* <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowRegenerateModal(false)}
                className="flex-1 bg-gray-100 py-4 rounded-xl"
              >
                <Text className="text-gray-700 font-semibold text-center">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRegenerateRequest}
                className="flex-1 bg-purple-500 py-4 rounded-xl flex-row items-center justify-center"
              >
                <RotateCcw size={16} color="white" />
                <Text className="text-white font-semibold ml-2">Generate New Plan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal> */}
    </Modal>
  );
}
