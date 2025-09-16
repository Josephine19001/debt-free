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
import { Heart, Zap, Battery, BatteryLow, Calendar, Check } from 'lucide-react-native';
import { useMoodForDate, useLogDailyMood } from '@/lib/hooks/use-daily-moods';
import { getLocalDateString } from '@/lib/utils/date-helpers';
import {
  AmazingIcon,
  SmileIcon,
  OkayIcon,
  ToughIcon,
  StrugglingIcon,
} from '@/components/icons/mood-icons';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/theme-provider';

export default function LogMoodScreen() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const selectedDate = date || getLocalDateString(new Date());
  const { isDark } = useTheme();
  
  const [selectedMood, setSelectedMood] = useState<
    'happy' | 'normal' | 'sad' | 'irritable' | 'anxious' | ''
  >('');
  const [selectedEnergy, setSelectedEnergy] = useState<'high' | 'medium' | 'low' | ''>('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const logDailyMood = useLogDailyMood();
  const { data: moodForDate } = useMoodForDate(selectedDate);

  // Set initial state from existing data
  useEffect(() => {
    // Reset state first to ensure clean slate for each date
    setSelectedMood('');
    setSelectedEnergy('');
    setNotes('');
    
    // Then populate with data if it exists for this specific date
    if (moodForDate) {
      if (moodForDate.mood) {
        setSelectedMood(moodForDate.mood);
      }
      if (moodForDate.energy_level) {
        setSelectedEnergy(moodForDate.energy_level);
      }
      if (moodForDate.notes) {
        setNotes(moodForDate.notes);
      }
    }
  }, [moodForDate, selectedDate]);

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

  const moodOptions = [
    { value: 'happy', label: 'Amazing', icon: 'amazing' },
    { value: 'normal', label: 'Good', icon: 'smile' },
    { value: 'sad', label: 'Okay', icon: 'okay' },
    { value: 'irritable', label: 'Tough', icon: 'tough' },
    { value: 'anxious', label: 'Struggling', icon: 'struggling' },
  ];

  const energyOptions = [
    { value: 'high', label: 'High Energy', icon: 'zap' },
    { value: 'medium', label: 'Medium Energy', icon: 'battery' },
    { value: 'low', label: 'Low Energy', icon: 'battery-low' },
  ];

  const handleSave = () => {
    if (!selectedMood) return;

    setIsLoading(true);

    // Log mood using direct Supabase function
    logDailyMood.mutate(
      {
        date: selectedDate,
        mood: selectedMood as any,
        energy_level: selectedEnergy || undefined,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setIsLoading(false);
          // Navigate back to cycle tab specifically
          router.push('/(tabs)/cycle');
        },
        onError: (error) => {
          console.error('Error saving mood log:', error);
          setIsLoading(false);
        },
      }
    );
  };

  const isFormValid = selectedMood;

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <SubPageLayout
        title="Log Mood"
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
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
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
                <Text className={`text-3xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
                  How are you feeling today?
                </Text>
                <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-base`}>
                  Choose the emoji that best matches your current mood.
                </Text>
              </View>

              {/* Mood Selection */}
              <View className="mb-8">
                <View style={{ gap: 20 }}>
                  {moodOptions.map((option) => {
                    const isSelected = selectedMood === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => setSelectedMood(option.value as any)}
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
                          {option.icon === 'amazing' && <AmazingIcon size={60} />}
                          {option.icon === 'smile' && <SmileIcon size={60} />}
                          {option.icon === 'okay' && <OkayIcon size={60} />}
                          {option.icon === 'tough' && <ToughIcon size={60} />}
                          {option.icon === 'struggling' && <StrugglingIcon size={60} />}
                        </View>
                        <View className="flex-1">
                          <Text className={`text-xl font-medium ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{option.label}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Energy Level Selection */}
              {/* <View className="mb-8">
                <Text className="text-xl font-semibold text-gray-900 mb-4">Energy Level</Text>
                <View style={{ gap: 16 }}>
                  {energyOptions.map((option) => {
                    const isSelected = selectedEnergy === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => setSelectedEnergy(option.value as any)}
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
                        <View className="mr-4">
                          {option.icon === 'zap' && <Zap size={32} color="#EC4899" />}
                          {option.icon === 'battery' && <Battery size={32} color="#EC4899" />}
                          {option.icon === 'battery-low' && (
                            <BatteryLow size={32} color="#EC4899" />
                          )}
                        </View>
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
              </View> */}

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
                    placeholder="Add any additional notes..."
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
