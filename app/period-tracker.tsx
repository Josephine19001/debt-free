import { View, ScrollView, TouchableOpacity, Modal, Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { router } from 'expo-router';
import { useAppNavigation } from '@/lib/hooks/use-navigation';
import { useState } from 'react';
import SubPageLayout from '@/components/layouts/sub-page';
import { SubscriptionGuard } from '@/components/subscription-guard';
import { Heart, Droplets, Calendar, Plus, X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

// Import real data hooks
import { useLogPeriodData } from '@/lib/hooks/use-cycle-data';
import { getLocalDateString } from '@/lib/utils/date-helpers';

export default function PeriodTrackerScreen() {
  const { goBack } = useAppNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isStartDay, setIsStartDay] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<'light' | 'moderate' | 'heavy' | ''>('');
  const [selectedMood, setSelectedMood] = useState<
    'happy' | 'normal' | 'sad' | 'irritable' | 'anxious' | ''
  >('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const logPeriodData = useLogPeriodData();

  const symptoms = [
    'Cramps',
    'Headache',
    'Bloating',
    'Breast tenderness',
    'Mood swings',
    'Fatigue',
    'Nausea',
    'Back pain',
    'Acne',
    'Food cravings',
    'Insomnia',
    'Anxiety',
  ];

  const flowOptions = [
    { value: 'light', label: 'Light', color: '#FCA5A5' },
    { value: 'moderate', label: 'Moderate', color: '#F87171' },
    { value: 'heavy', label: 'Heavy', color: '#EF4444' },
  ];

  const moodOptions = [
    { value: 'happy', label: 'Happy', emoji: '😊' },
    { value: 'normal', label: 'Normal', emoji: '😐' },
    { value: 'sad', label: 'Sad', emoji: '😢' },
    { value: 'irritable', label: 'Irritable', emoji: '😤' },
    { value: 'anxious', label: 'Anxious', emoji: '😰' },
  ];

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleDatePress = () => {
    setShowDatePicker(true);
  };

  const handleSave = () => {
    const dateString = getLocalDateString(selectedDate);

    logPeriodData.mutate(
      {
        date: dateString,
        is_start_day: isStartDay,
        flow_intensity: selectedFlow as any,
        mood: selectedMood as any,
        symptoms: selectedSymptoms,
      },
      {
        onSuccess: () => {
          // Close the modal and navigate back
          goBack();
        },
        onError: (error) => {
          console.error('Error saving period log:', error);
          // You could add a toast notification here if needed
        },
      }
    );
  };

  const isFormValid = selectedFlow || selectedMood || selectedSymptoms.length > 0;

  return (
    <SubscriptionGuard requireSubscription={true} feature="Cycle Tracking">
      <SubPageLayout
        title="Log Period"
        rightElement={
          <Button
            title="Save"
            onPress={handleSave}
            variant="primary"
            size="small"
            disabled={!isFormValid || logPeriodData.isPending}
            loading={logPeriodData.isPending}
          />
        }
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-4 pt-6">
            {/* Date Selection */}
            <View className="mb-6">
              <Text className="text-base font-medium text-black mb-3">Date</Text>
              <TouchableOpacity
                onPress={handleDatePress}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Calendar size={20} color="#EC4899" />
                    <Text className="text-black ml-3 font-medium">
                      {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                  <Text className="text-pink-600 text-sm font-medium">Change</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Period Start Toggle */}
            <View className="mb-6">
              <Text className="text-base font-medium text-black mb-3">Period Status</Text>
              <TouchableOpacity
                onPress={() => setIsStartDay(!isStartDay)}
                className={`p-4 rounded-xl border-2 ${
                  isStartDay ? 'bg-pink-50 border-pink-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <View className="flex-row items-center">
                  <Droplets size={20} color={isStartDay ? '#EC4899' : '#6B7280'} />
                  <Text
                    className={`ml-3 font-medium ${isStartDay ? 'text-pink-700' : 'text-gray-700'}`}
                  >
                    {isStartDay ? 'Period started today' : 'Regular period day'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Flow Intensity */}
            <View className="mb-6">
              <Text className="text-base font-medium text-black mb-3">Flow</Text>
              <View className="flex-row gap-3">
                {flowOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setSelectedFlow(option.value as any)}
                    className={`flex-1 p-3 rounded-xl border ${
                      selectedFlow === option.value
                        ? 'bg-pink-50 border-pink-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-center font-medium ${
                        selectedFlow === option.value ? 'text-pink-700' : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Mood */}
            <View className="mb-6">
              <Text className="text-base font-medium text-black mb-3">Mood</Text>
              <View className="flex-row flex-wrap gap-2">
                {moodOptions.map((mood) => (
                  <TouchableOpacity
                    key={mood.value}
                    onPress={() => setSelectedMood(mood.value as any)}
                    className={`px-4 py-3 rounded-xl border ${
                      selectedMood === mood.value
                        ? 'bg-purple-50 border-purple-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <View className="flex-row items-center">
                      <Text className="text-lg mr-2">{mood.emoji}</Text>
                      <Text
                        className={`font-medium ${
                          selectedMood === mood.value ? 'text-purple-700' : 'text-gray-700'
                        }`}
                      >
                        {mood.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Symptoms */}
            <View className="mb-6">
              <Text className="text-base font-medium text-black mb-3">Symptoms</Text>
              <View className="flex-row flex-wrap gap-2">
                {symptoms.map((symptom) => (
                  <TouchableOpacity
                    key={symptom}
                    onPress={() => toggleSymptom(symptom)}
                    className={`px-3 py-2 rounded-lg border ${
                      selectedSymptoms.includes(symptom)
                        ? 'bg-orange-50 border-orange-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        selectedSymptoms.includes(symptom) ? 'text-orange-700' : 'text-gray-700'
                      }`}
                    >
                      {symptom}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Summary */}
            {isFormValid && (
              <View className="bg-pink-50 rounded-xl p-4 mb-6 border border-pink-200">
                <Text className="font-medium text-pink-900 mb-2">Summary</Text>
                <View className="space-y-1">
                  {isStartDay && <Text className="text-pink-700 text-sm">• Period started</Text>}
                  {selectedFlow && (
                    <Text className="text-pink-700 text-sm">• {selectedFlow} flow</Text>
                  )}
                  {selectedMood && (
                    <Text className="text-pink-700 text-sm">• Feeling {selectedMood}</Text>
                  )}
                  {selectedSymptoms.length > 0 && (
                    <Text className="text-pink-700 text-sm">
                      • {selectedSymptoms.length} symptom{selectedSymptoms.length > 1 ? 's' : ''}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Date Picker */}
        {Platform.OS === 'ios' ? (
          <Modal
            visible={showDatePicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View className="flex-1 justify-end bg-black/50">
              <View className="bg-white rounded-t-3xl">
                {/* Header */}
                <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text className="text-pink-600 font-medium">Cancel</Text>
                  </TouchableOpacity>
                  <Text className="text-lg font-semibold text-black">Select Date</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text className="text-pink-600 font-medium">Done</Text>
                  </TouchableOpacity>
                </View>

                {/* Date Picker */}
                <View className="pb-8">
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    style={{ height: 200 }}
                  />
                </View>
              </View>
            </View>
          </Modal>
        ) : (
          showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )
        )}
      </SubPageLayout>
    </SubscriptionGuard>
  );
}
