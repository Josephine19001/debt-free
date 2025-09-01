import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Pill, Plus, CheckCircle, Clock, RefreshCw } from 'lucide-react-native';
import { router } from 'expo-router';
import { getAccurateCircularProgressStyles } from '@/lib/utils/progress-circle';
import { useQueryClient } from '@tanstack/react-query';
import {
  useDailySupplementStatus,
  useToggleSupplementTaken,
  DailySupplementStatus,
} from '@/lib/hooks/use-daily-supplement-tracking';

interface TodaysSupplementsProps {
  selectedDate: Date;
}

export function TodaysSupplements({ selectedDate }: TodaysSupplementsProps) {
  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const queryClient = useQueryClient();

  // Format date for API
  const dateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  // Use new daily supplement tracking
  const { data: supplementStatus = [], isLoading } = useDailySupplementStatus(dateString);
  const toggleSupplementTaken = useToggleSupplementTaken();

  const takenSupplements = supplementStatus.filter((s) => s.taken);
  const totalSupplements = supplementStatus.length;

  // Handle toggling supplement taken status
  const handleToggleSupplement = (status: DailySupplementStatus) => {
    toggleSupplementTaken.mutate({
      supplementId: status.supplement.id,
      supplementName: status.supplement.name,
      date: dateString,
      taken: !status.taken,
      dosage: status.supplement.default_dosage,
    });
  };

  // Debug logging
  React.useEffect(() => {
    if (supplementStatus.length > 0) {
      console.log('[TodaysSupplements] New system debug info:');
      console.log(`Selected date: ${selectedDate.toDateString()}`);
      console.log(`Date string: ${dateString}`);
      console.log(`Is today: ${isToday}`);
      console.log(`Supplement status:`, supplementStatus);
      console.log(`Taken supplements: ${takenSupplements.length}/${totalSupplements}`);
    }
  }, [
    supplementStatus,
    selectedDate,
    dateString,
    isToday,
    takenSupplements.length,
    totalSupplements,
  ]);

  // Get progress styles for circular progress
  const progressStyles = getAccurateCircularProgressStyles(
    takenSupplements.length,
    totalSupplements,
    '#10B981',
    60, // size
    4 // strokeWidth
  );

  if (isLoading) {
    return (
      <View className="px-4 mb-6">
        <View className="bg-white rounded-2xl p-4 border border-gray-100">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-2xl bg-green-100 items-center justify-center mr-3">
                <Pill size={20} color="#10B981" />
              </View>
              <Text className="text-lg font-semibold text-black">Supplements</Text>
            </View>
          </View>
          <View className="animate-pulse">
            <View className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
            <View className="h-3 bg-gray-200 rounded w-1/3" />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="px-4 mb-6">
      <View className="bg-white rounded-2xl p-4 border border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-2xl bg-green-100 items-center justify-center mr-3">
              <Pill size={20} color="#10B981" />
            </View>
            <Text className="text-lg font-semibold text-black">Supplements</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => router.push('/log-supplements')}
              className="w-8 h-8 rounded-full bg-green-50 items-center justify-center"
            >
              <Plus size={16} color="#10B981" />
            </TouchableOpacity>
          </View>
        </View>

        {supplementStatus.length > 0 ? (
          <>
            {/* Progress Summary with Circular Progress */}
            {/* <View className="bg-green-50 rounded-2xl p-4 mb-4"> */}
            {/* <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-green-900 text-xl font-bold">
                    {takenSupplements.length} of {totalSupplements}
                  </Text>
                  <Text className="text-green-700 text-sm">
                    {takenSupplements.length === totalSupplements
                      ? 'All supplements taken!'
                      : 'supplements completed'}
                  </Text>
                </View> */}

            {/* Circular Progress Ring */}
            {/* <View className="relative w-16 h-16 items-center justify-center"> */}
            {/* Background Circle */}
            {/* <View className="absolute rounded-full" style={progressStyles.backgroundCircle} /> */}

            {/* Progress Circle - partial progress */}
            {/* {progressStyles.progressCircle && (
                    <View className="absolute rounded-full" style={progressStyles.progressCircle} />
                  )} */}

            {/* Complete circle when 100% or more */}
            {/* {progressStyles.fullCircle && (
                    <View className="absolute rounded-full" style={progressStyles.fullCircle} />
                  )} */}

            {/* Center Content */}
            {/* <View className="absolute w-14 h-14 items-center justify-center">
                    <Text className="text-green-600 text-xs font-bold">
                      {totalSupplements > 0
                        ? Math.round((takenSupplements.length / totalSupplements) * 100)
                        : 0}
                      %
                    </Text>
                  </View> */}
            {/* </View>
              </View>
            </View> */}

            {/* Supplement List */}
            <View className="gap-3">
              {supplementStatus.map((status, index) => (
                <TouchableOpacity
                  key={status.supplement.id}
                  onPress={() => handleToggleSupplement(status)}
                  className={`flex-row items-center justify-between p-4 rounded-2xl border ${
                    status.taken ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'
                  }`}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 3,
                    elevation: 2,
                  }}
                >
                  <View className="flex-row items-center flex-1">
                    {/* Supplement Icon */}
                    <View
                      className={`w-10 h-10 rounded-2xl items-center justify-center mr-3 ${
                        status.taken ? 'bg-green-100' : 'bg-gray-100'
                      }`}
                    >
                      <Pill size={18} color={status.taken ? '#10B981' : '#6B7280'} />
                    </View>

                    <View className="flex-1">
                      <Text
                        className={`font-semibold ${
                          status.taken ? 'text-green-900' : 'text-gray-900'
                        }`}
                      >
                        {status.supplement.name}
                      </Text>
                      <Text
                        className={`text-sm ${status.taken ? 'text-green-600' : 'text-gray-500'}`}
                      >
                        {status.supplement.default_dosage}
                      </Text>
                      {status.entry?.time_taken && (
                        <Text className="text-xs text-green-500">
                          Taken at {status.entry.time_taken}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Status Indicator */}
                  <View className="ml-3">
                    {status.taken ? (
                      <View className="flex-row items-center">
                        <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center">
                          <CheckCircle size={14} color="white" />
                        </View>
                        <Text className="text-green-600 text-xs ml-2 font-medium">Taken</Text>
                      </View>
                    ) : (
                      <View className="flex-row items-center">
                        <View className="w-6 h-6 rounded-full border-2 border-gray-300" />
                        <Text className="text-gray-400 text-xs ml-2">Tap to mark taken</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <View className="items-center py-8">
            <View className="w-16 h-16 rounded-2xl bg-green-50 items-center justify-center mb-3">
              <Pill size={24} color="#10B981" />
            </View>
            <Text className="text-gray-600 text-center mb-3">No supplements tracked yet</Text>
            <TouchableOpacity
              onPress={() => router.push('/log-supplements')}
              className="bg-green-500 px-4 py-2 rounded-xl"
            >
              <Text className="text-white font-medium">Add Your First Supplement</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
