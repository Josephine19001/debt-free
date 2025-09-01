import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import {
  Calendar,
  Droplets,
  Flower,
  Heart,
  Leaf,
  ChevronDown,
  ChevronUp,
  Plus,
} from 'lucide-react-native';

interface CyclePhaseProps {
  selectedDate: Date;
  periodStartDate?: Date;
  onLogPeriod?: () => void;
  nextPeriodPrediction?: {
    daysUntil: number;
    date: string;
  } | null;
}

// Detailed cycle data with specific messages for each day
const getPhaseData = (day: number) => {
  // Menstrual Phase (Days 1-5)
  if (day === 1) {
    return {
      phase: 'Menstrual',
      type: 'Period Day 1',
      message:
        "Your period just started. Take it easy today - rest, stay hydrated, and use heat therapy for cramps. Iron-rich foods can help replenish what you're losing.",
      icon: 'droplets',
    };
  } else if (day === 2) {
    return {
      phase: 'Menstrual',
      type: 'Period Day 2',
      message:
        'Usually the heaviest flow day. Be gentle with yourself, stay warm, and consider light stretching or yoga. Magnesium can help with muscle tension.',
      icon: 'droplets',
    };
  } else if (day === 3) {
    return {
      phase: 'Menstrual',
      type: 'Period Day 3',
      message:
        'Flow is moderating. You might start feeling a bit more energetic. Gentle walks and warm baths can be soothing. Keep eating nourishing foods.',
      icon: 'droplets',
    };
  } else if (day === 4) {
    return {
      phase: 'Menstrual',
      type: 'Period Day 4',
      message:
        "Energy is slowly returning. Light exercise like walking or gentle yoga can help with mood and circulation. You're almost through the hardest part!",
      icon: 'droplets',
    };
  } else if (day === 5) {
    return {
      phase: 'Menstrual',
      type: 'Period Day 5',
      message:
        'Final period day for most people. You might feel relief and renewed energy. Perfect time to plan ahead for the productive follicular phase coming up.',
      icon: 'droplets',
    };
  }
  // Follicular Phase (Days 6-11)
  else if (day <= 8) {
    return {
      phase: 'Follicular',
      type: 'Early Follicular',
      message:
        'Post-period recovery time. Your energy is building back up. Great time to start planning new projects and gradually increase activity levels.',
      icon: 'leaf',
    };
  } else if (day <= 11) {
    return {
      phase: 'Follicular',
      type: 'Growing Phase',
      message:
        'Energy rising daily! Perfect time for challenging workouts, learning new skills, and tackling ambitious goals. Your brain is sharp and focused.',
      icon: 'leaf',
    };
  }
  // Ovulatory Phase (Days 12-15)
  else if (day === 12) {
    return {
      phase: 'Ovulatory',
      type: 'Pre-Ovulation',
      message:
        "Approaching your peak! Energy and confidence are high. Great for social activities, presentations, and important conversations. You're naturally more charismatic.",
      icon: 'flower',
    };
  } else if (day === 13 || day === 14) {
    return {
      phase: 'Ovulatory',
      type: 'Peak Fertility',
      message:
        "Your most fertile days with peak energy! Perfect for high-intensity workouts, public speaking, and making important decisions. You're at your most confident.",
      icon: 'flower',
    };
  } else if (day === 15) {
    return {
      phase: 'Ovulatory',
      type: 'Post-Ovulation',
      message:
        'Energy is still high but starting to shift. Good time to wrap up big projects before the more introspective luteal phase begins.',
      icon: 'flower',
    };
  }
  // Luteal Phase (Days 16-28)
  else if (day <= 21) {
    return {
      phase: 'Luteal',
      type: 'Early Luteal',
      message:
        'Energy is settling into a calmer rhythm. Perfect for detailed work, organization, and completing projects. Your body craves more protein and healthy fats.',
      icon: 'heart',
    };
  } else if (day <= 25) {
    return {
      phase: 'Luteal',
      type: 'Mid Luteal',
      message:
        'You might notice mood changes and food cravings. Listen to your body - it needs more rest and comfort foods. Great time for cozy, nurturing activities.',
      icon: 'heart',
    };
  } else {
    return {
      phase: 'Luteal',
      type: 'Late Luteal (PMS)',
      message:
        'PMS symptoms may be present. Be extra kind to yourself. Focus on gentle movement, stress management, and preparing for your upcoming period.',
      icon: 'heart',
    };
  }
};

// Circular Progress Component using CSS/Style approach
const CircularProgress = ({ progress, size = 180 }: { progress: number; size?: number }) => {
  // More granular progress calculation
  const getSegmentColor = (segmentProgress: number) => {
    return progress >= segmentProgress ? '#EC4899' : 'transparent';
  };

  return (
    <View className="items-center justify-center" style={{ width: size, height: size }}>
      {/* Background circle */}
      <View
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          borderWidth: 8,
          borderColor: '#F3E8FF',
        }}
      />
      {/* Progress circles - multiple layers for smoother progress */}
      {[0, 25, 50, 75].map((segmentStart, index) => (
        <View
          key={index}
          className="absolute rounded-full"
          style={{
            width: size,
            height: size,
            borderWidth: 8,
            borderColor: 'transparent',
            borderTopColor: index === 0 ? getSegmentColor(segmentStart) : 'transparent',
            borderRightColor: index === 1 ? getSegmentColor(segmentStart) : 'transparent',
            borderBottomColor: index === 2 ? getSegmentColor(segmentStart) : 'transparent',
            borderLeftColor: index === 3 ? getSegmentColor(segmentStart) : 'transparent',
            transform: [{ rotate: '-90deg' }],
          }}
        />
      ))}
    </View>
  );
};

