import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, Dimensions, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import { ChevronDown } from 'lucide-react-native';
import { useTheme } from '@/context/theme-provider';
import { getLocalDateString } from '@/lib/utils/date-helpers';

interface ElegantPeriodCalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  periodDates: string[]; // Array of period dates
  predictedDates?: string[]; // Array of predicted period dates
  onDateToggle?: (date: Date, isPeriodDate: boolean) => void; // For editing period dates
  editMode?: boolean; // Whether calendar is in edit mode
  minDate?: Date; // Minimum selectable date
  maxDate?: Date; // Maximum selectable date
}

interface MonthData {
  year: number;
  month: number;
  monthName: string;
  days: (number | null)[];
}

const { width: screenWidth } = Dimensions.get('window');

export function ElegantPeriodCalendar({
  selectedDate = new Date(),
  onDateSelect,
  periodDates = [],
  predictedDates = [],
  onDateToggle,
  editMode = false,
  minDate,
  maxDate = new Date(),
}: ElegantPeriodCalendarProps) {
  const { isDark } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showYearPicker, setShowYearPicker] = useState(false);

  // Generate months for selected year
  const generateMonthsForYear = useCallback((): MonthData[] => {
    const months: MonthData[] = [];
    
    // Generate all 12 months for the selected year
    for (let month = 0; month < 12; month++) {
      const year = selectedYear;
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();
      
      // Create calendar grid
      const days: (number | null)[] = [];
      
      // Add empty cells for days before month starts
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }
      
      // Add all days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
      }
      
      // Add to months array
      months.push({
        year,
        month,
        monthName: firstDay.toLocaleDateString('en-US', { month: 'long' }),
        days,
      });
    }
    
    return months;
  }, [selectedYear]);

  const months = useMemo(() => generateMonthsForYear(), [generateMonthsForYear]);

  // Available years (2024 to current year + 1)
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 2024; year <= currentYear + 1; year++) {
      years.push(year);
    }
    return years;
  }, []);

  // Scroll to current month when component mounts or year changes
  useEffect(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const timeout = setTimeout(() => {
      if (selectedYear === currentYear) {
        // Calculate scroll position accounting for month spacing
        // Each month takes approximately 320px (header + calendar + margin)
        const scrollPosition = currentMonth * 320;
        
        scrollViewRef.current?.scrollTo({
          y: scrollPosition,
          animated: true,
        });
      } else {
        // For other years, scroll to top (January)
        scrollViewRef.current?.scrollTo({
          y: 0,
          animated: false,
        });
      }
    }, 150);
    
    return () => clearTimeout(timeout);
  }, [selectedYear]);

  // Initial scroll to current month on first mount
  useEffect(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    if (selectedYear === currentYear) {
      const timeout = setTimeout(() => {
        // Calculate scroll position for current month
        const scrollPosition = currentMonth * 320;
        
        scrollViewRef.current?.scrollTo({
          y: scrollPosition,
          animated: false, // No animation on initial load
        });
      }, 300); // Longer delay for initial load to ensure layout is ready
      
      return () => clearTimeout(timeout);
    }
  }, []); // Empty dependency array for initial mount only

  const isDateInPeriod = useCallback((year: number, month: number, day: number): boolean => {
    const dateString = getLocalDateString(new Date(year, month, day));
    return periodDates.includes(dateString);
  }, [periodDates]);

  const isDatePredicted = useCallback((year: number, month: number, day: number): boolean => {
    const dateString = getLocalDateString(new Date(year, month, day));
    return predictedDates?.includes(dateString) || false;
  }, [predictedDates]);

  const isToday = useCallback((year: number, month: number, day: number): boolean => {
    const today = new Date();
    const date = new Date(year, month, day);
    return date.toDateString() === today.toDateString();
  }, []);

  const isSelectedDate = useCallback((year: number, month: number, day: number): boolean => {
    const date = new Date(year, month, day);
    return selectedDate?.toDateString() === date.toDateString();
  }, [selectedDate]);

  const isDateDisabled = useCallback((year: number, month: number, day: number): boolean => {
    const date = new Date(year, month, day);
    
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    
    return false;
  }, [minDate, maxDate]);

  const handleDayPress = useCallback((year: number, month: number, day: number) => {
    if (isDateDisabled(year, month, day)) return;
    
    const date = new Date(year, month, day);
    
    if (editMode && onDateToggle) {
      const isPeriodDate = isDateInPeriod(year, month, day);
      onDateToggle(date, !isPeriodDate); // Toggle the period state
    } else if (onDateSelect) {
      onDateSelect(date);
    }
  }, [editMode, onDateToggle, onDateSelect, isDateDisabled, isDateInPeriod]);

  const getDayStyle = useCallback((year: number, month: number, day: number) => {
    const isPeriod = isDateInPeriod(year, month, day);
    const isPredicted = isDatePredicted(year, month, day);
    const isSelected = isSelectedDate(year, month, day);
    const isTodayDate = isToday(year, month, day);
    const isDisabled = isDateDisabled(year, month, day);

    // Base circle style
    let circleClass = 'w-10 h-10 rounded-full items-center justify-center';
    let textClass = 'text-sm font-medium';

    if (isDisabled) {
      // Disabled dates - very faded
      circleClass += ` ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`;
      textClass += ` ${isDark ? 'text-gray-600' : 'text-gray-300'}`;
    } else if (isSelected) {
      // Selected date - prominent highlight
      circleClass += ` ${isDark ? 'bg-pink-500' : 'bg-pink-500'}`;
      textClass += ' text-white';
    } else if (isPeriod) {
      // Period dates - filled red circles
      circleClass += ` ${isDark ? 'bg-red-400' : 'bg-red-500'}`;
      textClass += ' text-white';
    } else if (isPredicted) {
      // Predicted dates - dashed border like moon phases
      circleClass += ` ${isDark ? 'border-2 border-red-400 border-dashed bg-red-900/20' : 'border-2 border-red-400 border-dashed bg-red-50'}`;
      textClass += ` ${isDark ? 'text-red-300' : 'text-red-600'}`;
    } else if (isTodayDate) {
      // Today - primary color highlight
      circleClass += ` ${isDark ? 'bg-pink-500' : 'bg-pink-500'}`;
      textClass += ' text-white';
    } else {
      // Regular dates
      circleClass += ' bg-transparent';
      textClass += ` ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
    }

    return { circleClass, textClass };
  }, [isDark, isDateInPeriod, isDatePredicted, isSelectedDate, isToday, isDateDisabled]);

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Year selector and day names header */}
      <View className={`px-4 py-2 ${isDark ? 'bg-gray-800' : 'bg-white'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        {/* Year Picker */}
        <TouchableOpacity 
          onPress={() => setShowYearPicker(true)}
          className="flex-row items-center justify-center py-2 mb-2"
          activeOpacity={0.7}
        >
          <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mr-2`}>
            {selectedYear}
          </Text>
          <ChevronDown size={20} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>

        {/* Day names */}
        <View className="flex-row">
          {dayNames.map((dayName, index) => (
            <View key={index} className="flex-1 items-center py-2">
              <Text className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {dayName}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Infinite scroll calendar */}
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {months.map(({ year, month, monthName, days }) => (
          <View key={`${year}-${month}`} className="mb-8">
            {/* Month header */}
            <View className="px-4 py-4">
              <Text className={`text-2xl font-light tracking-wide ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {monthName}
              </Text>
            </View>

            {/* Calendar grid */}
            <View className="px-4">
              <View className="flex-row flex-wrap">
                {days.map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => day && handleDayPress(year, month, day)}
                    disabled={!day || isDateDisabled(year, month, day)}
                    className="w-[14.28%] aspect-square items-center justify-center p-1"
                    activeOpacity={0.7}
                  >
                    {day ? (
                      <View className="relative w-full h-full items-center justify-center">
                        {(() => {
                          const { circleClass, textClass } = getDayStyle(year, month, day);
                          return (
                            <View className={circleClass}>
                              <Text className={textClass}>
                                {day}
                              </Text>
                            </View>
                          );
                        })()}
                      </View>
                    ) : null}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Legend */}
      {!editMode && (
        <View className={`px-4 py-4 pb-8 ${isDark ? 'bg-gray-800' : 'bg-white'} border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <View className="flex-row justify-around items-center">
            <View className="flex-row items-center">
              <View className={`w-4 h-4 rounded-full mr-2 ${isDark ? 'bg-pink-500' : 'bg-pink-500'}`} />
              <Text className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Today</Text>
            </View>
            <View className="flex-row items-center">
              <View className={`w-4 h-4 rounded-full mr-2 ${isDark ? 'bg-red-400' : 'bg-red-500'}`} />
              <Text className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Period</Text>
            </View>
            <View className="flex-row items-center">
              <View className={`w-4 h-4 rounded-full mr-2 border-2 border-dashed ${isDark ? 'border-red-400 bg-red-900/20' : 'border-red-400 bg-red-50'}`} />
              <Text className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Predicted</Text>
            </View>
          </View>
        </View>
      )}

      {/* Year Picker Modal */}
      {showYearPicker && (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
          presentationStyle="overFullScreen"
          onRequestClose={() => setShowYearPicker(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <TouchableOpacity 
              className="flex-1"
              activeOpacity={1}
              onPress={() => setShowYearPicker(false)}
            />
            
            <View 
              className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-t-3xl`}
              style={{ maxHeight: '70%' }}
            >
            {/* Handle Bar */}
            <View className="items-center pt-3 pb-2">
              <View className={`w-10 h-1 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`} />
            </View>
            
            {/* Header */}
            <View className="items-center py-4 px-6">
              <Text className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Select Year
              </Text>
            </View>
            
            {/* Year Options */}
            <ScrollView 
              className="max-h-80 px-6" 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <View className="flex-row flex-wrap justify-center">
                {availableYears.slice().reverse().map((year) => (
                  <TouchableOpacity
                    key={year}
                    onPress={() => {
                      setSelectedYear(year);
                      setShowYearPicker(false);
                    }}
                    className={`w-20 py-4 px-3 rounded-2xl m-2 ${
                      year === selectedYear
                        ? 'bg-pink-500'
                        : (isDark ? 'bg-gray-700' : 'bg-gray-100')
                    }`}
                  >
                    <Text className={`text-center text-lg font-semibold ${
                      year === selectedYear
                        ? 'text-white'
                        : (isDark ? 'text-gray-200' : 'text-gray-800')
                    }`}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            {/* Cancel Button */}
            <View className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} mx-6 mt-4`}>
              <TouchableOpacity
                onPress={() => setShowYearPicker(false)}
                className="py-4"
              >
                <Text className="text-pink-600 font-semibold text-center text-lg">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
            
              {/* Safe Area Bottom Spacing */}
              <View className="h-8" />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}