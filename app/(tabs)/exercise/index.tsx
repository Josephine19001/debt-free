import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Text } from '@/components/ui/text';

import PageLayout from '@/components/layouts/page-layout';
import { router } from 'expo-router';
import { Plus, Sparkles, Calendar, Timer, Flame, Dumbbell, TrendingUp } from 'lucide-react-native';
import WeeklyCalendar from '@/components/nutrition/weekly-calendar';
import { ExerciseSummaryCard } from '@/components/exercise/exercise-summary-card';
import { WeeklyPlanDisplay } from '@/components/exercise/weekly-plan-display';
import {
  CycleAwarePlanSkeleton,
  WeeklyPlanSectionSkeleton,
} from '@/components/exercise/exercise-skeleton';
import { useDailyExerciseSummary } from '@/lib/hooks/use-exercise-summary';
import { usePlannedWorkoutSummary } from '@/lib/hooks/use-planned-workout-summary';
import { useExerciseEntries } from '@/lib/hooks/use-exercise-tracking';
import { useExerciseStreak } from '@/lib/hooks/use-exercise-streak';
import { useExerciseLoggedDates } from '@/lib/hooks/use-exercise-logged-dates';
import { useFitnessGoals } from '@/lib/hooks/use-fitness-goals';
import { useBodyMeasurements } from '@/lib/hooks/use-weight-tracking';
import { useCurrentCyclePhase } from '@/lib/hooks/use-cycle-settings';
import {
  useGenerateWeeklyExercisePlan,
  useCurrentWeeklyPlan,
} from '@/lib/hooks/use-weekly-exercise-planner';
import { useQueryClient } from '@tanstack/react-query';
import { useExercisePlanData } from '@/lib/hooks/use-exercise-plan-data';

// Import new components
import { TodaysWorkoutSection } from '@/components/exercise/todays-workout-section';
import { LoggedWorkoutsSection } from '@/components/exercise/logged-workouts-section';

