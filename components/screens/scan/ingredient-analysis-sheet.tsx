import { useState } from 'react';
import { View, Modal, ScrollView, Alert, Pressable } from 'react-native';
import { X, Plus, Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import { Button } from '@/components/ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

interface IngredientAnalysisSheetProps {
  visible: boolean;
  onClose: () => void;
  imageUri?: string | null;
}

interface AnalysisResult {
  sulfateFree: boolean;
  siliconeFree: boolean;
  crueltyFree: boolean;
  coilyHairFriendly: boolean;
  keyIngredients: Array<{
    name: string;
    purpose: string;
    effect: string;
    beneficial: boolean;
  }>;
  analysis: {
    moisturizingLevel: 'low' | 'medium' | 'high';
    cleansingStrength: 'gentle' | 'moderate' | 'strong';
    suitableHairTypes: string[];
    potentialConcerns: string[];
    overallRecommendation: string;
  };
}

const PRODUCT_TYPES = [
  'Shampoo',
  'Conditioner',
  'Leave-in Conditioner',
  'Hair Mask',
  'Hair Oil',
  'Styling Cream',
  'Gel',
  'Mousse',
  'Serum',
  'Other',
];

export function IngredientAnalysisSheet({
  visible,
  onClose,
  imageUri,
}: IngredientAnalysisSheetProps) {
  const [step, setStep] = useState<'input' | 'analyzing' | 'results' | 'save'>('input');
  const [ingredientsText, setIngredientsText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAnalyze = async () => {
    if (!ingredientsText.trim()) {
      Alert.alert('Missing Information', 'Please enter the ingredients list');
      return;
    }

    setStep('analyzing');

    try {
      // Mock analysis for now - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockAnalysis: AnalysisResult = {
        sulfateFree: true,
        siliconeFree: false,
        crueltyFree: true,
        coilyHairFriendly: true,
        keyIngredients: [
          {
            name: 'Shea Butter',
            purpose: 'Moisturizer',
            effect: 'Deeply hydrates and softens hair',
            beneficial: true,
          },
          {
            name: 'Dimethicone',
            purpose: 'Silicone',
            effect: 'Provides shine and smoothness',
            beneficial: false,
          },
          {
            name: 'Glycerin',
            purpose: 'Humectant',
            effect: 'Attracts moisture to hair',
            beneficial: true,
          },
        ],
        analysis: {
          moisturizingLevel: 'high',
          cleansingStrength: 'gentle',
          suitableHairTypes: ['3B', '3C', '4A', '4B', '4C'],
          potentialConcerns: ['Contains silicones that may cause buildup'],
          overallRecommendation:
            'Great moisturizing product for textured hair, but may require clarifying shampoo to remove silicone buildup.',
        },
      };

      setAnalysis(mockAnalysis);
      setStep('results');
    } catch (error) {
      Alert.alert('Analysis Failed', 'Unable to analyze ingredients. Please try again.');
      setStep('input');
    }
  };

  const handleSave = async () => {
    if (!productName.trim() || !brand.trim() || !selectedType) {
      Alert.alert('Missing Information', 'Please fill in all product details');
      return;
    }

    setSaving(true);

    try {
      // Mock save for now - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert('Success!', 'Product saved to your collection', [
        {
          text: 'View Products',
          onPress: () => {
            onClose();
            router.push('/products');
          },
        },
        {
          text: 'Close',
          onPress: onClose,
        },
      ]);
    } catch (error) {
      Alert.alert('Save Failed', 'Unable to save product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setStep('input');
    setIngredientsText('');
    setAnalysis(null);
    setProductName('');
    setBrand('');
    setSelectedType('');
    setSaving(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const renderPropertyBadge = (label: string, value: boolean, goodWhenTrue = true) => (
    <View
      className={`flex-row items-center px-3 py-2 rounded-lg ${
        value === goodWhenTrue ? 'bg-green-100' : 'bg-red-100'
      }`}
    >
      {value === goodWhenTrue ? (
        <CheckCircle size={16} color="#059669" />
      ) : (
        <XCircle size={16} color="#DC2626" />
      )}
      <Text
        className={`ml-2 text-sm font-medium ${
          value === goodWhenTrue ? 'text-green-800' : 'text-red-800'
        }`}
      >
        {value ? label : `Not ${label}`}
      </Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <Text className="text-lg font-semibold">
            {step === 'input'
              ? 'Enter Ingredients'
              : step === 'analyzing'
                ? 'Analyzing...'
                : step === 'results'
                  ? 'Analysis Results'
                  : 'Save Product'}
          </Text>
          <Pressable onPress={handleClose}>
            <X size={24} color="#6B7280" />
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {step === 'input' && (
            <View className="space-y-6">
              {imageUri && (
                <View className="bg-gray-100 p-4 rounded-xl">
                  <Text className="text-gray-700 font-medium mb-2">Captured Image</Text>
                  <Text className="text-gray-600 text-sm">
                    Image captured! Enter the ingredients list below or use OCR (coming soon).
                  </Text>
                </View>
              )}

              <View>
                <Text className="text-gray-700 text-lg font-medium mb-2">Ingredients List *</Text>
                <TextInput
                  value={ingredientsText}
                  onChangeText={setIngredientsText}
                  placeholder="Enter or paste the complete ingredients list..."
                  multiline
                  numberOfLines={8}
                  style={{ textAlignVertical: 'top' }}
                />
                <Text className="text-gray-500 text-sm mt-2">
                  Include all ingredients as they appear on the product label
                </Text>
              </View>

              <Button
                variant="primary"
                label="Analyze Ingredients"
                onPress={handleAnalyze}
                disabled={!ingredientsText.trim()}
              />
            </View>
          )}

          {step === 'analyzing' && (
            <View className="flex-1 justify-center items-center py-20">
              <Loader2 size={48} color="#000" className="animate-spin mb-4" />
              <Text className="text-xl font-medium mb-2">Analyzing Ingredients</Text>
              <Text className="text-gray-600 text-center">
                Our AI is examining the ingredients for hair care properties...
              </Text>
            </View>
          )}

          {step === 'results' && analysis && (
            <View className="space-y-6">
              {/* Properties */}
              <View>
                <Text className="text-lg font-semibold mb-3">Product Properties</Text>
                <View className="flex-row flex-wrap gap-2">
                  {renderPropertyBadge('Sulfate-Free', analysis.sulfateFree)}
                  {renderPropertyBadge('Silicone-Free', analysis.siliconeFree)}
                  {renderPropertyBadge('Cruelty-Free', analysis.crueltyFree)}
                  {renderPropertyBadge('Coily Hair Friendly', analysis.coilyHairFriendly)}
                </View>
              </View>

              {/* Analysis Summary */}
              <View>
                <Text className="text-lg font-semibold mb-3">Hair Care Analysis</Text>
                <View className="bg-gray-50 p-4 rounded-xl space-y-3">
                  <View className="flex-row justify-between">
                    <Text className="text-gray-700">Moisturizing Level:</Text>
                    <Text className="font-medium capitalize">
                      {analysis.analysis.moisturizingLevel}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-700">Cleansing Strength:</Text>
                    <Text className="font-medium capitalize">
                      {analysis.analysis.cleansingStrength}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-gray-700 mb-1">Suitable for Hair Types:</Text>
                    <Text className="font-medium">
                      {analysis.analysis.suitableHairTypes.join(', ')}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Key Ingredients */}
              <View>
                <Text className="text-lg font-semibold mb-3">Key Ingredients</Text>
                <View className="space-y-2">
                  {analysis.keyIngredients.map((ingredient, index) => (
                    <View key={index} className="bg-white border border-gray-200 p-3 rounded-xl">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="font-medium">{ingredient.name}</Text>
                        {ingredient.beneficial ? (
                          <CheckCircle size={16} color="#059669" />
                        ) : (
                          <AlertTriangle size={16} color="#D97706" />
                        )}
                      </View>
                      <Text className="text-sm text-gray-600 mb-1">{ingredient.purpose}</Text>
                      <Text className="text-sm text-gray-700">{ingredient.effect}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Recommendations */}
              <View>
                <Text className="text-lg font-semibold mb-3">Recommendation</Text>
                <View className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <Text className="text-blue-900">{analysis.analysis.overallRecommendation}</Text>
                </View>
              </View>

              {/* Concerns */}
              {analysis.analysis.potentialConcerns.length > 0 && (
                <View>
                  <Text className="text-lg font-semibold mb-3">Potential Concerns</Text>
                  <View className="space-y-2">
                    {analysis.analysis.potentialConcerns.map((concern, index) => (
                      <View
                        key={index}
                        className="flex-row items-start bg-amber-50 p-3 rounded-xl border border-amber-200"
                      >
                        <AlertTriangle size={16} color="#D97706" className="mt-0.5 mr-2" />
                        <Text className="text-amber-900 flex-1">{concern}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <Button
                variant="primary"
                label="Save to My Products"
                onPress={() => setStep('save')}
              />
            </View>
          )}

          {step === 'save' && (
            <View className="space-y-6">
              <View>
                <Text className="text-gray-700 text-lg font-medium mb-2">Product Name *</Text>
                <TextInput
                  value={productName}
                  onChangeText={setProductName}
                  placeholder="e.g., Moisture Rich Shampoo"
                />
              </View>

              <View>
                <Text className="text-gray-700 text-lg font-medium mb-2">Brand *</Text>
                <TextInput value={brand} onChangeText={setBrand} placeholder="e.g., SheaMoisture" />
              </View>

              <View>
                <Text className="text-gray-700 text-lg font-medium mb-2">Product Type *</Text>
                <Pressable
                  onPress={() => setShowTypeSelector(!showTypeSelector)}
                  className="border border-gray-300 rounded-xl p-4 bg-white"
                >
                  <Text className={selectedType ? 'text-black' : 'text-gray-500'}>
                    {selectedType || 'Select product type'}
                  </Text>
                </Pressable>

                {showTypeSelector && (
                  <View className="mt-2 border border-gray-200 rounded-xl bg-white">
                    {PRODUCT_TYPES.map((type) => (
                      <Pressable
                        key={type}
                        onPress={() => {
                          setSelectedType(type);
                          setShowTypeSelector(false);
                        }}
                        className="p-4 border-b border-gray-100 last:border-b-0"
                      >
                        <Text className="text-gray-900">{type}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

              <Button
                variant="primary"
                label="Save Product"
                onPress={handleSave}
                disabled={!productName.trim() || !brand.trim() || !selectedType || saving}
                loading={saving}
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
