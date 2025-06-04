import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import SubPageLayout from '@/components/layouts/sub-page';
import { TextInput } from '@/components/ui/text-input';
import { Button } from '@/components/ui';
import { useState } from 'react';
import { ProductSelector } from '@/components/product-selector';
import { ImagePicker } from '@/components/ui';

type Product = {
  id: string;
  name: string;
  brand: string;
  type: string;
};

export default function LogRoutineScreen() {
  const [formData, setFormData] = useState<{
    hairLength: string;
    hairStyle: string;
    notes: string;
    photos: string[];
    products: Product[];
  }>({
    hairLength: '',
    hairStyle: '',
    notes: '',
    photos: [],
    products: [],
  });

  const porosityOptions = [
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' },
  ];

  return (
    <SubPageLayout title="Log Routine">
      <ScrollView className="flex-1 ">
        <View className="flex flex-col gap-4 px-6 py-4">
          {/* Hair Length */}
          <View>
            <Text className="text-gray-600 text-lg mb-2">Hair Length</Text>
            <TextInput
              value={formData.hairLength}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, hairLength: text }))}
              placeholder="Enter hair length in inches"
              keyboardType="numeric"
              className="border border-gray-200"
            />
          </View>

          {/* Current Hair Style */}
          <View>
            <Text className="text-gray-600 text-lg mb-2">Current Hair Style</Text>
            <TextInput
              value={formData.hairStyle}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, hairStyle: text }))}
            />
          </View>

          {/* Products Used */}
          <View>
            <Text className="text-gray-600 text-lg mb-2">Products Used</Text>
            <ProductSelector
              selectedProducts={formData.products}
              onProductsChange={(products) => setFormData((prev) => ({ ...prev, products }))}
            />
          </View>

          {/* Photo Log */}
          <View>
            <Text className="text-gray-600 text-lg mb-2">Photo Log</Text>
            <ImagePicker
              images={formData.photos}
              onImagesChange={(photos) => setFormData((prev) => ({ ...prev, photos }))}
            />
          </View>

          {/* Notes */}
          <View>
            <Text className="text-gray-600 text-lg mb-2">Notes</Text>
            <TextInput
              value={formData.notes}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, notes: text }))}
              placeholder="Add any notes about your routine"
              multiline
              numberOfLines={4}
              className="border border-gray-200 h-24 py-2"
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      <View className="p-4 bg-white border-t border-gray-100">
        <Button
          variant="primary"
          label="Log Update"
          onPress={() => {
            // Handle log submission
            console.log(formData);
          }}
        />
      </View>
    </SubPageLayout>
  );
}