// Phase indicator component
const PhaseIndicator = ({ phase, isActive }: { phase: string; isActive: boolean }) => {
  const getPhaseColor = (phaseName: string) => {
    switch (phaseName.toLowerCase()) {
      case 'period':
        return '#EC4899'; // Pink for period phase
      case 'fertile window':
        return '#10B981'; // Light green for fertile window
      case 'menstrual':
        return '#EC4899'; // Pink
      case 'follicular':
        return '#10B981'; // Green
      case 'ovulatory':
        return '#3B82F6'; // Blue
      case 'luteal':
        return '#8B5CF6'; // Purple
      default:
        return '#6B7280';
    }
  };

  return (
    <View className="flex-row items-center mr-4">
      <View
        className="w-3 h-3 rounded-full mr-2"
        style={{ backgroundColor: getPhaseColor(phase) }}
      />
      <Text className={`text-xs ${isActive ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
        {phase} phase
      </Text>
    </View>
  );
};

export function CyclePhase({
  selectedDate,
  periodStartDate,
  onLogPeriod,
  nextPeriodPrediction,
}: CyclePhaseProps) {
  // If no period data, show tracking encouragement
  if (!periodStartDate) {
    return (
      <View className="px-4 mb-6">
        <View className="bg-white rounded-3xl p-6 border border-gray-100 items-center">
          <View className="w-32 h-32 rounded-full border-4 border-dashed border-gray-200 items-center justify-center mb-4">
            <Calendar size={32} color="#9CA3AF" />
          </View>
          <Text className="text-lg font-bold text-gray-900 text-center mb-2">
            Start tracking your cycle
          </Text>
          <Text className="text-gray-500 text-center text-sm mb-4 px-4">
            Get personalized insights about your cycle phases and health
          </Text>
          <TouchableOpacity className="bg-pink-500 px-6 py-3 rounded-full" onPress={onLogPeriod}>
            <Text className="text-white font-semibold">Log Period</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Calculate cycle day with proper timezone handling
  const getCycleDay = () => {
    // Normalize both dates to local date strings without timezone offset
    const normalizeDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const selectedDateString = normalizeDate(selectedDate);
    const periodStartString = normalizeDate(periodStartDate);

    const selectedLocalDate = new Date(selectedDateString + 'T00:00:00');
    const periodStartLocalDate = new Date(periodStartString + 'T00:00:00');

    const timeDiff = selectedLocalDate.getTime() - periodStartLocalDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 0) return 1;
    if (daysDiff > 30) return (daysDiff % 28) + 1;
    return daysDiff + 1;
  };

  const cycleDay = getCycleDay();
  const phaseData = getPhaseData(cycleDay);

  // Calculate progress percentage (assuming 28-day cycle)
  const progressPercentage = (cycleDay / 28) * 100;

  return (
    <View className="px-4 mb-6">
      <View className="bg-white rounded-3xl p-6 border border-gray-100">
        {/* Circular Progress Section */}
        <View className="items-center mb-6">
          <View className="relative items-center justify-center">
            <CircularProgress progress={progressPercentage} />
            <View className="absolute items-center justify-center">
              <Text className="text-3xl font-bold text-gray-900">Day {cycleDay}</Text>
              <Text className="text-sm text-gray-600 capitalize">{phaseData.phase} Phase</Text>
            </View>
          </View>
        </View>

        {/* Phase Indicators */}
        <View className="flex-row justify-center mb-6 flex-wrap">
          <PhaseIndicator phase="Period" isActive={phaseData.phase === 'Menstrual'} />
          <PhaseIndicator phase="Fertile window" isActive={phaseData.phase === 'Ovulatory'} />
        </View>

        {/* Log Period Button */}
        <TouchableOpacity
          className="bg-pink-500 rounded-2xl py-4 items-center mb-4"
          onPress={onLogPeriod}
        >
          <View className="flex-row items-center">
            <Text className="text-white font-medium mr-2">Log Period</Text>
            <Plus size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Chances of Pregnancy */}
        <View className="bg-gray-50 rounded-2xl p-4 mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Calendar size={16} color="#6B7280" />
              <Text className="text-gray-700 ml-2 text-sm">Chances of Pregnancy</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-orange-400 mr-2" />
              <Text className="text-sm font-medium text-gray-900">Low</Text>
            </View>
          </View>
        </View>

        {/* Next Period */}
        {nextPeriodPrediction && (
          <View className="bg-gray-50 rounded-2xl p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Calendar size={16} color="#6B7280" />
                <Text className="text-gray-700 ml-2 text-sm">Next Period</Text>
              </View>
              <Text className="text-sm font-medium text-gray-900">
                {nextPeriodPrediction.daysUntil > 0
                  ? `in ${nextPeriodPrediction.daysUntil} days`
                  : nextPeriodPrediction.daysUntil === 0
                    ? 'today'
                    : 'overdue'}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
