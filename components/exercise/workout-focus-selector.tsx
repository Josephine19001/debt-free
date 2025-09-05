import { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Modal, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react-native';

export interface FocusArea {
  id: string;
  label: string;
  description: string;
  image: any; // We'll use local images
  color: string;
}

const focusAreas: FocusArea[] = [
  {
    id: 'glutes',
    label: 'Glutes & Booty',
    description: 'Build and sculpt your glutes for a lifted, toned look',
    image:
      'https://res.cloudinary.com/josephine19001/image/upload/v1757028667/LunaSync/squat_engexp.png', // Will use emoji instead
    color: '#EC4899',
  },
  {
    id: 'endurance',
    label: 'Cardio & Endurance',
    description: 'Build stamina and cardiovascular fitness',
    image:
      'https://res.cloudinary.com/josephine19001/image/upload/v1757028655/LunaSync/endurance_he0hkb.png',
    color: '#EF4444',
  },
  {
    id: 'full_body',
    label: 'Full Body Toning',
    description: 'Overall body sculpting for balanced fitness',
    image:
      'https://res.cloudinary.com/josephine19001/image/upload/v1757028655/LunaSync/fullbody_fwf39b.png',
    color: '#10B981',
  },
  {
    id: 'back_posture',
    label: 'Back & Posture',
    description: 'Strengthen your back and improve posture',
    image:
      'https://res.cloudinary.com/josephine19001/image/upload/v1757028666/LunaSync/back_nyotko.png',
    color: '#8B5CF6',
  },

  {
    id: 'abs_core',
    label: 'Abs & Core',
    description: 'Strengthen and tone your midsection for a flat stomach',
    image:
      'https://res.cloudinary.com/josephine19001/image/upload/v1757028667/LunaSync/abs_jobzju.png',
    color: '#8B5CF6',
  },
  {
    id: 'thighs_legs',
    label: 'Thighs & Legs',
    description: 'Tone and strengthen your legs for lean, defined muscles',
    image:
      'https://res.cloudinary.com/josephine19001/image/upload/v1757028665/LunaSync/legs_rctyeo.png',
    color: '#06B6D4',
  },
  {
    id: 'arms_shoulders',
    label: 'Arms & Shoulders',
    description: 'Sculpt lean and toned arms with defined shoulders',
    image:
      'https://res.cloudinary.com/josephine19001/image/upload/v1757028667/LunaSync/arms_mmtiki.png',
    color: '#F59E0B',
  },

  {
    id: 'flexibility',
    label: 'Flexibility & Mobility',
    description: 'Increase flexibility and joint mobility',
    image:
      'https://res.cloudinary.com/josephine19001/image/upload/v1757028666/LunaSync/mobility_rxzl0f.png',
    color: '#F97316',
  },
];

export interface WorkoutLocation {
  id: string;
  label: string;
  image: string;
}

const workoutLocations: WorkoutLocation[] = [
  {
    id: 'home',
    label: 'Home Workout',
    image:
      'https://res.cloudinary.com/josephine19001/image/upload/v1757030660/LunaSync/home_v0fmah.png',
  },
  {
    id: 'gym',
    label: 'Gym Workout',
    image:
      'https://res.cloudinary.com/josephine19001/image/upload/v1757030661/LunaSync/gym_bdjwt7.png',
  },
  {
    id: 'outdoor',
    label: 'Outdoor Workout',
    image:
      'https://res.cloudinary.com/josephine19001/image/upload/v1757030661/LunaSync/outdoor_zvgxom.png',
  },
  {
    id: 'studio',
    label: 'Fitness Studio',
    image:
      'https://res.cloudinary.com/josephine19001/image/upload/v1757030660/LunaSync/studio_xjwwv4.png',
  },
];

interface WorkoutFocusSelectorProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (data: { focusAreas: string[]; locations: string[] }) => void;
  isGenerating: boolean;
}

