import { useState, useEffect } from 'react';
import { View, Pressable, Modal, Platform, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { Calendar } from 'react-native-calendars';
import SettingsDetailItem from '@/components/settings-detail-item';
import { PersonalDetailsSkeleton } from '@/components/ui';
import { cn } from '@/lib/utils';
import { SubPageLayout } from '@/components/layouts';
import { useColorScheme } from 'react-native';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-provider';
import type { Account } from '@/lib/api/types';
import { toast } from 'sonner-native';

export default function PersonalDetailsScreen() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const [details, setDetails] = useState({
    name: '',
    dateOfBirth: new Date('1999-05-22'),
  });
  const [loading, setLoading] = useState(true);

  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    loadAccountData();
  }, []);

  const loadAccountData = async () => {
    try {
      setLoading(true);
      const account = await api.accounts.getAccount();

      setDetails({
        name: account.name || '',
        dateOfBirth: account.dateOfBirth ? new Date(account.dateOfBirth) : new Date('1999-05-22'),
      });
    } catch (error) {
      console.error('Failed to load account data:', error);
      Alert.alert('Error', 'Failed to load your account information');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field: string, value: string | Date) => {
    if (field === 'dateOfBirth') {
      setShowCalendar(true);
    } else {
      setEditingField(field);
      setTempValue(typeof value === 'string' ? value : value.toLocaleDateString());
    }
  };

  const handleSave = async (field: string) => {
    if (field === 'dateOfBirth') return;

    try {
      setDetails((prev) => ({ ...prev, [field]: tempValue }));

      if (field === 'name') {
        await api.accounts.updateAccount({ name: tempValue });
      }

      setEditingField(null);
    } catch (error) {
      console.error('Failed to update account:', error);
      toast.error('Failed to update your information. Please try again.');
      await loadAccountData();
    }
  };

  const handleDateSelect = async (day: { dateString: string }) => {
    const selectedDate = new Date(day.dateString);

    try {
      setDetails((prev) => ({ ...prev, dateOfBirth: selectedDate }));

      await api.accounts.updateAccount({ dateOfBirth: day.dateString });

      setShowCalendar(false);
    } catch (error) {
      console.error('Failed to update date of birth:', error);
      toast.error('Failed to update date of birth. Please try again.');
      await loadAccountData();
    }
  };

  if (loading) {
    return (
      <SubPageLayout title="Personal Details">
        <PersonalDetailsSkeleton />
      </SubPageLayout>
    );
  }

  return (
    <SubPageLayout title="Personal Details">
      <View className="bg-white mx-4 p-4 rounded-2xl shadow flex flex-col gap-4">
        {Object.entries(details).map(([field, value], index) => (
          <SettingsDetailItem
            key={field}
            label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
            value={value instanceof Date ? value.toLocaleDateString() : value}
            isEditing={editingField === field}
            tempValue={tempValue}
            onEdit={() => handleEdit(field, value)}
            onSave={() => handleSave(field)}
            onChangeText={setTempValue}
            isLast={index === Object.entries(details).length - 1}
          />
        ))}
      </View>

      {/* Calendar Modal */}
      <Modal visible={showCalendar} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Select Date of Birth</Text>
              <Pressable onPress={() => setShowCalendar(false)} className="px-4 py-2">
                <Text className="text-blue-500 font-medium">Cancel</Text>
              </Pressable>
            </View>

            <Calendar
              current={details.dateOfBirth.toISOString().split('T')[0]}
              onDayPress={handleDateSelect}
              maxDate={new Date().toISOString().split('T')[0]} // Can't select future dates
              minDate="1900-01-01"
              theme={{
                selectedDayBackgroundColor: '#000',
                selectedDayTextColor: '#fff',
                todayTextColor: '#000',
                dayTextColor: '#000',
                textDisabledColor: '#ccc',
                dotColor: '#000',
                selectedDotColor: '#fff',
                arrowColor: '#000',
                disabledArrowColor: '#ccc',
                monthTextColor: '#000',
                indicatorColor: '#000',
                textDayFontFamily: 'System',
                textMonthFontFamily: 'System',
                textDayHeaderFontFamily: 'System',
                textDayFontWeight: '400',
                textMonthFontWeight: '600',
                textDayHeaderFontWeight: '400',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14,
              }}
              style={{
                borderRadius: 12,
              }}
            />
          </View>
        </View>
      </Modal>
    </SubPageLayout>
  );
}
