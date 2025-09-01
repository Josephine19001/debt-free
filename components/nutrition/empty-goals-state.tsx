import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { Target, Apple, Scale, Sparkles } from 'lucide-react-native';

interface EmptyGoalsStateProps {
  hasNutritionGoals: boolean;
  hasFitnessGoals: boolean;
  hasBodyMeasurements: boolean;
}

export function EmptyGoalsState({
  hasNutritionGoals,
  hasFitnessGoals,
  hasBodyMeasurements,
}: EmptyGoalsStateProps) {
  const incompleteGoals = [
    {
      id: 'nutrition',
      title: 'Nutrition Goals',
      description: 'Set your calorie and macro targets',
      icon: Apple,
      color: '#ec4899',
      backgroundColor: '#fdf2f8',
      route: '/settings/nutrition-goals',
      completed: hasNutritionGoals,
    },
    {
      id: 'fitness',
      title: 'Fitness Goals',
      description: 'Define your workout preferences',
      icon: Target,
      color: '#8b5cf6',
      backgroundColor: '#f3e8ff',
      route: '/settings/fitness-goals',
      completed: hasFitnessGoals,
    },
    {
      id: 'weight',
      title: 'Weight Tracking',
      description: 'Set your weight and health targets',
      icon: Scale,
      color: '#059669',
      backgroundColor: '#ecfdf5',
      route: '/settings/weight',
      completed: hasBodyMeasurements,
    },
  ].filter((goal) => !goal.completed);

  if (incompleteGoals.length === 0) {
    // All goals are set but we still have empty nutrition data
    return (
      <View className="px-4 py-8">
        <View className="bg-white rounded-2xl p-8 items-center shadow-sm border border-gray-100">
          <View
            className="w-16 h-16 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: '#fdf2f8' }}
          >
            <Apple size={32} color="#ec4899" />
          </View>
          <Text className="text-gray-900 font-semibold text-lg mb-2">No meals logged today</Text>
          <Text className="text-gray-500 text-center mb-6">
            Start tracking your nutrition journey!
          </Text>

          <View className="flex-row gap-3 w-full">
            <TouchableOpacity
              onPress={() => router.push('/log-meal')}
              className="flex-1 bg-pink-500 rounded-2xl p-3 items-center"
            >
              <Text className="text-white font-semibold">Log First Meal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/log-water')}
              className="flex-1 bg-blue-500 rounded-2xl p-3 items-center"
            >
              <Text className="text-white font-semibold">Add Water</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 px-4 py-8 justify-center">
      <View className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        {/* Header */}
        <View className="items-center mb-10">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-6"
            style={{ backgroundColor: '#fff7ed' }}
          >
            <Sparkles size={40} color="#ea580c" />
          </View>
          <Text className="text-gray-900 font-bold text-2xl mb-3">Complete Your Setup</Text>
          <Text className="text-gray-500 text-center text-base leading-6 px-4">
            Set up your goals to get personalized nutrition tracking and insights
          </Text>
        </View>

        {/* Goal Setting Buttons */}
        <View className="gap-4">
          {incompleteGoals.map((goal) => {
            const IconComponent = goal.icon;
            return (
              <TouchableOpacity
                key={goal.id}
                onPress={() => router.push(goal.route as any)}
                className="flex-row items-center p-5 rounded-2xl border border-gray-100 shadow-sm"
                style={{ backgroundColor: goal.backgroundColor }}
              >
                <View
                  className="w-14 h-14 rounded-2xl items-center justify-center mr-5"
                  style={{ backgroundColor: 'white' }}
                >
                  <IconComponent size={26} color={goal.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold text-lg">{goal.title}</Text>
                  <Text className="text-gray-600 text-base mt-2">{goal.description}</Text>
                </View>
                <View
                  className="w-10 h-10 rounded-full items-center justify-center shadow-sm"
                  style={{ backgroundColor: goal.color }}
                >
                  <Text className="text-white font-bold text-xl">+</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}
