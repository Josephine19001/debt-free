import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { router, useLocalSearchParams } from 'expo-router';
import SubPageLayout from '@/components/layouts/sub-page';
import { ElegantPeriodCalendar } from '@/components/cycle/ElegantPeriodCalendar';
import { useTheme } from '@/context/theme-provider';
import { getLocalDateString } from '@/lib/utils/date-helpers';
import {
  usePeriodDates,
  useLogPeriodDays,
  useCurrentCycleInfo,
} from '@/lib/hooks/use-cycle-flo-style';

export default function LogPeriodScreen() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const initialDate = date ? new Date(date) : new Date();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalPeriodDates, setOriginalPeriodDates] = useState<string[]>([]);
  const [currentPeriodDates, setCurrentPeriodDates] = useState<string[]>([]);
  const { isDark } = useTheme();

  // Use the new simplified period dates hook
  const { data: periodDates = [], isLoading } = usePeriodDates();
  const logPeriodDays = useLogPeriodDays();
  
  // Get current cycle info to show predicted periods
  const { data: currentCycleInfo } = useCurrentCycleInfo();

  // Load existing period data when component mounts
  useEffect(() => {
    if (!isLoading && periodDates) {
      console.log('=== LOADING PERIOD DATA (NEW) ===');
      console.log('Period dates:', periodDates);

      setOriginalPeriodDates(periodDates);
      setCurrentPeriodDates(periodDates);
      setHasChanges(false);
    }
  }, [periodDates, isLoading]);

  const handleDateSelect = React.useCallback((date: Date) => {
    if (!date || isNaN(date.getTime())) {
      console.warn('Invalid date passed to handleDateSelect:', date);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDay = new Date(date);
    selectedDay.setHours(0, 0, 0, 0);

    if (selectedDay > today) {
      setSelectedDate(today);
    } else {
      setSelectedDate(date);
    }
  }, []);

  // Get predicted next period dates for calendar using same logic as CyclePhase
  const predictedDates = React.useMemo(() => {
    const dates: string[] = [];

    console.log('[DEBUG] Getting predicted dates for calendar...');
    console.log('[DEBUG] currentCycleInfo:', JSON.stringify(currentCycleInfo, null, 2));

    try {
      if (!currentCycleInfo?.next_period_prediction) {
        console.log('[DEBUG] No next_period_prediction found');
        return dates;
      }

      const nextPeriodPrediction = currentCycleInfo.next_period_prediction;
      console.log('[DEBUG] Next period prediction:', nextPeriodPrediction);
      
      const nextPeriodDate = new Date(nextPeriodPrediction.start_date);
      const nextPeriodEndDate = new Date(nextPeriodPrediction.end_date);

      console.log('[DEBUG] Parsed dates - start:', nextPeriodDate, 'end:', nextPeriodEndDate);

      // Reset time to avoid timezone issues
      nextPeriodDate.setHours(0, 0, 0, 0);
      nextPeriodEndDate.setHours(0, 0, 0, 0);

      if (!isNaN(nextPeriodDate.getTime()) && !isNaN(nextPeriodEndDate.getTime())) {
        const currentDate = new Date(nextPeriodDate);
        while (currentDate <= nextPeriodEndDate) {
          const dateStr = getLocalDateString(currentDate);
          console.log('[DEBUG] Generated predicted date:', dateStr);
          
          // Don't show predicted dates that are already logged as actual periods
          if (!currentPeriodDates.includes(dateStr)) {
            dates.push(dateStr);
            console.log('[DEBUG] Added predicted date:', dateStr);
          } else {
            console.log('[DEBUG] Skipped predicted date (already logged):', dateStr);
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else {
        console.log('[DEBUG] Invalid dates - start valid:', !isNaN(nextPeriodDate.getTime()), 'end valid:', !isNaN(nextPeriodEndDate.getTime()));
      }
    } catch (error) {
      console.error('[DEBUG] Error generating predicted calendar dates:', error);
    }

    console.log('[DEBUG] Final predicted dates:', dates);
    return dates;
  }, [currentCycleInfo, currentPeriodDates]);

  const handleDateToggle = (date: Date, shouldBePeriodDate: boolean) => {
    const dateString = getLocalDateString(date);
    console.log(
      `Toggling date ${dateString} to ${shouldBePeriodDate ? 'period' : 'non-period'} date`
    );

    setCurrentPeriodDates((prev) => {
      let newDates;
      if (shouldBePeriodDate) {
        // Add date to period dates
        newDates = [...prev, dateString].sort();
      } else {
        // Remove date from period dates
        newDates = prev.filter((d) => d !== dateString);
      }

      // Check if there are changes from original
      const hasActualChanges =
        newDates.length !== originalPeriodDates.length ||
        !newDates.every((date) => originalPeriodDates.includes(date));

      setHasChanges(hasActualChanges);
      return newDates;
    });
  };

  const handleSaveChanges = async () => {
    if (!hasChanges) {
      console.log('No changes detected, skipping save');
      return;
    }

    console.log('=== SAVING PERIOD CHANGES (SIMPLIFIED) ===');
    console.log('Current period dates:', currentPeriodDates);
    console.log('Original period dates:', originalPeriodDates);

    try {
      // Calculate what actually changed
      const datesToAdd = currentPeriodDates.filter(date => !originalPeriodDates.includes(date));
      const datesToRemove = originalPeriodDates.filter(date => !currentPeriodDates.includes(date));
      
      console.log('Dates to add:', datesToAdd);
      console.log('Dates to remove:', datesToRemove);
      
      // Use the simplified endpoint that only needs the changes
      const result = await logPeriodDays.mutateAsync({
        dates_to_add: datesToAdd,
        dates_to_remove: datesToRemove,
      });

      console.log('Successfully saved period changes with new simplified API');
      console.log('Save result:', result);

      // Add a small delay before navigation to allow cache invalidation
      setTimeout(() => {
        setHasChanges(false);
        router.push('/(tabs)/cycle');
      }, 500);
    } catch (error) {
      console.error('Failed to save period changes:', error);
      // Don't navigate back on error, let user try again
    }
  };

  return (
    <SubPageLayout
      title="Log Period"
      onBack={() => router.back()}
      rightElement={
        <TouchableOpacity
          onPress={handleSaveChanges}
          disabled={!hasChanges}
          className={`px-4 py-2 rounded-full ${
            hasChanges
              ? isDark
                ? 'bg-pink-600'
                : 'bg-pink-500'
              : isDark
              ? 'bg-gray-700'
              : 'bg-gray-300'
          }`}
        >
          <Text
            className={`font-medium ${
              hasChanges ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            Log
          </Text>
        </TouchableOpacity>
      }
    >
      <View className="flex-1">
        <ElegantPeriodCalendar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          periodDates={currentPeriodDates}
          predictedDates={predictedDates}
          editMode={true}
          onDateToggle={handleDateToggle}
          maxDate={currentCycleInfo?.next_period_prediction ? 
            new Date(new Date(currentCycleInfo.next_period_prediction.end_date).getTime() + 7 * 24 * 60 * 60 * 1000) : // Add 7 days buffer
            new Date()}
        />
      </View>
    </SubPageLayout>
  );
}
