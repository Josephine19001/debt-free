import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import PageLayout from '@/components/layouts/page-layout';
import { Calendar, Heart, Info, X } from 'lucide-react-native';

// Import hooks for real data
import { useCycleSettings, useCurrentCyclePhase } from '@/lib/hooks/use-cycle-settings';
import {
  usePeriodLogsRealtime,
  useLogPeriodData,
  useDeletePeriodLog,
  useUpdateCycleSettings,
} from '@/lib/hooks/use-cycle-data';
import { useTodaysSupplements } from '@/lib/hooks/use-supplements';
import { MonthlyCalendar } from '@/components/cycle/MonthlyCalendar';
import WeeklyCalendar from '@/components/nutrition/weekly-calendar';
import { TodaysMood } from '@/components/cycle/TodaysMood';
import { TodaysSupplements } from '@/components/cycle/TodaysSupplements';
import { TodaysSymptoms } from '@/components/cycle/TodaysSymptoms';
import { CyclePhase } from '@/components/cycle/CyclePhase';
import { PeriodModal } from '@/components/cycle/PeriodModal';

export default function CycleScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showPredictionInfoModal, setShowPredictionInfoModal] = useState(false);
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [modalDate, setModalDate] = useState(new Date());

  // Format date for API calls
  const dateString =
    selectedDate.getFullYear() +
    '-' +
    String(selectedDate.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(selectedDate.getDate()).padStart(2, '0');

  // Get real data from hooks (with error handling)
  const { data: cycleSettings } = useCycleSettings();
  const { data: currentPhase, isError: currentPhaseError } = useCurrentCyclePhase();
  const { data: periodLogs = [] } = usePeriodLogsRealtime();
  const { data: todaysSupplements = [], isLoading: supplementsLoading } = useTodaysSupplements();

  // Mutations for period tracking
  const logPeriodData = useLogPeriodData();
  const deletePeriodLog = useDeletePeriodLog();
  const updateCycleSettings = useUpdateCycleSettings();

  // Handle potential hook errors gracefully
  const safeCurrentPhase = currentPhaseError ? null : currentPhase;

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleDatePress = (date: Date) => {
    // Just select the date, don't open modal
    setSelectedDate(date);
  };

  const handleLogPeriodPress = () => {
    const today = new Date();
    const isFuture = selectedDate > today && selectedDate.toDateString() !== today.toDateString();

    if (isFuture) {
      // Don't allow logging for future dates
      return;
    }

    setModalDate(selectedDate);
    setShowPeriodModal(true);
  };

  const handleStartPeriod = () => {
    // Use local date format to avoid timezone issues
    const year = modalDate.getFullYear();
    const month = String(modalDate.getMonth() + 1).padStart(2, '0');
    const day = String(modalDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    logPeriodData.mutate(
      {
        date: dateString,
        is_start_day: true,
        flow_intensity: 'moderate',
        symptoms: [],
        notes: 'Period started',
      },
      {
        onSuccess: () => {
          // Update cycle settings with new last period date
          updateCycleSettings.mutate({
            cycle_length: cycleSettings?.cycle_length || 28,
            period_length: cycleSettings?.period_length || 5,
            last_period_date: dateString,
          });
          setShowPeriodModal(false);
        },
      }
    );
  };

  const handleEndPeriod = () => {
    // Use local date format to avoid timezone issues
    const year = modalDate.getFullYear();
    const month = String(modalDate.getMonth() + 1).padStart(2, '0');
    const day = String(modalDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    // Get the current period start to calculate period length
    const currentPeriodStart = getLastPeriodStart();

    if (currentPeriodStart) {
      const startDate = new Date(currentPeriodStart);
      const endDate = modalDate;

      // Just log this as the end day (we'll auto-fill in the background later)
      logPeriodData.mutate(
        {
          date: dateString,
          is_start_day: false,
          flow_intensity: 'light',
          symptoms: [],
          notes: 'Period ended',
        },
        {
          onSuccess: () => {
            const periodLength =
              Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

            // Update period length in settings
            updateCycleSettings.mutate({
              cycle_length: cycleSettings?.cycle_length || 28,
              period_length: periodLength,
              last_period_date: currentPeriodStart,
            });

            setShowPeriodModal(false);
          },
        }
      );
    }
  };

  const handleRemovePeriod = () => {
    // Use local date format to avoid timezone issues
    const year = modalDate.getFullYear();
    const month = String(modalDate.getMonth() + 1).padStart(2, '0');
    const day = String(modalDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    deletePeriodLog.mutate(dateString, {
      onSuccess: () => {
        setShowPeriodModal(false);
      },
    });
  };

  // Get recent period logs for calendar indicators
  const getLoggedDates = (): string[] => {
    return periodLogs.map((log: any) => log.date) || [];
  };

  // Get properly matched period cycles (start-end pairs)
  const getPeriodCycles = (): Array<{ start: string; end: string | null }> => {
    const startDates = getStartDates().sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
    const endDates = getEndDates().sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    const cycles: Array<{ start: string; end: string | null }> = [];

    // Match each start date with the next chronological end date
    startDates.forEach((startDate) => {
      const start = new Date(startDate);

      // Find the first end date that comes after this start date
      const correspondingEndDate = endDates.find((endDate) => {
        const end = new Date(endDate);
        return end > start;
      });

      cycles.push({
        start: startDate,
        end: correspondingEndDate || null,
      });
    });

    return cycles;
  };

  // Get all period days (including days between start and end dates)
  const getAllPeriodDays = (): string[] => {
    const cycles = getPeriodCycles();
    const allPeriodDays = new Set<string>();

    cycles.forEach((cycle) => {
      if (cycle.start) {
        const start = new Date(cycle.start);

        if (cycle.end) {
          // Complete cycle: fill all days from start to end
          const end = new Date(cycle.end);
          const currentDate = new Date(start);

          while (currentDate <= end) {
            const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
            allPeriodDays.add(dateString);
            currentDate.setDate(currentDate.getDate() + 1);
          }
        } else {
          // Ongoing cycle: just add the start date
          allPeriodDays.add(cycle.start);
        }
      }
    });

    return Array.from(allPeriodDays).sort();
  };

  // Get period start dates for calendar
  const getStartDates = (): string[] => {
    return periodLogs.filter((log: any) => log.is_start_day).map((log: any) => log.date) || [];
  };

  // Get period end dates for calendar
  const getEndDates = (): string[] => {
    return (
      periodLogs
        .filter((log: any) => !log.is_start_day && log.notes?.includes('Period ended'))
        .map((log: any) => log.date) || []
    );
  };

  // Get the most recent period start date
  const getLastPeriodStart = (): string | null => {
    const startDates = getStartDates().sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );
    return startDates.length > 0 ? startDates[0] : null;
  };

  // Check if there's an ongoing period (started but not explicitly ended)
  const hasOngoingPeriod = (): boolean => {
    const lastPeriodStart = getLastPeriodStart();
    if (!lastPeriodStart) return false;

    // Check if there are any period logs after the start date that could indicate the end
    const startDate = new Date(lastPeriodStart);
    const periodDays = periodLogs.filter((log: any) => {
      const logDate = new Date(log.date);
      return logDate >= startDate;
    });

    // If we only have start days or no explicit end marker, period is ongoing
    const hasEndMarker = periodDays.some(
      (log: any) => !log.is_start_day && log.notes?.includes('Period ended')
    );

    if (hasEndMarker) return false;

    // Safety check: don't consider period ongoing if more than 10 days since start
    const daysSinceStart = Math.floor(
      (new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceStart <= 10;
  };

  // Calculate next period prediction using complete cycles (start to start)
  // Now calculates relative to selected date, not just today
  const getNextPeriodPrediction = (referenceDate: Date = selectedDate) => {
    const cycles = getPeriodCycles();
    if (cycles.length === 0) return null;

    // Use last 3-5 complete cycles for prediction
    let avgCycleLength = cycleSettings?.cycle_length || 28;
    let cyclesUsed = 0;

    // Get completed cycles (cycles that have ended)
    const completedCycles = cycles.filter((cycle) => cycle.end !== null);

    if (completedCycles.length >= 1) {
      // Calculate cycle lengths from completed cycles
      const cycleLengths: number[] = [];

      // Add cycle lengths from start to start
      const startDates = cycles
        .map((c) => c.start)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

      for (let i = 1; i < startDates.length; i++) {
        const prevStart = new Date(startDates[i - 1]);
        const currentStart = new Date(startDates[i]);
        const daysBetween = Math.floor(
          (currentStart.getTime() - prevStart.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Valid cycle length between 21-35 days
        if (daysBetween >= 21 && daysBetween <= 35) {
          cycleLengths.push(daysBetween);
        }
      }

      if (cycleLengths.length > 0) {
        // Use the most recent cycles (up to 5) for prediction
        const recentCycles = cycleLengths.slice(-5); // Last 5 cycles
        const totalDays = recentCycles.reduce((sum, days) => sum + days, 0);
        cyclesUsed = recentCycles.length;
        avgCycleLength = Math.round(totalDays / cyclesUsed);
      }
    }

    // Get the most recent period start date
    const sortedStarts = cycles
      .map((c) => c.start)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const lastStart = sortedStarts[0];

    if (!lastStart) return null;

    // Calculate next predicted date
    const lastStartDate = new Date(lastStart);
    const nextPredictedDate = new Date(lastStartDate);
    nextPredictedDate.setDate(nextPredictedDate.getDate() + avgCycleLength);

    // Calculate days until next period relative to the reference date (selected date)
    const daysUntilNext = Math.ceil(
      (nextPredictedDate.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Generate predicted period dates (5-day period by default)
    const predictedPeriodDates: string[] = [];
    for (let i = 0; i < (cycleSettings?.period_length || 5); i++) {
      const predDate = new Date(nextPredictedDate);
      predDate.setDate(predDate.getDate() + i);
      predictedPeriodDates.push(predDate.toISOString().split('T')[0]);
    }

    return {
      date: nextPredictedDate.toISOString().split('T')[0],
      daysUntil: daysUntilNext,
      avgCycleLength,
      cyclesUsed,
      predictedPeriodDates,
    };
  };

  // Calculate cycle phase for any given date
  const getCyclePhaseForDate = (date: Date) => {
    if (!cycleSettings) return undefined;

    const lastPeriodStart = getLastPeriodStart();
    if (!lastPeriodStart) return undefined;

    const startDate = new Date(lastPeriodStart);
    const targetDate = new Date(date);

    // Calculate days since last period start
    const daysSinceStart =
      Math.floor((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const cycleLength = cycleSettings.cycle_length || 28;
    const periodLength = cycleSettings.period_length || 5;

    // Check if the selected date is before the last period start (no cycle data)
    if (daysSinceStart <= 0) return undefined;

    // Check if we're too far beyond a reasonable cycle range
    // Only show data for current cycle or if it's a logged period day
    const dateString = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
    const isLoggedPeriodDay = getAllPeriodDays().includes(dateString);

    // If it's not a logged period day and it's beyond the current cycle, don't show data
    if (!isLoggedPeriodDay && daysSinceStart > cycleLength) {
      return undefined;
    }

    // Normalize the day within the cycle
    let dayInCycle = ((daysSinceStart - 1) % cycleLength) + 1;
    if (dayInCycle <= 0) dayInCycle += cycleLength;

    // Determine phase based on day in cycle
    let phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

    if (dayInCycle <= periodLength) {
      phase = 'menstrual';
    } else if (dayInCycle <= 13) {
      phase = 'follicular';
    } else if (dayInCycle <= 16) {
      phase = 'ovulatory';
    } else {
      phase = 'luteal';
    }

    return {
      phase,
      day_in_cycle: dayInCycle,
      cycle_length: cycleLength,
    };
  };

  // Calculate pregnancy chances based on cycle phase for selected date
  const getPregnancyChances = (date: Date) => {
    const cyclePhase = getCyclePhaseForDate(date);
    if (!cyclePhase) return { level: 'Unknown', color: '#6B7280', description: 'No cycle data' };

    const { day_in_cycle } = cyclePhase;

    // Pregnancy chances based on cycle day
    if (day_in_cycle <= 5) {
      // Menstrual phase - very low chance
      return {
        level: 'Very Low',
        color: '#10B981',
        description: 'Menstrual phase - very low fertility',
      };
    } else if (day_in_cycle <= 9) {
      // Early follicular - low chance
      return {
        level: 'Low',
        color: '#10B981',
        description: 'Early follicular phase - low fertility',
      };
    } else if (day_in_cycle <= 11) {
      // Late follicular - increasing chance
      return {
        level: 'Medium',
        color: '#F59E0B',
        description: 'Late follicular phase - fertility increasing',
      };
    } else if (day_in_cycle >= 12 && day_in_cycle <= 16) {
      // Ovulatory phase - highest chance
      return {
        level: 'High',
        color: '#EF4444',
        description: 'Ovulatory phase - peak fertility window',
      };
    } else if (day_in_cycle <= 21) {
      // Early luteal - medium chance
      return {
        level: 'Medium',
        color: '#F59E0B',
        description: 'Early luteal phase - moderate fertility',
      };
    } else {
      // Late luteal - low chance
      return {
        level: 'Low',
        color: '#10B981',
        description: 'Late luteal phase - low fertility',
      };
    }
  };

  // Memoize prediction to ensure it updates when period data changes or selected date changes
  const nextPeriodPrediction = React.useMemo(() => {
    return getNextPeriodPrediction(selectedDate);
  }, [periodLogs, cycleSettings, selectedDate]);

  // Memoize pregnancy chances for selected date
  const pregnancyChances = React.useMemo(() => {
    return getPregnancyChances(selectedDate);
  }, [selectedDate, cycleSettings, periodLogs]);

  // Simple cycle stats
  const cycleStats = {
    currentPhase: safeCurrentPhase?.name || 'Unknown',
    dayInCycle: safeCurrentPhase?.day_in_cycle || 0,
    daysRemaining: safeCurrentPhase?.days_remaining || 0,
    averageCycle: cycleSettings?.cycle_length || 28,
    loggedDays: getStartDates().length, // Count period cycles started
    totalLoggedDays: periodLogs.length, // Total individual day entries
    nextPeriod: nextPeriodPrediction,
  };

  // Format selected date for subtitle
  const formatSelectedDate = (date: Date): string => {
    const isToday = date.toDateString() === new Date().toDateString();
    const isYesterday = date.toDateString() === new Date(Date.now() - 86400000).toDateString();
    const isTomorrow = date.toDateString() === new Date(Date.now() + 86400000).toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    if (isTomorrow) return 'Tomorrow';

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get mood data for selected date
  const getMoodDataForDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    const moodLog = periodLogs.find((log: any) => log.date === dateString && log.mood);

    if (moodLog && moodLog.mood) {
      // Extract energy level from notes (format: "Energy: high | user notes")
      let energy_level = 'medium';
      let userNotes = moodLog.notes;

      if (moodLog.notes && moodLog.notes.includes('Energy:')) {
        const energyMatch = moodLog.notes.match(/Energy:\s*(high|medium|low)/);
        if (energyMatch) {
          energy_level = energyMatch[1];
          // Remove energy and any severity info from notes to get just user notes
          userNotes = moodLog.notes
            .replace(/Energy:\s*(high|medium|low)\s*\|\s*/, '')
            .replace(/Severity:\s*(mild|moderate|severe)\s*\|\s*/, '')
            .replace(/Severity:\s*(mild|moderate|severe)/, '')
            .trim();
          if (userNotes === `Energy: ${energy_level}` || userNotes.startsWith('Severity:')) {
            userNotes = undefined; // If only energy/severity was stored
          }
        }
      }

      return {
        mood: moodLog.mood,
        energy_level,
        notes: userNotes,
      };
    }

    return undefined;
  };

  // Get symptom data for selected date
  const getSymptomDataForDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    const symptomLog = periodLogs.find(
      (log: any) => log.date === dateString && log.symptoms && log.symptoms.length > 0
    );

    if (symptomLog && symptomLog.symptoms && symptomLog.symptoms.length > 0) {
      // Extract severity from notes (format: "Severity: moderate | user notes")
      let severity: 'mild' | 'moderate' | 'severe' | undefined = undefined;
      let userNotes = symptomLog.notes;

      if (symptomLog.notes && symptomLog.notes.includes('Severity:')) {
        const severityMatch = symptomLog.notes.match(/Severity:\s*(mild|moderate|severe)/);
        if (severityMatch) {
          severity = severityMatch[1] as 'mild' | 'moderate' | 'severe';
          // Remove severity from notes to get just user notes
          userNotes = symptomLog.notes
            .replace(/Severity:\s*(mild|moderate|severe)\s*\|\s*/, '')
            .trim();
          if (userNotes === `Severity: ${severity}`) {
            userNotes = undefined; // If only severity was stored
          }
        }
      }

      return {
        symptoms: symptomLog.symptoms,
        severity,
        notes: userNotes,
      };
    }

    return undefined;
  };

  return (
    <PageLayout
      title="Cycle"
      theme="cycle"
      btn={
        <TouchableOpacity
          className="bg-pink-500 p-3 rounded-full"
          onPress={() => setShowFullCalendar(true)}
          style={{
            shadowColor: '#EC4899',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Calendar size={18} color="#FFFFFF" />
        </TouchableOpacity>
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
          loggedDates={getAllPeriodDays()}
          theme="cycle"
        />

        {/* Start Period Button - Only show when period is predicted to start soon */}
        {(() => {
          const today = new Date();
          const todayString = today.toISOString().split('T')[0];
          const isPredictedToday =
            nextPeriodPrediction?.predictedPeriodDates?.includes(todayString);
          const daysUntilPeriod = nextPeriodPrediction?.daysUntil || 0;

          // Show button if period is predicted today or within 2 days
          if (isPredictedToday || (daysUntilPeriod >= 0 && daysUntilPeriod <= 2)) {
            return (
              <View className="mx-4 mb-6">
                <TouchableOpacity
                  onPress={() => {
                    setModalDate(today);
                    setShowPeriodModal(true);
                  }}
                  className="py-4 rounded-2xl flex-row items-center justify-center bg-gradient-to-r from-pink-500 to-pink-600 shadow-lg"
                  style={{
                    shadowColor: '#EC4899',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <Calendar size={20} color="#FFFFFF" />
                  <Text className="text-white font-bold text-lg ml-2">
                    {isPredictedToday
                      ? 'Start Period (Today)'
                      : `Period Expected ${daysUntilPeriod === 0 ? 'Today' : `in ${daysUntilPeriod} day${daysUntilPeriod === 1 ? '' : 's'}`}`}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }
          return null;
        })()}

        {/* Current Phase Card */}
        {safeCurrentPhase && (
          <View className="bg-white rounded-2xl p-4 mx-4 mb-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-black">{safeCurrentPhase.name}</Text>
                <Text className="text-gray-600 text-sm">
                  Day {safeCurrentPhase.day_in_cycle} • {safeCurrentPhase.days_remaining} days left
                </Text>
                {nextPeriodPrediction && nextPeriodPrediction.daysUntil > 0 && (
                  <View className="bg-purple-50 px-2 py-1 rounded-full mt-2 self-start">
                    <Text className="text-purple-700 text-xs font-medium">
                      Period in {nextPeriodPrediction.daysUntil} days
                    </Text>
                  </View>
                )}
              </View>
              <View className="bg-pink-50 p-3 rounded-xl">
                <Heart size={20} color="#EC4899" />
              </View>
            </View>
            <Text className="text-gray-700 text-sm mb-3">{safeCurrentPhase.description}</Text>

            {/* What to Expect - Commented out for now
            <View className="bg-gradient-to-r from-pink-50 to-purple-50 p-3 rounded-xl border border-pink-100">
              <Text className="text-pink-700 font-medium text-sm mb-2">What to expect today:</Text>
              <Text className="text-pink-600 text-xs leading-relaxed">
                {getPhaseExpectations(safeCurrentPhase.name)}
              </Text>

              Phase-specific tips
              {getPhaseQuickTips(safeCurrentPhase.name) && (
                <View className="bg-white/60 p-2 rounded-lg border border-pink-200 mt-2">
                  <Text className="text-pink-700 font-medium text-xs mb-1">💡 Quick tip:</Text>
                  <Text className="text-pink-600 text-xs">
                    {getPhaseQuickTips(safeCurrentPhase.name)}
                  </Text>
                </View>
              )}
            </View>
            */}
          </View>
        )}

        {/* Hidden original complex version */}
        {false && nextPeriodPrediction && (
          <View className="mx-4 mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">Next Period</Text>
            <View className="bg-white rounded-3xl p-5 shadow-sm border border-purple-100">
              <View className="bg-purple-50 rounded-2xl p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
                        <Calendar size={20} color="#8B5CF6" />
                      </View>
                      <View>
                        <Text className="text-purple-900 font-bold text-lg">
                          {(nextPeriodPrediction?.daysUntil ?? 0) > 0
                            ? `In ${nextPeriodPrediction?.daysUntil} days`
                            : (nextPeriodPrediction?.daysUntil ?? 0) === 0
                              ? 'Today'
                              : 'Overdue'}
                        </Text>
                        <Text className="text-purple-700 text-sm">
                          {nextPeriodPrediction?.date &&
                            new Date(nextPeriodPrediction.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                            })}
                        </Text>
                        <Text className="text-purple-600 text-xs mt-1">
                          Based on your cycle history
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowPredictionInfoModal(true)}
                    className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center"
                  >
                    <Info size={16} color="#8B5CF6" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Fertility Window Section - Commented out for now */}
        {/*
        <FertilityWindow
          selectedDate={selectedDate}
          cyclePhase={getCyclePhaseForDate(selectedDate)}
          isLoading={false}
        />
        */}

        {/* Cycle Phase Information */}
        <CyclePhase
          selectedDate={selectedDate}
          periodStartDate={
            periodLogs && periodLogs.length > 0
              ? (() => {
                  // Sort logs by date to find the most recent period start
                  const sortedLogs = [...periodLogs].sort(
                    (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
                  );

                  // Find the most recent period start
                  const recentPeriodStart = sortedLogs.find((log: any) => log.period_start);
                  if (recentPeriodStart?.date) {
                    // Use local date parsing to avoid timezone issues
                    return new Date(recentPeriodStart.date + 'T00:00:00');
                  }

                  // If no explicit period_start, find the most recent period-related log
                  const recentPeriodLog = sortedLogs.find(
                    (log: any) =>
                      log.flow ||
                      log.period_flow ||
                      log.period_start !== undefined ||
                      log.is_period ||
                      log.period ||
                      log.menstruation
                  );
                  if (recentPeriodLog?.date) {
                    // Use local date parsing to avoid timezone issues
                    return new Date(recentPeriodLog.date + 'T00:00:00');
                  }

                  // Fallback: Use the earliest logged date as potential period start
                  if (sortedLogs.length > 0) {
                    const earliestLog = sortedLogs[sortedLogs.length - 1];
                    return new Date(earliestLog.date + 'T00:00:00');
                  }

                  return undefined;
                })()
              : undefined
          }
          onLogPeriod={() => setShowFullCalendar(true)}
          nextPeriodPrediction={nextPeriodPrediction}
          pregnancyChances={pregnancyChances}
        />

        {/* Today's Symptoms Section */}
        <TodaysSymptoms
          selectedDate={selectedDate}
          symptomData={getSymptomDataForDate(selectedDate)}
          isLoading={false}
        />

        {/* Today's Mood Section */}
        <TodaysMood
          selectedDate={selectedDate}
          moodData={getMoodDataForDate(selectedDate)}
          isLoading={false}
        />

        {/* Today's Supplements Section */}
        <TodaysSupplements selectedDate={selectedDate} />

        {/* Beauty Scans Section */}
        {/* <TodaysBeautyScans selectedDate={selectedDate} isLoading={false} /> */}

        {/* Period History Section - Commented out for now */}
        {/*
        <SimpleCycleHistory periodLogs={periodLogs} isLoading={false} />
        */}
      </ScrollView>

      {/* Period Modal */}
      <PeriodModal
        isVisible={showPeriodModal}
        selectedDate={modalDate}
        isLoggedDate={getLoggedDates().includes(modalDate.toISOString().split('T')[0])}
        isStartDate={getStartDates().includes(modalDate.toISOString().split('T')[0])}
        hasOngoingPeriod={hasOngoingPeriod()}
        onClose={() => setShowPeriodModal(false)}
        onStartPeriod={handleStartPeriod}
        onEndPeriod={handleEndPeriod}
        onRemovePeriod={handleRemovePeriod}
      />

      {/* Prediction Info Modal */}
      <Modal
        visible={showPredictionInfoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPredictionInfoModal(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center p-6">
          <View className="bg-white rounded-3xl p-6 max-w-sm w-full">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
                  <Info size={20} color="#8B5CF6" />
                </View>
                <Text className="text-lg font-bold text-gray-900">Period Prediction</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowPredictionInfoModal(false)}
                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
              >
                <X size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text className="text-gray-700 text-sm leading-6 mb-4">
              Your cycle predictions automatically improve as you track more periods. We use your
              last 3-5 cycles to calculate the most accurate prediction possible.
            </Text>

            <View className="bg-purple-50 rounded-2xl p-4 mb-4">
              <Text className="text-purple-900 font-semibold text-sm mb-2">How it works:</Text>
              <Text className="text-purple-800 text-xs leading-5">
                • Uses your most recent 3-5 cycles{'\n'}• Calculates your personal average{'\n'}• If
                we don't have enough data, we use a 28-day cycle{'\n'}• Updates automatically with
                new data{'\n'}• More cycles = better accuracy
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setShowPredictionInfoModal(false)}
              className="bg-purple-500 py-3 rounded-2xl"
            >
              <Text className="text-white font-semibold text-center">Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Full Calendar Modal */}
      <Modal
        visible={showFullCalendar}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFullCalendar(false)}
      >
        <View className="flex-1 bg-black/30">
          <View className="flex-1 mt-16 bg-white rounded-t-3xl shadow-2xl">
            {/* Modal Header */}
            <View className="px-6 pt-6 pb-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-2xl font-bold text-gray-900">Period Calendar</Text>
                <TouchableOpacity
                  onPress={() => setShowFullCalendar(false)}
                  className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                >
                  <X size={18} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <Text className="text-gray-600 text-sm">Track your cycle and log period days</Text>
            </View>

            {/* Calendar Content */}
            <View className="flex-1 px-4">
              <MonthlyCalendar
                selectedDate={selectedDate}
                onDateSelect={(date) => {
                  handleDateSelect(date);
                }}
                loggedDates={getAllPeriodDays()}
                startDates={getStartDates()}
                endDates={getEndDates()}
                predictedDates={nextPeriodPrediction?.predictedPeriodDates || []}
                onDatePress={(date) => {
                  setModalDate(date);
                  setSelectedDate(date);
                  setShowPeriodModal(true);
                }}
              />
            </View>

            {/* Log Period Button */}
            <View className="px-6 pb-6 pt-4 border-t border-gray-100">
              <TouchableOpacity
                onPress={() => {
                  setModalDate(selectedDate);
                  setShowPeriodModal(true);
                }}
                className={`py-4 rounded-2xl flex-row items-center justify-center ${
                  selectedDate > new Date() &&
                  selectedDate.toDateString() !== new Date().toDateString()
                    ? 'bg-gray-300'
                    : (() => {
                        // Check if today is a predicted period day
                        const today = new Date();
                        const todayString = today.toISOString().split('T')[0];
                        const isPredictedDay =
                          nextPeriodPrediction?.predictedPeriodDates?.includes(todayString);
                        const isSelectedDateToday =
                          selectedDate.toDateString() === today.toDateString();

                        return isPredictedDay && isSelectedDateToday
                          ? 'bg-pink-600'
                          : 'bg-pink-500';
                      })()
                }`}
                disabled={
                  selectedDate > new Date() &&
                  selectedDate.toDateString() !== new Date().toDateString()
                }
              >
                <Calendar size={20} color="#FFFFFF" />
                <Text className="text-white font-semibold text-lg ml-2">
                  {(() => {
                    const dateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
                    const isLoggedDate = getAllPeriodDays().includes(dateString);
                    const isToday = selectedDate.toDateString() === new Date().toDateString();
                    const today = new Date();
                    const todayString = today.toISOString().split('T')[0];
                    const isPredictedDay =
                      nextPeriodPrediction?.predictedPeriodDates?.includes(todayString);

                    if (isLoggedDate) {
                      return `Edit Period (${isToday ? 'Today' : formatSelectedDate(selectedDate)})`;
                    } else if (
                      isPredictedDay &&
                      isToday &&
                      selectedDate.toDateString() === today.toDateString()
                    ) {
                      return `Start Period (Today)`;
                    } else {
                      return `Log Period (${isToday ? 'Today' : formatSelectedDate(selectedDate)})`;
                    }
                  })()}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </PageLayout>
  );
}
