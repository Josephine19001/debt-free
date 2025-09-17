import { QuestionnaireStep } from '@/components/ui';

export const fitnessQuestionnaireSteps: QuestionnaireStep[] = [
  {
    key: 'goal',
    title: "What's your fitness goal? 🎯",
    subtitle: 'Choose your primary focus area',
    options: [
      {
        value: 'tone_up',
        label: 'Tone up ⚖️',
        description: 'Focus on body composition',
        icon: '⚖️',
      },
      {
        value: 'build_muscle',
        label: 'Strength 💪',
        description: 'Build muscle and get stronger',
        icon: '💪',
      },
      {
        value: 'flexibility',
        label: 'Flexibility 🧘',
        description: 'Improve mobility and stretch',
        icon: '🧘',
      },
      {
        value: 'improve_endurance',
        label: 'Cardio queen 🏃',
        description: 'Boost cardiovascular fitness',
        icon: '🏃',
      },
      {
        value: 'general_wellness',
        label: 'Just feel better ✨',
        description: 'Overall health and wellness',
        icon: '✨',
      },
    ],
  },
  {
    key: 'frequency',
    title: 'How often do you work out? 🏋️‍♀️',
    subtitle: 'This helps us plan your weekly routine',
    options: [
      { value: 'never', label: 'Never 😅', description: 'Just getting started' },
      { value: '1-2', label: '1-2x a week 🐢', description: 'Light and easy' },
      { value: '3-4', label: '3-4x a week ⚡', description: 'Regular routine' },
      { value: '5-6', label: '5+ times 🔥', description: 'Very committed' },
    ],
  },
  {
    key: 'experience',
    title: "What's your fitness experience?",
    subtitle: "We'll adjust the intensity accordingly",
    options: [
      { value: 'beginner', label: 'Beginner', description: 'New to working out' },
      { value: 'intermediate', label: 'Intermediate', description: 'Some gym experience' },
      { value: 'advanced', label: 'Advanced', description: 'Experienced athlete' },
    ],
  },
];

// Helper functions to format display values
export const formatFitnessGoal = (goal: string) => {
  const goalMap: Record<string, string> = {
    tone_up: 'Tone Up',
    build_muscle: 'Strength',
    flexibility: 'Flexibility', 
    improve_endurance: 'Cardio Queen',
    general_wellness: 'Just Feel Better',
    // Legacy values for backward compatibility
    lose_weight: 'Lose Weight',
    general_fitness: 'General Fitness',
  };
  return goalMap[goal] || goal.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const formatWorkoutFrequency = (freq: string) => {
  const freqMap: Record<string, string> = {
    never: 'Never',
    '1-2': '1-2x a week',
    '3-4': '3-4x a week', 
    '5-6': '5+ times',
    '7+': '7+ times per week',
  };
  return freqMap[freq] || `${freq} times per week`;
};

export const formatFitnessExperience = (exp: string) => {
  const expMap: Record<string, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };
  return expMap[exp] || exp;
};
