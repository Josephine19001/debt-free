import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { Sparkles, Heart, Calendar } from 'lucide-react-native';
import { PlannedExerciseItem } from './planned-exercise-item';

interface PlannedWorkoutsSectionProps {
  currentWeeklyPlan?: any;
  selectedDate: Date;
  isLoading: boolean;
  onGeneratePlan?: () => void;
}

export function PlannedWorkoutsSection({
  currentWeeklyPlan,
  selectedDate,
  isLoading,
  onGeneratePlan,
}: PlannedWorkoutsSectionProps) {
  // Get today's workout from weekly plan
  const getTodaysWorkoutFromPlan = () => {
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

  const todaysPlannedWorkout = getTodaysWorkoutFromPlan();

  if (isLoading) {
    return (
      <View className="mx-4 mb-6">
        <View className="h-6 bg-gray-200 rounded w-40 mb-4" />
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
          <View className="bg-gray-100 rounded-2xl p-4 mb-4">
            <View className="h-6 bg-gray-200 rounded w-32 mb-2" />
            <View className="h-4 bg-gray-200 rounded w-48" />
          </View>
          <View className="gap-2 mb-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <View key={index} className="bg-gray-50 rounded-xl p-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="h-4 bg-gray-200 rounded w-24 mb-1" />
                    <View className="h-3 bg-gray-200 rounded w-16" />
                  </View>
                  <View className="h-6 w-6 bg-gray-200 rounded" />
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
      <Text className="text-xl font-bold text-gray-900 mb-4">Planned Workouts</Text>

      {!currentWeeklyPlan ? (
        /* No Weekly Plan - Show Generate Button */
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50 items-center">
          <View className="w-16 h-16 rounded-2xl bg-purple-50 items-center justify-center mb-3">
            <Sparkles size={24} color="#8B5CF6" />
          </View>
          <Text className="text-gray-900 text-lg font-semibold mb-2">No Weekly Plan</Text>
          <Text className="text-gray-600 text-center mb-4">
            Generate a personalized weekly workout plan to see today's planned exercises
          </Text>
          <TouchableOpacity onPress={onGeneratePlan} className="bg-purple-500 px-6 py-3 rounded-xl">
            <Text className="text-white font-medium">Generate Weekly Plan</Text>
          </TouchableOpacity>
        </View>
      ) : todaysPlannedWorkout?.is_rest_day ? (
        /* Rest Day Display */
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50 items-center">
          <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-3">
            <Heart size={24} color="#10B981" />
          </View>
          <Text className="text-green-700 text-lg font-semibold mb-2">Rest Day</Text>
          <Text className="text-gray-600 text-center mb-4">
            Take a break and let your body recover
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/log-exercise')}
            className="bg-green-500 px-4 py-2 rounded-xl"
          >
            <Text className="text-white font-medium">Log Optional Exercise</Text>
          </TouchableOpacity>
        </View>
      ) : todaysPlannedWorkout?.exercises && todaysPlannedWorkout.exercises.length > 0 ? (
        /* Planned Exercises Display */
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
          <View style={{ gap: 12 }}>
            {todaysPlannedWorkout.exercises.map((exercise: any, index: number) => (
              <PlannedExerciseItem
                key={`planned-${index}`}
                exercise={exercise}
                planId={currentWeeklyPlan.id}
                selectedDate={selectedDate}
              />
            ))}
          </View>
        </View>
      ) : (
        /* No Planned Workouts for Today */
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50 items-center">
          <View className="w-16 h-16 rounded-2xl bg-gray-50 items-center justify-center mb-3">
            <Calendar size={24} color="#6B7280" />
          </View>
          <Text className="text-gray-600 text-center mb-3">No planned workout for today</Text>
          <Text className="text-gray-500 text-center text-sm mb-4">
            {selectedDate.toDateString() === new Date().toDateString()
              ? 'You can still log any exercises you do'
              : 'This date had no planned exercises'}
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/log-exercise')}
            className="bg-purple-500 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-medium">Log Exercise</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