export function WorkoutFocusSelector({
  visible,
  onClose,
  onConfirm,
  isGenerating,
}: WorkoutFocusSelectorProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  const handleFocusAreaToggle = (focusAreaId: string) => {
    setSelectedFocusAreas((prev) => {
      if (prev.includes(focusAreaId)) {
        return prev.filter((id) => id !== focusAreaId);
      } else {
        // Allow up to 3 selections
        if (prev.length < 3) {
          return [...prev, focusAreaId];
        }
        return prev;
      }
    });
  };

  const handleLocationToggle = (locationId: string) => {
    setSelectedLocations((prev) => {
      if (prev.includes(locationId)) {
        return prev.filter((id) => id !== locationId);
      } else {
        return [...prev, locationId];
      }
    });
  };

  const handleNext = () => {
    if (currentStep === 1 && selectedFocusAreas.length > 0) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (selectedFocusAreas.length > 0 && selectedLocations.length > 0) {
      onConfirm({ focusAreas: selectedFocusAreas, locations: selectedLocations });
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl" style={{ height: '90%' }}>
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-gray-100">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900">
                {currentStep === 1 ? 'Choose Your Focus Areas' : 'Choose Workout Locations'}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">
                {currentStep === 1
                  ? 'Select up to 3 areas you want to target (tap to select)'
                  : 'Select where you prefer to workout (multiple locations allowed)'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleBack} className="w-8 h-8 items-center justify-center">
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Progress & Selection Counter */}
          <View className="px-6 py-3">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xs text-gray-500">Step {currentStep} of 2</Text>
              <View className="flex-row gap-2">
                <View
                  className={`w-2 h-2 rounded-full ${
                    currentStep >= 1 ? 'bg-pink-500' : 'bg-gray-300'
                  }`}
                />
                <View
                  className={`w-2 h-2 rounded-full ${
                    currentStep >= 2 ? 'bg-pink-500' : 'bg-gray-300'
                  }`}
                />
              </View>
            </View>
            <View className="flex-row items-center justify-center">
              <View className="flex-row items-center bg-gray-100 px-3 py-1.5 rounded-full">
                <View
                  className="w-2 h-2 rounded-full mr-2"
                  style={{
                    backgroundColor:
                      currentStep === 1
                        ? selectedFocusAreas.length > 0
                          ? '#EC4899'
                          : '#D1D5DB'
                        : selectedLocations.length > 0
                        ? '#EC4899'
                        : '#D1D5DB',
                  }}
                />
                <Text className="text-sm font-medium text-gray-700">
                  {currentStep === 1
                    ? `${selectedFocusAreas.length}/3 areas selected`
                    : `${selectedLocations.length} locations selected`}
                </Text>
              </View>
            </View>
          </View>

          {/* Content Area */}
          <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
            {currentStep === 1 ? (
              /* Focus Areas Grid */
              <View className="flex-row flex-wrap justify-between">
                {focusAreas.map((area) => {
                  const isSelected = selectedFocusAreas.includes(area.id);
                  return (
                    <TouchableOpacity
                      key={area.id}
                      onPress={() => handleFocusAreaToggle(area.id)}
                      className="w-[48%] mb-4"
                      activeOpacity={0.7}
                      style={{ height: 240 }}
                    >
                      <View
                        className={`rounded-2xl p-4 flex-1 ${
                          isSelected ? 'border-2' : 'border border-gray-200'
                        }`}
                        style={{
                          borderColor: isSelected ? '#EC4899' : '#E5E7EB',
                          backgroundColor: isSelected ? '#EC489910' : '#FFFFFF',
                        }}
                      >
                        {/* Visual indicator with image */}
                        <View
                          className="w-full h-40 rounded-xl mb-3 overflow-hidden"
                          style={{ backgroundColor: `${area.color}10` }}
                        >
                          <Image
                            source={{ uri: area.image }}
                            className="w-full h-full"
                            style={{ resizeMode: 'cover' }}
                          />
                        </View>

                        <View className="mb-1">
                          <Text
                            className="font-bold text-base"
                            style={{ color: isSelected ? '#EC4899' : '#1F2937' }}
                          >
                            {area.label}
                          </Text>
                        </View>

                        <View className="flex-1 justify-start">
                          <Text className="text-xs text-gray-600 leading-4">
                            {area.description}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              /* Workout Locations Grid */
              <View className="flex-row flex-wrap justify-between">
                {workoutLocations.map((location) => {
                  const isSelected = selectedLocations.includes(location.id);
                  return (
                    <TouchableOpacity
                      key={location.id}
                      onPress={() => handleLocationToggle(location.id)}
                      className="w-[48%] mb-4"
                      activeOpacity={0.7}
                      style={{ height: 200 }}
                    >
                      <View
                        className={`rounded-2xl p-4 flex-1 ${
                          isSelected ? 'border-2' : 'border border-gray-200'
                        }`}
                        style={{
                          borderColor: isSelected ? '#EC4899' : '#E5E7EB',
                          backgroundColor: isSelected ? '#EC489910' : '#FFFFFF',
                        }}
                      >
                        {/* Location Image */}
                        <View
                          className="w-full h-32 rounded-xl mb-3 overflow-hidden"
                          style={{ backgroundColor: `#EC489910` }}
                        >
                          <Image
                            source={{ uri: location.image }}
                            className="w-full h-full"
                            style={{ resizeMode: 'cover' }}
                          />
                        </View>

                        <View className="mb-1">
                          <Text
                            className="font-bold text-base"
                            style={{ color: isSelected ? '#EC4899' : '#1F2937' }}
                          >
                            {location.label}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>

          {/* Bottom Action */}
          <View className="p-6 pb-8 border-t border-gray-100">
            {currentStep === 1 ? (
              <Button
                title="Next: Choose Locations"
                onPress={handleNext}
                disabled={selectedFocusAreas.length === 0}
                className="w-full"
                style={{
                  backgroundColor: selectedFocusAreas.length > 0 ? '#EC4899' : '#9CA3AF',
                }}
              />
            ) : (
              <Button
                title={isGenerating ? 'Generating Your Plan...' : 'Generate Workout Plan'}
                onPress={handleConfirm}
                disabled={selectedLocations.length === 0 || isGenerating}
                className="w-full"
                style={{
                  backgroundColor:
                    selectedLocations.length > 0 && !isGenerating ? '#EC4899' : '#9CA3AF',
                }}
              />
            )}
            <Text className="text-center text-xs text-gray-500 mt-2">
              {currentStep === 1
                ? 'Select areas you want to focus on, then choose workout locations'
                : 'Your workout plan will be personalized for your selected areas and locations'}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
