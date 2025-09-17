import { QuestionnaireStep } from '@/components/ui';

export const nutritionQuestionnaireSteps: QuestionnaireStep[] = [
  {
    key: 'goal',
    title: "What's your nutrition goal right now? 🥗",
    subtitle: 'This will help us customize your plan',
    options: [
      {
        value: 'lose_weight',
        label: 'Weight loss ⚖️',
        description: 'Healthy weight loss goals',
        icon: '⚖️',
      },
      {
        value: 'gain_muscle',
        label: 'Muscle gain 💪',
        description: 'Build lean muscle mass',
        icon: '💪',
      },
      {
        value: 'hormone_balance',
        label: 'Hormone balance 🌸',
        description: 'Support hormonal health',
        icon: '🌸',
      },
      {
        value: 'better_energy',
        label: 'Better energy ⚡',
        description: 'Boost daily energy levels',
        icon: '⚡',
      },
      {
        value: 'maintain',
        label: 'Just eat better 🥗',
        description: 'Focus on overall nutrition',
        icon: '🥗',
      },
    ],
  },
  {
    key: 'activity',
    title: 'How active are you in daily life? 🚶‍♀️',
    subtitle: 'This affects your daily calorie needs',
    options: [
      { value: 'sedentary', label: 'Mostly sitting 🪑', description: 'Desk job, little exercise', icon: '🪑' },
      { value: 'light', label: 'Lightly active 🚶', description: 'Light exercise 1-3 days/week', icon: '🚶' },
      {
        value: 'moderate',
        label: 'On my feet a lot 🏃‍♀️',
        description: 'Regular exercise 3-5 days/week',
        icon: '🏃‍♀️',
      },
      { value: 'active', label: 'Very active 🔥', description: 'Intense exercise 6-7 days/week', icon: '🔥' },
    ],
  },
  {
    key: 'experience',
    title: 'Nutrition tracking experience?',
    subtitle: "We'll adjust the complexity for you",
    options: [
      { value: 'beginner', label: 'Beginner', description: 'New to nutrition tracking' },
      {
        value: 'intermediate',
        label: 'Intermediate',
        description: 'Some experience with healthy eating',
      },
      {
        value: 'advanced',
        label: 'Advanced',
        description: 'Experienced with nutrition planning',
      },
    ],
  },
];

// Helper functions to format display values
export const formatGoal = (goal: string) => {
  const goalMap: Record<string, string> = {
    lose_weight: 'Weight Loss',
    gain_muscle: 'Muscle Gain', 
    hormone_balance: 'Hormone Balance',
    better_energy: 'Better Energy',
    maintain: 'Just Eat Better',
    // Legacy values for backward compatibility
    improve_health: 'Improve Health',
  };
  return goalMap[goal] || goal.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const formatActivityLevel = (level: string) => {
  const levelMap: Record<string, string> = {
    sedentary: 'Mostly Sitting',
    light: 'Lightly Active',
    moderate: 'On My Feet A Lot',
    active: 'Very Active',
  };
  return levelMap[level] || level.replace('_', ' ');
};

export const formatNutritionStyle = (style: string) => {
  const styleMap: Record<string, string> = {
    all: 'Eat Everything',
    plants: 'Mostly Plants',
    vegan: 'Vegan',
    surprise: 'Surprise Me',
  };
  return styleMap[style] || style.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};
