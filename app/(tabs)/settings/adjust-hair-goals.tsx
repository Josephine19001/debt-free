import { useState, useEffect } from 'react';
import { View, Modal, FlatList, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import SettingsDetailItem from '@/components/settings-detail-item';
import { HairGoalsSkeleton } from '@/components/ui';
import { SubPageLayout } from '@/components/layouts';
import { api } from '@/lib/api';
import type { HairProfile } from '@/lib/api/types';
import { toast } from 'sonner-native';

export default function AdjustHairGoalsScreen() {
  const [hairProfile, setHairProfile] = useState<HairProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<{
    hairTexture: string[];
    hairPorosity: string[];
    hairDensity: string[];
    scalpType: string[];
    hairLength: string[];
    treatmentTypes: string[];
    concerns: string[];
    goals: string[];
    frequency: string[];
    timeAvailable: string[];
    budget: string[];
  } | null>(null);

  const [editingField, setEditingField] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownOptions, setDropdownOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [hairProfile, formOptions] = await Promise.all([
        api.profiles.getProfile(),
        api.profiles.getOptions(),
      ]);
      setHairProfile(hairProfile);
      setOptions(formOptions);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load your hair profile');
    } finally {
      setLoading(false);
    }
  };

  const formatOptions = (optionValues: string[]): { label: string; value: string }[] => {
    return optionValues.map((value) => ({
      label: value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' '),
      value,
    }));
  };

  const handleEdit = (field: string) => {
    if (!options) return;

    let optionValues: string[] = [];

    switch (field) {
      case 'goals':
        optionValues = options.goals;
        break;
      case 'hairPorosity':
        optionValues = options.hairPorosity;
        break;
      case 'preferences.frequency':
        optionValues = options.frequency;
        break;
      case 'hairLength':
        optionValues = options.hairLength;
        break;
      case 'hairDensity':
        optionValues = options.hairDensity;
        break;
      default:
        return;
    }

    setDropdownOptions(formatOptions(optionValues));
    setEditingField(field);
    setShowDropdown(true);
  };

  const handleSelectOption = async (selectedValue: string) => {
    if (!hairProfile || !editingField) return;

    try {
      let updateData: any = {};

      if (editingField === 'goals') {
        const currentGoals = hairProfile.goals || [];
        const newGoals = currentGoals.includes(selectedValue)
          ? currentGoals.filter((g) => g !== selectedValue)
          : [...currentGoals, selectedValue];
        updateData.goals = newGoals;

        setHairProfile((prev) => (prev ? { ...prev, goals: newGoals } : null));
      } else if (editingField === 'preferences.frequency') {
        updateData.preferences = {
          ...hairProfile.preferences,
          frequency: selectedValue as any,
        };

        setHairProfile((prev) =>
          prev
            ? {
                ...prev,
                preferences: { ...prev.preferences, frequency: selectedValue as any },
              }
            : null
        );
      } else {
        updateData[editingField] = selectedValue;
        setHairProfile((prev) => (prev ? { ...prev, [editingField]: selectedValue } : null));
      }

      // Close the modal immediately for better UX
      setShowDropdown(false);
      setEditingField(null);

      await api.profiles.updateProfile(updateData);
      toast.success('Hair profile updated successfully');
    } catch (error) {
      console.error('Failed to update hair profile:', error);
      toast.error('Failed to update your hair profile. Please try again.');
      await loadData();
    }
  };

  const getDisplayValue = (field: string): string => {
    if (!hairProfile || !options) return '';

    const formatValue = (value: string) =>
      value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ');

    switch (field) {
      case 'goals':
        const goals = hairProfile.goals || [];
        return goals.length > 0 ? goals.map(formatValue).join(', ') : 'None selected';
      case 'hairPorosity':
        return formatValue(hairProfile.hairPorosity);
      case 'preferences.frequency':
        const frequency = hairProfile.preferences?.frequency;
        return frequency ? formatValue(frequency) : 'Not set';
      case 'hairLength':
        return formatValue(hairProfile.hairLength);
      case 'hairDensity':
        return formatValue(hairProfile.hairDensity);
      default:
        return '';
    }
  };

  const isOptionSelected = (value: string): boolean => {
    if (!hairProfile || !editingField) return false;

    switch (editingField) {
      case 'goals':
        return hairProfile.goals?.includes(value) || false;
      case 'hairPorosity':
        return hairProfile.hairPorosity === value;
      case 'preferences.frequency':
        return hairProfile.preferences?.frequency === value;
      case 'hairLength':
        return hairProfile.hairLength === value;
      case 'hairDensity':
        return hairProfile.hairDensity === value;
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <SubPageLayout title="Adjust Hair Goals">
        <HairGoalsSkeleton />
      </SubPageLayout>
    );
  }

  if (!hairProfile || !options) {
    return (
      <SubPageLayout title="Adjust Hair Goals">
        <View className="bg-white mx-4 p-4 rounded-2xl shadow flex justify-center items-center h-32">
          <Text className="text-gray-500">No hair profile found</Text>
        </View>
      </SubPageLayout>
    );
  }

  const fields = [
    { key: 'goals', label: 'Hair Goals' },
    { key: 'hairLength', label: 'Hair Length' },
    { key: 'hairDensity', label: 'Hair Density' },
    { key: 'hairPorosity', label: 'Hair Porosity' },
    { key: 'preferences.frequency', label: 'Routine Frequency' },
  ];

  return (
    <SubPageLayout title="Adjust Hair Goals">
      <View className="bg-white mx-4 p-4 rounded-2xl shadow flex flex-col gap-4">
        {fields.map((field, index) => (
          <SettingsDetailItem
            key={field.key}
            label={field.label}
            value={getDisplayValue(field.key)}
            isEditing={false}
            tempValue=""
            onEdit={() => handleEdit(field.key)}
            onSave={() => {}}
            onChangeText={() => {}}
            isLast={index === fields.length - 1}
          />
        ))}
      </View>

      <Modal visible={showDropdown} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/40 px-6">
          <View className="bg-white w-full rounded-xl max-h-[300px]">
            <View className="px-4 py-3 border-b border-gray-200">
              <Text className="text-lg font-semibold text-center">
                {editingField === 'goals' && 'Select Hair Goals'}
                {editingField === 'hairPorosity' && 'Select Hair Porosity'}
                {editingField === 'preferences.frequency' && 'Select Routine Frequency'}
                {editingField === 'hairLength' && 'Select Hair Length'}
                {editingField === 'hairDensity' && 'Select Hair Density'}
              </Text>
              {editingField === 'goals' && (
                <Text className="text-sm text-gray-500 text-center mt-1">
                  Tap to select/deselect multiple goals
                </Text>
              )}
            </View>
            <FlatList
              data={dropdownOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected = isOptionSelected(item.value);
                return (
                  <TouchableOpacity
                    onPress={() => handleSelectOption(item.value)}
                    className={`px-4 py-4 border-b border-gray-100 flex-row justify-between items-center ${
                      isSelected ? 'bg-gray-100' : ''
                    }`}
                  >
                    <Text
                      className={`text-base ${isSelected ? 'text-black font-semibold' : 'text-black'}`}
                    >
                      {item.label}
                    </Text>
                    {isSelected && <Text className="text-black font-bold">✓</Text>}
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity
              onPress={() => {
                setEditingField(null);
                setShowDropdown(false);
              }}
              className="px-4 py-3 border-t border-gray-200"
            >
              <Text className="text-base text-gray-500 text-center">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SubPageLayout>
  );
}
