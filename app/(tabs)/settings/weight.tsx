import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import SubPageLayout from '@/components/layouts/sub-page';
import { useRouter } from 'expo-router';
import {
  useBodyMeasurements,
  useWeightHistory,
  useUpdateBodyMeasurements,
} from '@/lib/hooks/use-weight-tracking';

// Components
import { WeightStatsCards } from '@/components/weight/WeightStatsCards';
import { UnitSelector } from '@/components/weight/UnitSelector';
import { WeightHistory } from '@/components/weight/WeightHistory';
import { AddWeightModal } from '@/components/weight/modals/AddWeightModal';
import { UnitPickerModal } from '@/components/weight/modals/UnitPickerModal';
import { WeightHistoryModal } from '@/components/weight/modals/WeightHistoryModal';

export default function WeightTrackingScreen() {

  // Hooks
  const { data: bodyMeasurements } = useBodyMeasurements();
  const { data: weightHistory } = useWeightHistory();
  const updateBodyMeasurements = useUpdateBodyMeasurements();

  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showAllEntries, setShowAllEntries] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [showUnitPicker, setShowUnitPicker] = useState(false);

  const calculateProgress = () => {
    if (!bodyMeasurements || !weightHistory?.length) {
      return {
        lost: '0.0',
        remaining: '0.0',
        progressPercent: 0,
        isLosing: true,
        weeklyRate: '0.0',
      };
    }

    const current = bodyMeasurements.current_weight || 0;
    const goal = bodyMeasurements.goal_weight || 0;
    const start = weightHistory[weightHistory.length - 1]?.weight || current;

    const totalToLose = Math.abs(start - goal);
    const lost = Math.abs(start - current);
    const remaining = Math.abs(current - goal);

    const progressPercent = totalToLose > 0 ? Math.min(100, (lost / totalToLose) * 100) : 0;

    return {
      lost: lost.toFixed(1),
      remaining: remaining.toFixed(1),
      progressPercent: Math.round(progressPercent),
      isLosing: goal < start,
      weeklyRate: calculateWeeklyRate(),
    };
  };

  const calculateWeeklyRate = () => {
    if (!weightHistory || weightHistory.length < 2) return 0;

    const recent = weightHistory.slice(-4); // Last 4 weeks
    if (recent.length < 2) return 0;

    const weeksDiff =
      (new Date(recent[recent.length - 1].measured_at).getTime() -
        new Date(recent[0].measured_at).getTime()) /
      (7 * 24 * 60 * 60 * 1000);

    const weightDiff = recent[recent.length - 1].weight - recent[0].weight;
    return weeksDiff > 0 ? weightDiff / weeksDiff : 0;
  };

  const progress = calculateProgress();

  const handleUnitChange = async (newUnit: 'kg' | 'lbs') => {
    try {
      await updateBodyMeasurements.mutateAsync({
        units: newUnit,
      });
      setShowUnitPicker(false);
      // toast.success(`Units changed to ${newUnit}`);
    } catch (error) {
      // toast.error('Failed to update units');
    }
  };

  const handleEdit = (field: string, value: number) => {
    setEditingField(field);
    setTempValue(value.toString());
  };

  const handleSave = async () => {
    if (editingField && tempValue) {
      const newValue = parseFloat(tempValue);
      if (newValue > 0) {
        try {
          if (editingField === 'current_weight') {
            await updateBodyMeasurements.mutateAsync({
              current_weight: newValue,
              units: bodyMeasurements?.units || 'kg',
            });
          } else if (editingField === 'goal_weight') {
            await updateBodyMeasurements.mutateAsync({
              goal_weight: newValue,
              units: bodyMeasurements?.units || 'kg',
            });
          } else if (editingField === 'height') {
            await updateBodyMeasurements.mutateAsync({
              height: newValue,
              units: bodyMeasurements?.units || 'kg',
            });
          }

          // toast.success('Upmeasured_atd successfully!');
        } catch (error) {
          // toast.error('Failed to upmeasured_at');
        }
      }
    }
    setEditingField(null);
    setTempValue('');
  };


  return (
    <SubPageLayout title="Weight Tracking">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Weight Chart */}
        {/* <View className="px-4 mb-4">
          <WeightChart
            weightHistory={weightHistory || []}
            bodyMeasurements={bodyMeasurements || null}
          />
        </View> */}

        {/* Stats Cards */}
        <WeightStatsCards
          bodyMeasurements={bodyMeasurements || null}
          progress={progress}
          editingField={editingField}
          tempValue={tempValue}
          onEdit={handleEdit}
          onSave={handleSave}
          onTempValueChange={setTempValue}
        />

        {/* Units Setting */}
        <View className="px-4 mb-4">
          <UnitSelector
            bodyMeasurements={bodyMeasurements || null}
            onShowUnitPicker={() => setShowUnitPicker(true)}
          />
        </View>

        {/* Recent History */}
        <WeightHistory
          weightHistory={weightHistory || []}
          onShowAllEntries={() => setShowAllEntries(true)}
          onShowAddEntry={() => setShowAddEntry(true)}
        />
      </ScrollView>

      {/* Modals */}
      <AddWeightModal
        visible={showAddEntry}
        bodyMeasurements={bodyMeasurements || null}
        onClose={() => setShowAddEntry(false)}
      />

      <UnitPickerModal
        visible={showUnitPicker}
        bodyMeasurements={bodyMeasurements || null}
        onClose={() => setShowUnitPicker(false)}
        onUnitChange={handleUnitChange}
      />

      <WeightHistoryModal
        visible={showAllEntries}
        weightHistory={weightHistory || []}
        onClose={() => setShowAllEntries(false)}
      />
    </SubPageLayout>
  );
}
