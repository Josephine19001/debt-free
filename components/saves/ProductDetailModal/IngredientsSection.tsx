import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useState } from 'react';
import { Info, X } from 'lucide-react-native';
import { ScannedProductUI } from '@/lib/types/product';
import { IngredientCard } from './IngredientCard';

interface IngredientsSectionProps {
  product: ScannedProductUI;
}

export function IngredientsSection({ product }: IngredientsSectionProps) {
  const [showInfoModal, setShowInfoModal] = useState(false);

  return (
    <View className="px-6 mb-6">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-bold text-black">What's Inside</Text>
        <TouchableOpacity
          onPress={() => setShowInfoModal(true)}
          className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
        >
          <Info size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {(product.keyIngredients || []).length > 0 ? (
        (product.keyIngredients || []).map((ingredient, index) => (
          <IngredientCard key={index} ingredient={ingredient} />
        ))
      ) : (
        <View className="bg-gray-50 rounded-2xl p-6 items-center">
          <Text className="text-gray-500 text-center">
            No ingredient details available for this product
          </Text>
        </View>
      )}

      {/* Info Modal */}
      <Modal
        visible={showInfoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center p-6">
          <View className="bg-white rounded-2xl p-6 max-w-[90%] w-full">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-black">How We Analyze Ingredients</Text>
              <TouchableOpacity
                onPress={() => setShowInfoModal(false)}
                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
              >
                <X size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <Text className="text-lg font-semibold text-black mb-3">Ingredient Types</Text>

              <View className="mb-3">
                <View className="flex-row items-center mb-1">
                  <View className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                  <Text className="font-semibold text-green-700">Beneficial</Text>
                </View>
                <Text className="text-gray-600 text-sm ml-5">
                  Ingredients that provide positive effects for skin and beauty health
                </Text>
              </View>

              <View className="mb-3">
                <View className="flex-row items-center mb-1">
                  <View className="w-3 h-3 bg-red-500 rounded-full mr-2" />
                  <Text className="font-semibold text-red-700">Harmful</Text>
                </View>
                <Text className="text-gray-600 text-sm ml-5">
                  Ingredients that may cause damage, irritation, or negative effects
                </Text>
              </View>

              <View className="mb-4">
                <View className="flex-row items-center mb-1">
                  <View className="w-3 h-3 bg-gray-400 rounded-full mr-2" />
                  <Text className="font-semibold text-gray-700">Neutral</Text>
                </View>
                <Text className="text-gray-600 text-sm ml-5">
                  Ingredients with minimal impact or whose effects vary by individual
                </Text>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-lg font-semibold text-black mb-3">
                Safety Score Calculation
              </Text>
              <Text className="text-gray-600 text-sm leading-relaxed">
                Our AI model analyzes each ingredient and calculates a safety score (1-10) based on
                the ratio of harmful to total analyzed ingredients. A score of 10 means no harmful
                ingredients were detected, while lower scores indicate a higher proportion of
                potentially concerning ingredients.
              </Text>
            </View>

            <View className="bg-blue-50 rounded-2xl p-4">
              <Text className="text-blue-800 text-sm font-medium mb-1">Note</Text>
              <Text className="text-blue-700 text-sm">
                This analysis is for informational purposes only. Always consult with a beauty or
                dermatology professional for personalized advice.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
