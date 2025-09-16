import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import SubPageLayout from '@/components/layouts/sub-page';
import { Check } from 'lucide-react-native';
import { useSymptomsForDate, useLogDailySymptoms } from '@/lib/hooks/use-daily-symptoms';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/theme-provider';
import { getLocalDateString } from '@/lib/utils/date-helpers';
import {
  CrampsIcon,
  HeadacheIcon,
  MoodSwingsIcon,
  BloatingIcon,
  FatigueIcon,
  BreastTendernessIcon,
  BackPainIcon,
  NauseaIcon,
  AcneIcon,
  FoodCravingsIcon,
  InsomniaIcon,
  AnxietyIcon,
} from '@/components/icons/symptom-icons';

export default function LogSymptomsScreen() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const selectedDate = date || getLocalDateString(new Date());
  const { isDark } = useTheme();
  
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<'mild' | 'moderate' | 'severe' | ''>('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const logDailySymptoms = useLogDailySymptoms();
  const { data: symptomsForDate } = useSymptomsForDate(selectedDate);

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Set initial state from existing data
  useEffect(() => {
    // Reset state first to ensure clean slate for each date
    setSelectedSymptoms([]);
    setSelectedSeverity('');
    setNotes('');
    
    // Then populate with data if it exists for this specific date
    if (symptomsForDate) {
      if (symptomsForDate.symptoms && symptomsForDate.symptoms.length > 0) {
        setSelectedSymptoms(symptomsForDate.symptoms);
      }
      if (symptomsForDate.severity) {
        setSelectedSeverity(symptomsForDate.severity);
      }
      if (symptomsForDate.notes) {
        setNotes(symptomsForDate.notes);
      }
    }
  }, [symptomsForDate, selectedDate]);

  const symptomOptions = [
    { value: 'cramps', label: 'Cramps', icon: 'cramps' },
    { value: 'headache', label: 'Headache', icon: 'headache' },
    { value: 'mood_swings', label: 'Mood Swings', icon: 'mood_swings' },
    { value: 'fatigue', label: 'Fatigue', icon: 'fatigue' },
    { value: 'nausea', label: 'Nausea', icon: 'nausea' },
    { value: 'insomnia', label: 'Insomnia', icon: 'insomnia' },
    { value: 'anxiety', label: 'Anxiety', icon: 'anxiety' },
    { value: 'food_cravings', label: 'Food Cravings', icon: 'food_cravings' },
    { value: 'acne', label: 'Acne', icon: 'acne' },
    { value: 'breast_tenderness', label: 'Breast Tenderness', icon: 'breast_tenderness' },
    { value: 'bloating', label: 'Bloating', icon: 'bloating' },
    { value: 'back_pain', label: 'Back Pain', icon: 'back_pain' },
  ];

  const severityOptions = [
    { value: 'mild', label: 'Mild' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'severe', label: 'Severe' },
  ];

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleSave = () => {
    if (selectedSymptoms.length === 0) return;

    setIsLoading(true);

    // Log symptoms using direct Supabase function
    logDailySymptoms.mutate(
      {
        date: selectedDate,
        symptoms: selectedSymptoms,
        severity: selectedSeverity || undefined,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setIsLoading(false);
          // Navigate back to cycle tab specifically
          router.push('/(tabs)/cycle');
        },
        onError: (error) => {
          console.error('Error saving symptom log:', error);
          setIsLoading(false);
        },
      }
    );
  };

  const isFormValid = selectedSymptoms.length > 0;

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <SubPageLayout
        title="Log Symptoms"
        onBack={() => router.back()}
        rightElement={
          <Button
            title="Log"
            onPress={handleSave}
            variant="primary"
            size="small"
            disabled={!isFormValid || isLoading}
            loading={isLoading}
          />
        }
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View
              className="px-4 pt-6"
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              {/* Header */}
              <View className="mb-8">
                <Text className={`text-3xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-4`}>Track Your Symptoms</Text>
                <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-base`}>
                  Select any symptoms you're experiencing today.
                </Text>
              </View>

              {/* Symptom Selection */}
              <View className="mb-8">
                <View style={{ gap: 16 }}>
                  {symptomOptions.map((option) => {
                    const isSelected = selectedSymptoms.includes(option.value);
                    return (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => handleSymptomToggle(option.value)}
                        className="flex-row items-center p-6 rounded-2xl"
                        style={{
                          backgroundColor: isSelected
                            ? isDark ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255, 182, 193, 0.3)'
                            : isDark ? 'rgba(55, 65, 81, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                          borderWidth: isSelected ? 1 : 0,
                          borderColor: isSelected ? '#EC4899' : 'transparent',
                          shadowColor: isDark ? '#EC4899' : '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: isDark ? 0.2 : 0.1,
                          shadowRadius: 8,
                          elevation: 3,
                        }}
                      >
                        <View className="mr-6">
                          {option.icon === 'cramps' && <CrampsIcon size={60} />}
                          {option.icon === 'headache' && <HeadacheIcon size={60} />}
                          {option.icon === 'mood_swings' && <MoodSwingsIcon size={60} />}
                          {option.icon === 'bloating' && <BloatingIcon size={60} />}
                          {option.icon === 'fatigue' && <FatigueIcon size={60} />}
                          {option.icon === 'breast_tenderness' && (
                            <BreastTendernessIcon size={60} />
                          )}
                          {option.icon === 'back_pain' && <BackPainIcon size={60} />}
                          {option.icon === 'nausea' && <NauseaIcon size={60} />}
                          {option.icon === 'acne' && <AcneIcon size={60} />}
                          {option.icon === 'food_cravings' && <FoodCravingsIcon size={60} />}
                          {option.icon === 'insomnia' && <InsomniaIcon size={60} />}
                          {option.icon === 'anxiety' && <AnxietyIcon size={60} />}
                        </View>
                        <View className="flex-1">
                          <Text className={`text-xl font-medium ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{option.label}</Text>
                        </View>
                        {isSelected && (
                          <View
                            className="w-6 h-6 rounded-full items-center justify-center"
                            style={{ backgroundColor: '#EC4899' }}
                          >
                            <Check size={16} color="white" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Severity Level */}
              {/* {selectedSymptoms.length > 0 && (
                <View className="mb-8">
                  <Text className="text-xl font-semibold text-gray-900 mb-4">Severity Level</Text>
                  <View style={{ gap: 16 }}>
                    {severityOptions.map((option) => {
                      const isSelected = selectedSeverity === option.value;
                      return (
                        <TouchableOpacity
                          key={option.value}
                          onPress={() => setSelectedSeverity(option.value as any)}
                          className="flex-row items-center p-4 rounded-2xl"
                          style={{
                            backgroundColor: isSelected
                              ? 'rgba(255, 182, 193, 0.3)'
                              : 'rgba(255, 255, 255, 0.8)',
                            borderWidth: 0,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 8,
                            elevation: 3,
                          }}
                        >
                          <View className="flex-1">
                            <Text className="text-lg font-semibold text-gray-900">
                              {option.label}
                            </Text>
                          </View>
                          {isSelected && (
                            <View
                              className="w-6 h-6 rounded-full items-center justify-center"
                              style={{ backgroundColor: '#EC4899' }}
                            >
                              <Check size={16} color="white" />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )} */}

              {/* Notes Section */}
              {/* <View className="mb-8">
                <Text className="text-lg font-semibold text-black mb-4">Notes</Text>
                <View
                  className="bg-white rounded-2xl border border-gray-200 p-4"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Add any additional details..."
                    multiline
                    numberOfLines={3}
                    className="text-gray-800 text-base leading-relaxed"
                    style={{ textAlignVertical: 'top', minHeight: 80 }}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View> */}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SubPageLayout>
    </View>
  );
}