export default function ExerciseScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showWeeklyPlan, setShowWeeklyPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const queryClient = useQueryClient();

  // Force refresh when new exercises are added
  useEffect(() => {
    const interval = setInterval(() => {
      // Refresh exercise data every 5 seconds to catch new entries immediately
      queryClient.invalidateQueries({ queryKey: ['exerciseEntries'] });
      queryClient.invalidateQueries({ queryKey: ['dailyExerciseSummary'] });
    }, 5000);

    return () => clearInterval(interval);
  }, [queryClient]);

  // Format date for API calls (avoid timezone issues)
  const dateString =
    selectedDate.getFullYear() +
    '-' +
    String(selectedDate.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(selectedDate.getDate()).padStart(2, '0');

  // Data fetching hooks
  const { data: dailySummary, isLoading: summaryLoading } = useDailyExerciseSummary(dateString);
  const { data: exerciseEntries, isLoading: entriesLoading } = useExerciseEntries(dateString);
  const { data: exerciseStreak } = useExerciseStreak();
  const { data: loggedDates } = useExerciseLoggedDates();
  const { data: currentWeeklyPlan } = useCurrentWeeklyPlan();
  const generateWeeklyPlan = useGenerateWeeklyExercisePlan();

  // Get all plan generation data from our centralized hook
  const { planGenerationData, fitnessGoals, bodyMeasurements, currentCyclePhase } =
    useExercisePlanData();

  const plannedSummary = usePlannedWorkoutSummary(currentWeeklyPlan, selectedDate);

  const isLoading = summaryLoading || entriesLoading;

  const handleDateSelect = (date: Date) => {
    if (date.toDateString() === selectedDate.toDateString()) {
      return;
    }
    setSelectedDate(date);
  };

  // Get logged dates for calendar indicators
  const getLoggedDates = (): string[] => {
    return loggedDates || [];
  };

  const handleSavePlan = async (plan: any) => {
    // Save the plan using the current plan generation data
    try {
      await generateWeeklyPlan.mutateAsync({
        plan_data: planGenerationData,
        start_date: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to save plan:', error);
    }
  };

  const handleRegeneratePlan = async (context: string) => {
    try {
      // Add the additional context to the fitness goals
      const enhancedPlanData = {
        ...planGenerationData,
        fitness_goals: {
          ...planGenerationData.fitness_goals,
          additional_context: context,
        },
      };

      const result = await generateWeeklyPlan.mutateAsync({
        plan_data: enhancedPlanData,
        start_date: new Date().toISOString(),
      });

      if (result?.plan) {
        setGeneratedPlan(result.plan);
        setShowWeeklyPlan(true);
      }
    } catch (error) {
      console.error('Failed to regenerate plan:', error);
    }
  };

  return (
    <PageLayout
      title="Workouts"
      theme="exercise"
      btn={
        <View className="flex-row items-center">
          {/* Streak Display */}
          <View className="flex-row items-center mr-3">
            <View className="w-8 h-8 rounded-full items-center justify-center bg-orange-100 mr-2">
              <Flame size={16} color="#F59E0B" />
            </View>
            <Text className="text-gray-700 text-sm font-semibold">
              {exerciseStreak?.currentStreak || 0}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/log-exercise')}
            className="bg-purple-500 w-10 h-10 rounded-full items-center justify-center"
          >
            <Plus size={20} color="white" />
          </TouchableOpacity>
        </View>
      }
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Weekly Calendar */}
        <WeeklyCalendar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          loggedDates={getLoggedDates()}
          theme="exercise"
        />

        {/* Exercise Summary Card */}
        <ExerciseSummaryCard dailySummary={dailySummary} isLoading={isLoading} />
        {/* <TodaysWorkoutSection
          currentWeeklyPlan={currentWeeklyPlan}
          exerciseEntries={exerciseEntries}
          isLoading={isLoading}
          selectedDate={selectedDate}
        /> */}

        {/* Weekly Plan Section */}
        {isLoading ? (
          <WeeklyPlanSectionSkeleton />
        ) : (
          <WeeklyPlanSection
            fitnessGoals={fitnessGoals}
            bodyMeasurements={bodyMeasurements}
            currentCyclePhase={currentCyclePhase}
            currentWeeklyPlan={currentWeeklyPlan}
            planGenerationData={planGenerationData}
            onShowPlan={(plan) => {
              setGeneratedPlan(plan);
              setShowWeeklyPlan(true);
              // Refresh the current weekly plan data
              queryClient.invalidateQueries({ queryKey: ['weeklyExercisePlans', 'current'] });
            }}
          />
        )}

        {/* Logged Workouts Section - Separate section for logged exercises */}
        <LoggedWorkoutsSection
          exerciseEntries={exerciseEntries}
          currentWeeklyPlan={currentWeeklyPlan}
          isLoading={isLoading}
          selectedDate={selectedDate}
          onNavigateToLogExercise={() => router.push('/log-exercise')}
        />
      </ScrollView>

      {/* Weekly Plan Modal */}
      {generatedPlan && (
        <WeeklyPlanDisplay
          plan={generatedPlan}
          onClose={() => {
            setShowWeeklyPlan(false);
            setGeneratedPlan(null);
          }}
          onSave={handleSavePlan}
          onRegenerate={handleRegeneratePlan}
        />
      )}
    </PageLayout>
  );
}

// Cycle-Aware Plan Component
function CycleAwarePlan({ cyclePhase, fitnessGoals }: { cyclePhase: any; fitnessGoals: any }) {
  const getPhaseColor = () => {
    switch (cyclePhase.phase) {
      case 'menstrual':
        return '#DC2626';
      case 'follicular':
        return '#059669';
      case 'ovulatory':
        return '#F59E0B';
      case 'luteal':
        return '#8B5CF6';
      default:
        return '#8B5CF6';
    }
  };

  const getPhaseEmojis = () => {
    switch (cyclePhase.phase) {
      case 'menstrual':
        return ['🧘‍♀️', '🚶‍♀️', '🛁'];
      case 'follicular':
        return ['💪', '🏃‍♀️', '🏋️‍♀️'];
      case 'ovulatory':
        return ['🔥', '🤸‍♀️', '🏃‍♀️'];
      case 'luteal':
        return ['🧘‍♀️', '🏊‍♀️', '🚴‍♀️'];
      default:
        return ['💪', '🏃‍♀️', '🧘‍♀️'];
    }
  };

  return (
    <View className="mx-4 mb-6">
      <View
        className="rounded-3xl p-6 shadow-lg"
        style={{
          backgroundColor: 'white',
          shadowColor: getPhaseColor(),
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <View className="flex-row items-center mb-4">
          <View
            className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
            style={{ backgroundColor: `${getPhaseColor()}20` }}
          >
            <Calendar size={24} color={getPhaseColor()} />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900">
              {cyclePhase.name} - Day {cyclePhase.day_in_cycle}
            </Text>
            <Text className="text-sm font-medium" style={{ color: getPhaseColor() }}>
              {cyclePhase.energy_level === 'high'
                ? 'High Energy Period'
                : cyclePhase.energy_level === 'medium'
                  ? 'Moderate Energy'
                  : 'Rest & Recovery'}
            </Text>
          </View>
        </View>

        <Text className="text-gray-700 mb-4 leading-relaxed">
          {cyclePhase.energy_level === 'high'
            ? 'Perfect time for challenging workouts! Your energy and strength are naturally high.'
            : cyclePhase.energy_level === 'medium'
              ? 'Good time for moderate workouts and strength training.'
              : 'Focus on gentle movement and recovery. Listen to your body.'}
        </Text>

        <View className="flex-row gap-3">
          {getPhaseEmojis().map((emoji, index) => (
            <View key={index} className="bg-gray-50 rounded-2xl px-4 py-3 flex-1 items-center">
              <Text className="text-2xl mb-1">{emoji}</Text>
              <Text className="text-sm font-semibold text-gray-800">
                {cyclePhase.recommended_exercises[index] || 'Exercise'}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// Weekly Plan Section Component
function WeeklyPlanSection({
  fitnessGoals,
  bodyMeasurements,
  currentCyclePhase,
  currentWeeklyPlan,
  planGenerationData,
  onShowPlan,
}: {
  fitnessGoals: any;
  bodyMeasurements: any;
  currentCyclePhase: any;
  currentWeeklyPlan: any;
  planGenerationData: any;
  onShowPlan: (plan: any) => void;
}) {
  const generateWeeklyPlan = useGenerateWeeklyExercisePlan();

  // Check if we should show the generate button (only on day before plan ends)
  const shouldShowGenerateButton = () => {
    if (!currentWeeklyPlan) return true; // No plan exists, always show

    const today = new Date();
    const planEndDate = new Date(currentWeeklyPlan.end_date);

    // Normalize dates to compare just the date part (ignore time)
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const planEndDateOnly = new Date(
      planEndDate.getFullYear(),
      planEndDate.getMonth(),
      planEndDate.getDate()
    );

    // Calculate the day before plan ends
    const dayBeforePlanEnds = new Date(planEndDateOnly);
    dayBeforePlanEnds.setDate(planEndDateOnly.getDate() - 1);

    // Show button only if today is the day before the plan ends
    return todayDateOnly.getTime() === dayBeforePlanEnds.getTime();
  };

  const handleGeneratePlan = () => {
    // Start new plan from the day after current plan ends (or tomorrow if no current plan)
    let startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // Default to tomorrow

    if (currentWeeklyPlan) {
      // Start from the day after current plan ends
      const planEndDate = new Date(currentWeeklyPlan.end_date);
      startDate = new Date(planEndDate);
      startDate.setDate(planEndDate.getDate() + 1);
    }

    // Start the generation process (non-blocking)
    console.log('Plan generation data:', planGenerationData);
    generateWeeklyPlan.mutate(
      {
        plan_data: planGenerationData,
        start_date: startDate.toISOString(),
      },
      {
        onSuccess: (result) => {
          onShowPlan(result.plan);
        },
        onError: (error) => {
          console.error('Failed to generate weekly plan:', error);
          alert(
            `❌ Failed to generate weekly plan\n\n${error instanceof Error ? error.message : 'Please try again later'}`
          );
        },
      }
    );
  };

  const handleViewCurrentPlan = () => {
    if (currentWeeklyPlan?.plan_data) {
      onShowPlan(currentWeeklyPlan.plan_data);
    }
  };

  return (
    <View className="mx-4 mb-6">
      {/* Current Plan Display */}
      {currentWeeklyPlan && (
        <View
          className="rounded-3xl p-6 mb-4"
          style={{
            backgroundColor: 'white',
            shadowColor: '#8B5CF6',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 8,
          }}
        >
          {/* Header with gradient background */}
          <View
            className="rounded-2xl p-4 mb-4"
            style={{
              backgroundColor: '#8B5CF6',
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
                  {currentWeeklyPlan.plan_name}
                </Text>
                <Text className="text-sm mt-1" style={{ color: '#E9D5FF' }}>
                  {new Date(currentWeeklyPlan.start_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  -{' '}
                  {new Date(currentWeeklyPlan.end_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleViewCurrentPlan}
                className="px-4 py-2 rounded-xl"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                }}
              >
                <Text className="font-semibold" style={{ color: '#FFFFFF' }}>
                  View Plan
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Enhanced Stats Grid */}
          <View className="flex-row justify-between">
            <View className="flex-1 bg-purple-50 rounded-2xl p-4 mr-2">
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center">
                  <Dumbbell size={16} color="#8B5CF6" />
                </View>
              </View>
              <Text className="text-purple-600 text-xs font-semibold uppercase tracking-wide mb-1">
                Workouts
              </Text>
              <Text className="text-purple-900 text-lg font-bold" numberOfLines={1}>
                {currentWeeklyPlan.plan_data?.weekly_goals?.total_workouts || 0}
              </Text>
            </View>

            <View className="flex-1 bg-blue-50 rounded-2xl p-4 mx-1">
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                  <Timer size={16} color="#3B82F6" />
                </View>
              </View>
              <Text className="text-blue-600 text-xs font-semibold uppercase tracking-wide mb-1">
                Duration
              </Text>
              <Text className="text-blue-900 text-lg font-bold" numberOfLines={1}>
                {currentWeeklyPlan.total_duration_minutes}min
              </Text>
            </View>

            <View className="flex-1 bg-orange-50 rounded-2xl p-4 ml-2">
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 bg-orange-100 rounded-full items-center justify-center">
                  <Flame size={16} color="#F59E0B" />
                </View>
              </View>
              <Text className="text-orange-600 text-xs font-semibold uppercase tracking-wide mb-1">
                Calories
              </Text>
              <Text className="text-orange-900 text-lg font-bold" numberOfLines={1}>
                {currentWeeklyPlan.estimated_calories}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Generate New Plan Button - Only show on last day of current plan */}
      {shouldShowGenerateButton() && (
        <TouchableOpacity
          onPress={handleGeneratePlan}
          disabled={generateWeeklyPlan.isPending}
          className="rounded-2xl p-4"
          style={{
            backgroundColor: generateWeeklyPlan.isPending ? '#9CA3AF' : '#8B5CF6',
            shadowColor: '#8B5CF6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 6,
          }}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <Sparkles size={20} color="white" />
                <Text className="text-lg font-bold ml-3" style={{ color: '#FFFFFF' }}>
                  {generateWeeklyPlan.isPending
                    ? 'Creating Your Plan...'
                    : 'Generate New Weekly Plan'}
                </Text>
              </View>

              <Text className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                {generateWeeklyPlan.isPending
                  ? 'We are creating your personalized workout plan...'
                  : 'Get a personalized 7-day workout plan tailored to your goals, cycle phase, and fitness level'}
              </Text>
            </View>

            <View className="ml-4">
              {generateWeeklyPlan.isPending ? (
                <View className="animate-spin">
                  <Timer size={24} color="white" />
                </View>
              ) : (
                <TrendingUp size={24} color="white" />
              )}
            </View>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}
