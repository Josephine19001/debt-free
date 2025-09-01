import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { X, Check, Globe } from 'lucide-react-native';

interface CustomFoodData {
  name: string;
  brand: string;
  category: string;
  servingSize: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  sugar: string;
}

interface CustomFoodModalProps {
  visible: boolean;
  onClose: () => void;
  customFood: CustomFoodData;
  onCustomFoodChange: (field: keyof CustomFoodData, value: string) => void;
  onReset: () => void;
  onAddCustomFood: (shareWithCommunity?: boolean) => void;
}

export const CustomFoodModal: React.FC<CustomFoodModalProps> = ({
  visible,
  onClose,
  customFood,
  onCustomFoodChange,
  onReset,
  onAddCustomFood,
}) => {
  const [shareWithCommunity, setShareWithCommunity] = useState(false);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <KeyboardAvoidingView
          className="bg-white rounded-t-3xl h-[95%]"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View className="flex-row items-center justify-between p-6">
            <Text className="text-xl font-bold text-gray-900">Add Custom Food</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="flex-1 p-6"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-3">Food Name *</Text>
              <TextInput
                value={customFood.name}
                onChangeText={(value) => onCustomFoodChange('name', value)}
                placeholder="e.g., Homemade Pasta Salad"
                placeholderTextColor="#9CA3AF"
                className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 text-base"
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-3">Brand (Optional)</Text>
              <TextInput
                value={customFood.brand}
                onChangeText={(value) => onCustomFoodChange('brand', value)}
                placeholder="e.g., Homemade, Kraft, etc."
                placeholderTextColor="#9CA3AF"
                className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 text-base"
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-3">Serving Size *</Text>
              <TextInput
                value={customFood.servingSize}
                onChangeText={(value) => onCustomFoodChange('servingSize', value)}
                placeholder="e.g., 1 cup, 100g, 1 slice"
                placeholderTextColor="#9CA3AF"
                className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 text-base"
              />
            </View>

            <View className="flex-row gap-3 mb-6">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-3">Calories *</Text>
                <TextInput
                  value={customFood.calories}
                  onChangeText={(value) => onCustomFoodChange('calories', value)}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 text-center text-base"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-3">Protein (g) *</Text>
                <TextInput
                  value={customFood.protein}
                  onChangeText={(value) => onCustomFoodChange('protein', value)}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 text-center text-base"
                />
              </View>
            </View>

            <View className="flex-row gap-3 mb-6">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-3">Carbs (g) *</Text>
                <TextInput
                  value={customFood.carbs}
                  onChangeText={(value) => onCustomFoodChange('carbs', value)}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 text-center text-base"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-3">Fat (g) *</Text>
                <TextInput
                  value={customFood.fat}
                  onChangeText={(value) => onCustomFoodChange('fat', value)}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 text-center text-base"
                />
              </View>
            </View>

            <View className="flex-row gap-3 mb-6">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-3">Fiber (g)</Text>
                <TextInput
                  value={customFood.fiber}
                  onChangeText={(value) => onCustomFoodChange('fiber', value)}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 text-center text-base"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-3">Sugar (g)</Text>
                <TextInput
                  value={customFood.sugar}
                  onChangeText={(value) => onCustomFoodChange('sugar', value)}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 text-center text-base"
                />
              </View>
            </View>

            {/* Community Sharing - Clean Style like Exercise Modal */}
            <View className="pt-4 border-t border-gray-100 mb-6">
              <TouchableOpacity
                onPress={() => setShareWithCommunity(!shareWithCommunity)}
                className="flex-row items-center"
                activeOpacity={0.8}
              >
                <View
                  className={`w-6 h-6 rounded-full border mr-4 items-center justify-center ${
                    shareWithCommunity ? 'bg-pink-500 border-pink-500' : 'bg-white border-gray-300'
                  }`}
                >
                  {shareWithCommunity && <Check size={14} color="white" />}
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Globe size={20} color="#EC4899" />
                    <Text className="text-base font-medium text-gray-900 ml-2">
                      Share with Community
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-600">
                    Contribute this food to our community database for everyone to use
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View className="p-4 border-t border-gray-200 bg-white">
            <Button
              title="Add Food"
              onPress={() => onAddCustomFood(shareWithCommunity)}
              variant="primary"
              size="large"
              disabled={
                !customFood.name.trim() || !customFood.servingSize.trim() || !customFood.calories
              }
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
