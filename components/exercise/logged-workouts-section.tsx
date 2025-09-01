import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import {
  Edit3,
  X,
  Save,
  Dumbbell,
  Heart,
  Bike,
  Waves,
  RotateCcw,
  Zap,
  TreePine,
  Eye,
  CheckCircle,
  Clock,
  Flame,
} from 'lucide-react-native';
import {
  useDeleteExerciseEntry,
  useUpdateExerciseEntry,
  useCreateExerciseEntry,
} from '@/lib/hooks/use-exercise-tracking';
import { Button } from '../ui';

// Exercise type icons mapping
const getExerciseIcon = (exerciseType: string) => {
  const type = exerciseType.toLowerCase();
  switch (type) {
    case 'cardio':
    case 'running':
    case 'jogging':
      return Heart;
    case 'strength':
    case 'weightlifting':
    case 'resistance':
      return Dumbbell;
    case 'cycling':
    case 'bike':
      return Bike;
    case 'swimming':
      return Waves;
    case 'yoga':
    case 'stretching':
    case 'flexibility':
      return RotateCcw;
    case 'hiit':
    case 'interval':
      return Zap;
    case 'outdoor':
    case 'hiking':
      return TreePine;
    default:
      return Dumbbell;
  }
};

const getExerciseColor = (exerciseType: string) => {
  const type = exerciseType.toLowerCase();
  switch (type) {
    case 'cardio':
    case 'running':
    case 'jogging':
      return '#DC2626'; // Red
    case 'strength':
    case 'weightlifting':
    case 'resistance':
      return '#8B5CF6'; // Purple
    case 'cycling':
    case 'bike':
      return '#059669'; // Green
    case 'swimming':
      return '#0891B2'; // Cyan
    case 'yoga':
    case 'stretching':
    case 'flexibility':
      return '#7C3AED'; // Violet
    case 'hiit':
    case 'interval':
      return '#F59E0B'; // Orange
    case 'outdoor':
    case 'hiking':
      return '#059669'; // Green
    default:
      return '#8B5CF6'; // Purple
  }
};

interface LoggedWorkoutsSectionProps {
  exerciseEntries?: any[];
  currentWeeklyPlan?: any;
  isLoading: boolean;
  selectedDate: Date;
}

