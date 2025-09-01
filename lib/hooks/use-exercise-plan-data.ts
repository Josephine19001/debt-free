import { useFitnessGoals } from './use-fitness-goals';
import { useBodyMeasurements } from './use-weight-tracking';
import { useNutritionGoals } from './use-nutrition-goals';
import { useCurrentCyclePhase } from './use-cycle-settings';
import { useExerciseEntries } from './use-exercise-tracking';
import { useAccount } from './use-accounts';

/**
 * Centralized hook to get all data needed for AI exercise plan generation
 */
export function useExercisePlanData() {
  // Get all the data we need
  const { data: fitnessGoals } = useFitnessGoals();
  const { data: bodyMeasurements } = useBodyMeasurements();
  const { data: nutritionGoals } = useNutritionGoals();
  const { data: currentCyclePhase } = useCurrentCyclePhase();
  const { data: accountData } = useAccount();

  // Get recent exercise history (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const historyDateString = sevenDaysAgo.toISOString().split('T')[0];

  const { data: exerciseHistory } = useExerciseEntries(historyDateString);

  // Calculate age from date of birth
  const calculateAge = () => {
    if (!accountData?.date_of_birth) return null;

    const today = new Date();
    const birthDate = new Date(accountData.date_of_birth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  // Calculate cycle day if we have cycle data
  const getCycleDay = () => {
    if (!currentCyclePhase) return null;

    return {
      phase: currentCyclePhase.phase,
      day_in_cycle: currentCyclePhase.day_in_cycle,
      cycle_length: currentCyclePhase.cycle_length || 28,
      energy_level: currentCyclePhase.energy_level || 'moderate',
    };
  };

  // Prepare exercise history summary
  const getExerciseHistorySummary = () => {
    if (!exerciseHistory || exerciseHistory.length === 0) {
      return {
        recent_workouts: [],
        total_minutes: 0,
        dominant_types: [],
        summary: 'No recent exercise history',
      };
    }

    const recentWorkouts = exerciseHistory.map((ex) => ({
      name: ex.exercise_name,
      type: ex.exercise_type,
      duration: ex.duration_minutes,
      date: ex.logged_date,
    }));

    const totalMinutes = exerciseHistory.reduce((sum, ex) => sum + (ex.duration_minutes || 0), 0);

    // Get dominant exercise types
    const typeCount: Record<string, number> = {};
    exerciseHistory.forEach((ex) => {
      typeCount[ex.exercise_type] = (typeCount[ex.exercise_type] || 0) + 1;
    });

    const dominantTypes = Object.entries(typeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([type]) => type);

    return {
      recent_workouts: recentWorkouts,
      total_minutes: totalMinutes,
      dominant_types: dominantTypes,
      summary: `${exerciseHistory.length} workouts in last 7 days, ${totalMinutes} total minutes, mostly ${dominantTypes.join(' and ')}`,
    };
  };

  // Return all data in a clean format for the AI
  const getPlanGenerationData = () => {
    return {
      // User goals and preferences
      fitness_goals: fitnessGoals
        ? {
            primary_goal: fitnessGoals.primary_goal,
            experience_level: fitnessGoals.experience_level,
            workout_frequency: fitnessGoals.workout_frequency,
            preferred_duration: fitnessGoals.preferred_duration,
            equipment_access: fitnessGoals.equipment_access,
          }
        : null,

      // Body measurements for calorie calculations
      body_measurements: bodyMeasurements
        ? {
            height: bodyMeasurements.height,
            current_weight: bodyMeasurements.current_weight,
            goal_weight: bodyMeasurements.goal_weight,
            units: bodyMeasurements.units,
            age: calculateAge(),
          }
        : null,

      // Nutrition context for energy levels
      nutrition_goals: nutritionGoals
        ? {
            daily_calories: nutritionGoals.daily_calories,
            protein_grams: nutritionGoals.protein_grams,
            diet_preference: nutritionGoals.diet_preference,
          }
        : null,

      // Cycle data for intensity adjustments
      cycle_data: getCycleDay(),

      // Exercise history for variety
      exercise_history: getExerciseHistorySummary(),

      // Timestamp for the request
      generated_at: new Date().toISOString(),
    };
  };

  return {
    // Individual data pieces
    fitnessGoals,
    bodyMeasurements,
    nutritionGoals,
    currentCyclePhase,
    exerciseHistory,
    accountData,

    // Processed data for AI
    planGenerationData: getPlanGenerationData(),

    // Loading states
    isLoading: false, // We'll handle loading in the components that use this

    // Helper functions
    getCycleDay,
    getExerciseHistorySummary,
    calculateAge,
  };
}
