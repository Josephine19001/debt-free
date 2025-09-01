import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { CheckCircle, Edit3, Eye, X, Save, Clock, Flame } from 'lucide-react-native';
import { useCreateExerciseEntry } from '@/lib/hooks/use-exercise-tracking';

interface PlannedExerciseItemProps {
  exercise: any;
  planId: string;
  selectedDate: Date;
}

export function PlannedExerciseItem({ exercise, planId, selectedDate }: PlannedExerciseItemProps) {
  const [isCompleted, setIsCompleted] = useState(exercise.completed || false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    duration_minutes: exercise.duration_minutes.toString(),
    calories_estimate: (exercise.calories_estimate || 0).toString(),
  });

  const createExerciseEntry = useCreateExerciseEntry();

  // Update completion state when exercise data changes
  useEffect(() => {
    setIsCompleted(exercise.completed || false);
  }, [exercise.completed]);

  const handleMarkDone = () => {
    // Prepare exercise data for logging
    const exerciseData = {
      exercise_name: exercise.name,
      exercise_type: exercise.category || 'General',
      duration_minutes: parseInt(editData.duration_minutes) || exercise.duration_minutes,
      calories_burned: parseInt(editData.calories_estimate) || exercise.calories_estimate || 0,
      intensity: 'moderate' as const,
      notes: `Completed from weekly plan: ${exercise.instructions}`,
      logged_date:
        new Date().getFullYear() +
        '-' +
        String(new Date().getMonth() + 1).padStart(2, '0') +
        '-' +
        String(new Date().getDate()).padStart(2, '0'),
      logged_time: new Date().toTimeString().split(' ')[0],
    };

    // Log the exercise directly to the database
    createExerciseEntry.mutate(exerciseData, {
      onSuccess: () => {
        setIsCompleted(true);
        // Mark the exercise as completed in the plan data locally
        exercise.completed = true;
      },
      onError: (error) => {
        console.error('Failed to log exercise:', error);
        Alert.alert('Error', 'Failed to log exercise. Please try again.');
      },
    });
  };

  const handleSaveEdit = () => {
    const duration = parseInt(editData.duration_minutes);
    const calories = parseInt(editData.calories_estimate);

    if (duration < 1 || duration > 180) {
      Alert.alert('Invalid Duration', 'Duration must be between 1 and 180 minutes');
      return;
    }

    if (calories < 0 || calories > 1000) {
      Alert.alert('Invalid Calories', 'Calories must be between 0 and 1000');
      return;
    }

    // Update the exercise data locally
    exercise.duration_minutes = duration;
    exercise.calories_estimate = calories;

    setShowEditModal(false);
    Alert.alert('Updated!', 'Exercise details have been updated');
  };

  return (
    <>
      <View
        className={`rounded-2xl border shadow-sm ${
          isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'
        }`}
      >
        {/* Exercise Info */}
        <View className="p-4">
          {/* Exercise Name & Action Icons */}
          <View className="flex-row items-start justify-between mb-3">
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text
                className={`text-lg font-bold ${
                  isCompleted ? 'text-green-800 line-through' : 'text-gray-900'
                }`}
                numberOfLines={1}
              >
                {exercise.name}
              </Text>
              <Text className="text-purple-600 text-sm font-medium" numberOfLines={1}>
                {exercise.category || 'Exercise'}
              </Text>
            </View>

            {/* Action Icons */}
            <View className="flex-row items-center" style={{ gap: 8 }}>
              {!isCompleted && (
                <>
                  {/* View Details Icon */}
                  <TouchableOpacity
                    onPress={() => setShowViewModal(true)}
                    className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                  >
                    <Eye size={16} color="#6B7280" />
                  </TouchableOpacity>

                  {/* Edit Icon */}
                  <TouchableOpacity
                    onPress={() => setShowEditModal(true)}
                    className="w-8 h-8 bg-blue-50 rounded-full items-center justify-center"
                  >
                    <Edit3 size={16} color="#3B82F6" />
                  </TouchableOpacity>

                  {/* Mark Done Icon */}
                  <TouchableOpacity
                    onPress={handleMarkDone}
                    disabled={createExerciseEntry.isPending}
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      createExerciseEntry.isPending ? 'bg-gray-400' : 'bg-purple-500'
                    }`}
                  >
                    <CheckCircle size={16} color="white" />
                  </TouchableOpacity>
                </>
              )}

              {isCompleted && (
                <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center">
                  <CheckCircle size={16} color="#10B981" />
                </View>
              )}
            </View>
          </View>

          {/* Stats Row */}
          <View className="flex-row items-center" style={{ gap: 16 }}>
            <View className="flex-row items-center">
              <Clock size={14} color="#8B5CF6" />
              <Text className="text-gray-700 text-sm font-medium ml-1">
                {exercise.duration_minutes} min
              </Text>
            </View>
            {exercise.calories_estimate > 0 && (
              <View className="flex-row items-center">
                <Flame size={14} color="#F59E0B" />
                <Text className="text-gray-700 text-sm font-medium ml-1">
                  {exercise.calories_estimate} cal
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* View Details Modal */}
      <Modal visible={showViewModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900">Exercise Details</Text>
              <TouchableOpacity onPress={() => setShowViewModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="bg-purple-50 rounded-2xl p-4 mb-4">
                <Text className="text-purple-900 text-lg font-bold">{exercise.name}</Text>
                <Text className="text-purple-700 text-sm mt-1">{exercise.category}</Text>
              </View>

              <View className="flex-row gap-4 mb-4">
                <View className="flex-1 bg-gray-50 rounded-xl p-3">
                  <Text className="text-gray-500 text-xs uppercase tracking-wide">Duration</Text>
                  <Text className="text-gray-900 text-lg font-bold">
                    {exercise.duration_minutes} min
                  </Text>
                </View>
                <View className="flex-1 bg-gray-50 rounded-xl p-3">
                  <Text className="text-gray-500 text-xs uppercase tracking-wide">Calories</Text>
                  <Text className="text-gray-900 text-lg font-bold">
                    {exercise.calories_estimate || 0}
                  </Text>
                </View>
              </View>

              {exercise.instructions && (
                <View className="bg-blue-50 rounded-xl p-4">
                  <Text className="text-blue-900 font-semibold mb-2">Instructions</Text>
                  <Text className="text-blue-800 leading-relaxed">{exercise.instructions}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">Edit Exercise</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Duration (minutes)</Text>
              <TextInput
                value={editData.duration_minutes}
                onChangeText={(text) => setEditData({ ...editData, duration_minutes: text })}
                placeholder="Enter duration"
                keyboardType="numeric"
                className="bg-gray-50 rounded-xl p-4 text-gray-900 text-lg"
              />
            </View>

            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-2">Estimated Calories</Text>
              <TextInput
                value={editData.calories_estimate}
                onChangeText={(text) => setEditData({ ...editData, calories_estimate: text })}
                placeholder="Enter calories"
                keyboardType="numeric"
                className="bg-gray-50 rounded-xl p-4 text-gray-900 text-lg"
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                className="flex-1 bg-gray-100 py-4 rounded-xl"
              >
                <Text className="text-gray-700 font-semibold text-center">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveEdit}
                className="flex-1 bg-purple-500 py-4 rounded-xl flex-row items-center justify-center"
              >
                <Save size={16} color="white" />
                <Text className="text-white font-semibold ml-2">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
