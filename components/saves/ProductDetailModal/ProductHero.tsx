import { View, Text, Image, TouchableOpacity, Modal } from 'react-native';
import { useState } from 'react';
import { Shield, AlertTriangle, Info, X } from 'lucide-react-native';
import { ScannedProductUI } from '@/lib/types/product';

interface ProductHeroProps {
  product: ScannedProductUI;
}

export function ProductHero({ product }: ProductHeroProps) {
  const [showInfoModal, setShowInfoModal] = useState(false);

  const getScoreConfig = (score: number) => {
    if (score >= 8)
      return {
        color: '#10B981',
        label: 'Safe',
        icon: Shield,
        bgColor: '#10B98115',
      };
    if (score >= 6)
      return {
        color: '#F59E0B',
        label: 'Moderate',
        icon: AlertTriangle,
        bgColor: '#F59E0B15',
      };
    return {
      color: '#EF4444',
      label: 'Caution',
      icon: AlertTriangle,
      bgColor: '#EF444415',
    };
  };

  const scoreConfig = getScoreConfig(product.safetyScore || 0);

  return (
    <View className="items-center px-6 py-6">
      <View className="relative mb-6">
        <Image
          source={typeof product.image === 'string' ? { uri: product.image } : product.image}
          className="w-32 h-32 rounded-3xl"
          resizeMode="cover"
        />
        {/* Safety Score Badge */}
        <View
          className="absolute -top-2 -right-2 w-12 h-12 rounded-full items-center justify-center shadow-lg"
          style={{ backgroundColor: scoreConfig.color }}
        >
          <Text className="text-white text-lg font-bold">{product.safetyScore}</Text>
        </View>
      </View>

      {/* Product Info */}
      <View className="items-center mb-6">
        <Text className="text-2xl font-bold text-black text-center mb-2">{product.name}</Text>
        <Text className="text-lg text-gray-600 mb-4">{product.brand}</Text>

        {/* Safety Status with Info Button */}
        <View className="flex-row items-center gap-2">
          <View className="px-6 py-3 rounded-2xl" style={{ backgroundColor: scoreConfig.bgColor }}>
            <Text className="text-lg font-bold" style={{ color: scoreConfig.color }}>
              {scoreConfig.label}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowInfoModal(true)}
            className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
          >
            <Info size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

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
              <Text className="text-xl font-bold text-black">Safety Score Guide</Text>
              <TouchableOpacity
                onPress={() => setShowInfoModal(false)}
                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
              >
                <X size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <Text className="text-lg font-semibold text-black mb-3">Safety Levels</Text>

              <View className="mb-3">
                <View className="flex-row items-center mb-2">
                  <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center mr-3">
                    <Shield size={14} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-green-700">Safe (8-10)</Text>
                    <Text className="text-gray-600 text-sm">
                      Products with minimal to no concerning ingredients detected
                    </Text>
                  </View>
                </View>
              </View>

              <View className="mb-3">
                <View className="flex-row items-center mb-2">
                  <View className="w-6 h-6 bg-yellow-500 rounded-full items-center justify-center mr-3">
                    <AlertTriangle size={14} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-yellow-700">Moderate (6-7)</Text>
                    <Text className="text-gray-600 text-sm">
                      Products with some potentially concerning ingredients
                    </Text>
                  </View>
                </View>
              </View>

              <View className="mb-4">
                <View className="flex-row items-center mb-2">
                  <View className="w-6 h-6 bg-red-500 rounded-full items-center justify-center mr-3">
                    <AlertTriangle size={14} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-red-700">Caution (0-5)</Text>
                    <Text className="text-gray-600 text-sm">
                      Products with higher proportion of potentially concerning ingredients
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-lg font-semibold text-black mb-3">How It Works</Text>
              <Text className="text-gray-600 text-sm leading-relaxed">
                Our AI analyzes the ingredient list and calculates a safety score based on the ratio
                of potentially harmful ingredients to the total ingredients analyzed. The score
                helps you make informed decisions about beauty products.
              </Text>
            </View>

            <View className="bg-blue-50 rounded-2xl p-4">
              <Text className="text-blue-800 text-sm font-medium mb-1">Important</Text>
              <Text className="text-blue-700 text-sm">
                Safety scores are based on AI analysis and general ingredient knowledge. Individual
                reactions may vary. Always patch test new products and consult professionals for
                specific concerns.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