export function LoggedWorkoutsSection({
  exerciseEntries,
  currentWeeklyPlan,
  isLoading,
  selectedDate,
}: LoggedWorkoutsSectionProps) {
  const [editingExercise, setEditingExercise] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingExercise, setViewingExercise] = useState<any>(null);

  const deleteExerciseEntry = useDeleteExerciseEntry();
  const updateExerciseEntry = useUpdateExerciseEntry();
  const createExerciseEntry = useCreateExerciseEntry();

  const handleDeleteExercise = (exerciseId: string) => {
    Alert.alert('Delete Exercise', 'Are you sure you want to delete this exercise?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteExerciseEntry.mutate(exerciseId);
          setShowEditModal(false);
        },
      },
    ]);
  };

  const handleEditExercise = (exercise: any) => {
    setEditingExercise(exercise);
    setShowEditModal(true);
  };

  const handleViewExercise = (exercise: any) => {
    setViewingExercise(exercise);
    setShowViewModal(true);
  };

  const handleMarkDone = (exercise: any) => {
    const exerciseData = {
      exercise_name: exercise.name,
      exercise_type: exercise.category || 'General',
      duration_minutes: exercise.duration_minutes,
      calories_burned: exercise.calories_estimate || 0,
      intensity: 'moderate' as const,
      notes: `Completed from weekly plan: ${exercise.instructions}`,
      logged_date:
        selectedDate.getFullYear() +
        '-' +
        String(selectedDate.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(selectedDate.getDate()).padStart(2, '0'),
      logged_time: new Date().toTimeString().split(' ')[0],
    };

    createExerciseEntry.mutate(exerciseData);
  };

  // Get planned workouts for selected date
  const getTodaysPlannedWorkout = () => {
    if (!currentWeeklyPlan?.plan_data?.days) return null;

    const dateString =
      selectedDate.getFullYear() +
      '-' +
      String(selectedDate.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(selectedDate.getDate()).padStart(2, '0');

    const todaysWorkout = currentWeeklyPlan.plan_data.days.find(
      (day: any) => day.date === dateString
    );

    return todaysWorkout;
  };

  const todaysPlannedWorkout = getTodaysPlannedWorkout();
  const plannedExercises = todaysPlannedWorkout?.exercises || [];
  const allExercises = [...plannedExercises, ...(exerciseEntries || [])];

  if (isLoading) {
    return (
      <View className="mx-4 mb-6">
        <View className="h-6 bg-gray-200 rounded w-40 mb-4" />
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
          <View className="gap-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <View key={index} className="bg-gray-50 rounded-2xl p-4">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-1">
                    <View className="h-4 bg-gray-200 rounded w-32 mb-2" />
                    <View className="h-3 bg-gray-200 rounded w-24" />
                  </View>
                  <View className="h-4 w-4 bg-gray-200 rounded" />
                </View>
                <View className="flex-row justify-between">
                  <View className="items-center">
                    <View className="h-3 bg-gray-200 rounded w-12 mb-1" />
                    <View className="h-4 bg-gray-200 rounded w-8" />
                  </View>
                  <View className="items-center">
                    <View className="h-3 bg-gray-200 rounded w-12 mb-1" />
                    <View className="h-4 bg-gray-200 rounded w-8" />
                  </View>
                  <View className="items-center">
                    <View className="h-3 bg-gray-200 rounded w-12 mb-1" />
                    <View className="h-4 bg-gray-200 rounded w-8" />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="mx-4 mb-6">
      {/* <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-bold text-gray-900">Today's Workouts</Text>
        <TouchableOpacity onPress={() => router.push('/log-exercise')}>
          <Text className="text-purple-600 font-medium">Add Exercise</Text>
        </TouchableOpacity>
      </View> */}

      {allExercises.length > 0 ? (
        <View className="gap-3">
          {allExercises.map((exercise: any, index: number) => {
            const isPlanned = !exercise.id; // Logged exercises have IDs, planned don't
            const exerciseType = exercise.exercise_type || exercise.category || 'general';
            const exerciseName = exercise.exercise_name || exercise.name;
            const ExerciseIcon = getExerciseIcon(exerciseType);
            const exerciseColor = getExerciseColor(exerciseType);

            return (
              <View
                key={exercise.id || `planned-${index}`}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                      style={{ backgroundColor: `${exerciseColor}20` }}
                    >
                      <ExerciseIcon size={20} color={exerciseColor} />
                    </View>

                    <View className="flex-1">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-base font-semibold text-gray-900 mb-1">
                          {exerciseName}
                        </Text>
                        <View
                          className={`px-2 py-1 rounded-full ${
                            isPlanned ? 'bg-yellow-100' : 'bg-green-100'
                          }`}
                        >
                          <Text
                            className={`text-xs font-medium ${
                              isPlanned ? 'text-yellow-700' : 'text-green-700'
                            }`}
                          >
                            {isPlanned ? 'Planned' : 'Completed'}
                          </Text>
                        </View>
                        <View className="flex-row items-center" style={{ gap: 8 }}>
                          {isPlanned && (
                            <TouchableOpacity
                              onPress={() => handleViewExercise(exercise)}
                              className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center"
                            >
                              <Eye size={16} color="#3B82F6" />
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            onPress={() => handleEditExercise(exercise)}
                            className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                          >
                            <Edit3 size={16} color="#6B7280" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteExercise(exercise.id)}
                            className="w-8 h-8 bg-red-100 rounded-full items-center justify-center"
                          >
                            <X size={16} color="#DC2626" />
                          </TouchableOpacity>
                          {isPlanned && (
                            <TouchableOpacity
                              onPress={() => handleMarkDone(exercise)}
                              className="w-8 h-8 bg-green-100 rounded-full items-center justify-center"
                            >
                              <CheckCircle size={16} color="#10B981" />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm font-medium text-gray-500 capitalize">
                          {exerciseType}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Exercise breakdown */}
                <View className="flex-row justify-between pt-3 border-t border-gray-50">
                  <View className="items-center">
                    <Text className="text-xs text-gray-400">Duration</Text>
                    <Text className="text-sm font-medium text-gray-700">
                      {exercise.duration_minutes}m
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-xs text-gray-400">
                      {isPlanned ? 'Est. Calories' : 'Intensity'}
                    </Text>
                    <Text className="text-sm font-medium text-gray-700 capitalize">
                      {isPlanned
                        ? exercise.calories_estimate || 0
                        : exercise.intensity || 'moderate'}
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-xs text-gray-400">Calories</Text>
                    <Text className="text-sm font-medium text-gray-700">
                      {exercise.calories_burned || exercise.calories_estimate || 0}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        /* Empty State */
        <View className="bg-white rounded-2xl p-8 items-center shadow-sm border border-gray-50">
          <View className="w-16 h-16 bg-purple-100 rounded-full items-center justify-center mb-4">
            <Dumbbell size={24} color="#8B5CF6" />
          </View>
          <Text className="text-gray-500 text-center mb-2">
            No exercises planned or logged today
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/log-exercise')}
            className="bg-purple-500 px-4 py-2 rounded-xl"
          >
            <Text className="text-white font-medium">Log Your First Exercise</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Edit Exercise Modal - Similar to nutrition's edit modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">Edit Exercise</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {editingExercise && (
              <View>
                <View className="bg-purple-50 rounded-2xl p-4 mb-4">
                  <Text className="text-purple-900 text-lg font-bold">
                    {editingExercise.exercise_name}
                  </Text>
                  <Text className="text-purple-700 text-sm mt-1 capitalize">
                    {editingExercise.exercise_type}
                  </Text>
                </View>

                {/* Editable Values */}
                <View className="mb-6">
                  <View className="bg-gray-50 rounded-xl p-4">
                    <View className="flex-row gap-3 mb-4">
                      <View className="flex-1">
                        <Text className="text-gray-500 text-xs mb-2">Duration (min)</Text>
                        <TextInput
                          value={editingExercise.duration_minutes?.toString()}
                          onChangeText={(text) =>
                            setEditingExercise({
                              ...editingExercise,
                              duration_minutes: parseInt(text) || 0,
                            })
                          }
                          className="bg-white border border-slate-100 rounded-lg px-3 py-2 text-center font-medium text-base min-w-[70px]"
                          keyboardType="numeric"
                          selectTextOnFocus
                        />
                      </View>

                      <View className="flex-1">
                        <Text className="text-gray-500 text-xs mb-2">Calories</Text>
                        <TextInput
                          value={editingExercise.calories_burned?.toString()}
                          onChangeText={(text) =>
                            setEditingExercise({
                              ...editingExercise,
                              calories_burned: parseInt(text) || 0,
                            })
                          }
                          className="bg-white border border-slate-100 rounded-lg px-3 py-2 text-center font-medium text-base min-w-[70px]"
                          keyboardType="numeric"
                          selectTextOnFocus
                        />
                      </View>
                    </View>

                    <View className="mb-4">
                      <Text className="text-gray-500 text-xs mb-2">Notes</Text>
                      <TextInput
                        value={editingExercise.notes || ''}
                        onChangeText={(text) =>
                          setEditingExercise({
                            ...editingExercise,
                            notes: text,
                          })
                        }
                        className="bg-white border border-slate-100 rounded-lg px-3 py-3"
                        placeholder="Add notes..."
                        multiline
                        numberOfLines={3}
                      />
                    </View>
                  </View>
                </View>
                <Button
                  title="Save Changes"
                  onPress={() => {
                    updateExerciseEntry.mutate({
                      id: editingExercise.id,
                      data: {
                        duration_minutes: editingExercise.duration_minutes,
                        calories_burned: editingExercise.calories_burned,
                        notes: editingExercise.notes,
                      },
                    });
                    setShowEditModal(false);
                    setEditingExercise(null);
                  }}
                  variant="primary"
                  size="large"
                />
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* View Exercise Details Modal */}
      <Modal visible={showViewModal} animationType="slide" transparent>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-6 m-4 max-w-sm w-full">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900">Exercise Details</Text>
              <TouchableOpacity onPress={() => setShowViewModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {viewingExercise && (
              <View>
                <View className="bg-purple-50 rounded-2xl p-4 mb-4">
                  <Text className="text-purple-900 text-lg font-bold">{viewingExercise.name}</Text>
                  <Text className="text-purple-700 text-sm mt-1 capitalize">
                    {viewingExercise.category}
                  </Text>
                </View>

                <View className="flex-row gap-4 mb-4">
                  <View className="flex-1 bg-gray-50 rounded-xl p-3 items-center">
                    <Clock size={16} color="#6B7280" />
                    <Text className="text-gray-500 text-xs mt-1">Duration</Text>
                    <Text className="text-gray-900 text-lg font-bold">
                      {viewingExercise.duration_minutes}m
                    </Text>
                  </View>
                  <View className="flex-1 bg-gray-50 rounded-xl p-3 items-center">
                    <Flame size={16} color="#F59E0B" />
                    <Text className="text-gray-500 text-xs mt-1">Est. Calories</Text>
                    <Text className="text-gray-900 text-lg font-bold">
                      {viewingExercise.calories_estimate || 0}
                    </Text>
                  </View>
                </View>

                {viewingExercise.instructions && (
                  <View className="bg-blue-50 rounded-xl p-4 mb-4">
                    <Text className="text-blue-900 font-semibold mb-2">Instructions</Text>
                    <Text className="text-blue-800 leading-relaxed">
                      {viewingExercise.instructions}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={() => {
                    setShowViewModal(false);
                    handleMarkDone(viewingExercise);
                  }}
                  className="bg-green-500 py-4 rounded-xl flex-row items-center justify-center"
                >
                  <CheckCircle size={16} color="white" />
                  <Text className="text-white font-semibold ml-2">Mark as Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
