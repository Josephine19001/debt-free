import { useState, useEffect } from 'react';
import { View, Pressable, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { X, HelpCircle, Zap, Camera, Image, FileText } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui';
import { HelpModal } from './help-modal';
import { IngredientAnalysisSheet } from './ingredient-analysis-sheet';
import { askForGalleryPermissions } from '@/lib/utils/permission';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSubscription } from '@/context/subscription-provider';
import { FreemiumGate } from '@/components/freemium-gate';

type ScanMode = 'camera' | 'gallery' | 'text';

export function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanMode, setScanMode] = useState<ScanMode>('camera');
  const [showHelp, setShowHelp] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showAnalysisSheet, setShowAnalysisSheet] = useState(false);
  const [showFreemiumGate, setShowFreemiumGate] = useState(false);

  const { canAccessFeature, incrementFreeUsage } = useSubscription();

  useEffect(() => {
    if (!canAccessFeature('product_scan')) {
      setShowFreemiumGate(true);
    }
  }, [canAccessFeature]);

  const takePicture = async () => {
    if (!canAccessFeature('product_scan')) {
      setShowFreemiumGate(true);
      return;
    }

    try {
      // Mock taking a picture for now - in real implementation, capture from camera
      setCapturedImage('mock_image_uri');
      await incrementFreeUsage('product_scan');
      setShowAnalysisSheet(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to capture image');
    }
  };

  const pickFromGallery = async () => {
    if (!canAccessFeature('product_scan')) {
      setShowFreemiumGate(true);
      return;
    }

    const granted = await askForGalleryPermissions();
    if (!granted) {
      Alert.alert('Permission Required', 'Gallery access is needed to select images');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setCapturedImage(result.assets[0].uri);
        await incrementFreeUsage('product_scan');
        setShowAnalysisSheet(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const openTextEntry = () => {
    if (!canAccessFeature('product_scan')) {
      setShowFreemiumGate(true);
      return;
    }

    // For text entry, we'll use the analysis sheet directly with no image
    setCapturedImage(null);
    setShowAnalysisSheet(true);
  };

  if (!permission) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black">
        <Text className="text-white">Requesting camera permission...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted && scanMode === 'camera') {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black px-6">
        <Camera size={80} color="white" className="mb-6" />
        <Text className="text-white text-xl font-semibold mb-4 text-center">
          Camera Access Required
        </Text>
        <Text className="text-gray-300 text-center mb-8">
          To scan product ingredients, we need access to your camera
        </Text>
        <Button
          variant="primary"
          label="Grant Permission"
          onPress={requestPermission}
          className="mb-4"
        />
        <Button
          variant="secondary"
          label="Use Gallery Instead"
          onPress={() => setScanMode('gallery')}
        />
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {scanMode === 'camera' && (
        <CameraView style={StyleSheet.absoluteFillObject} enableTorch={flashOn} facing="back" />
      )}

      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center px-4 pt-2">
          <Pressable onPress={() => router.back()}>
            <X size={26} color="white" />
          </Pressable>

          <Text className="text-white text-xl font-semibold">Scan Ingredients</Text>

          <Pressable onPress={() => setShowHelp(true)}>
            <HelpCircle size={26} color="white" />
          </Pressable>
        </View>

        {/* Instructions */}
        <View className="px-6 py-4">
          <Text className="text-white text-center text-base">
            {scanMode === 'camera'
              ? 'Position ingredients list in the frame and tap capture'
              : scanMode === 'gallery'
                ? 'Select a clear photo of ingredient list'
                : 'Type or paste the ingredients list manually'}
          </Text>
        </View>

        {/* Camera Frame */}
        {scanMode === 'camera' && (
          <View className="flex-1 justify-center items-center">
            <View className="w-[85%] aspect-[4/3] border-2 border-white rounded-xl bg-transparent" />
            <Text className="text-white/70 text-sm mt-4 text-center px-4">
              Align the ingredients list within this frame for best results
            </Text>
          </View>
        )}

        {/* Gallery/Text modes content */}
        {scanMode !== 'camera' && (
          <View className="flex-1 justify-center items-center px-6">
            <View className="w-32 h-32 rounded-full border-2 border-white/30 items-center justify-center mb-6">
              {scanMode === 'gallery' ? (
                <Image size={60} color="white" />
              ) : (
                <FileText size={60} color="white" />
              )}
            </View>
            <Text className="text-white text-lg font-medium mb-2 text-center">
              {scanMode === 'gallery' ? 'Select from Gallery' : 'Enter Text Manually'}
            </Text>
            <Text className="text-gray-300 text-center mb-8">
              {scanMode === 'gallery'
                ? 'Choose a clear photo showing the ingredient list'
                : 'Type or paste the ingredient list from the product'}
            </Text>
          </View>
        )}

        {/* Bottom Controls */}
        <View className="bg-black/60 pt-4 pb-8 px-6">
          {/* Mode Selector */}
          <View className="flex-row justify-around mb-6">
            <Pressable
              onPress={() => setScanMode('camera')}
              className={`flex-1 items-center mx-1 py-3 rounded-xl ${
                scanMode === 'camera' ? 'bg-white' : 'bg-white/10'
              }`}
            >
              <Camera size={24} color={scanMode === 'camera' ? 'black' : '#d1d5db'} />
              <Text
                className={`text-xs mt-1 ${
                  scanMode === 'camera' ? 'text-black font-medium' : 'text-gray-400'
                }`}
              >
                Camera
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setScanMode('gallery')}
              className={`flex-1 items-center mx-1 py-3 rounded-xl ${
                scanMode === 'gallery' ? 'bg-white' : 'bg-white/10'
              }`}
            >
              <Image size={24} color={scanMode === 'gallery' ? 'black' : '#d1d5db'} />
              <Text
                className={`text-xs mt-1 ${
                  scanMode === 'gallery' ? 'text-black font-medium' : 'text-gray-400'
                }`}
              >
                Gallery
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setScanMode('text')}
              className={`flex-1 items-center mx-1 py-3 rounded-xl ${
                scanMode === 'text' ? 'bg-white' : 'bg-white/10'
              }`}
            >
              <FileText size={24} color={scanMode === 'text' ? 'black' : '#d1d5db'} />
              <Text
                className={`text-xs mt-1 ${
                  scanMode === 'text' ? 'text-black font-medium' : 'text-gray-400'
                }`}
              >
                Text
              </Text>
            </Pressable>
          </View>

          {/* Action Buttons */}
          <View className="flex-row items-center justify-center gap-4">
            {scanMode === 'camera' && (
              <Pressable
                onPress={() => setFlashOn(!flashOn)}
                className="bg-white/20 p-3 rounded-full"
              >
                <Zap size={24} color="white" />
              </Pressable>
            )}

            <Button
              variant="primary"
              label={
                scanMode === 'camera'
                  ? 'Capture'
                  : scanMode === 'gallery'
                    ? 'Select Photo'
                    : 'Enter Text'
              }
              onPress={
                scanMode === 'camera'
                  ? takePicture
                  : scanMode === 'gallery'
                    ? pickFromGallery
                    : openTextEntry
              }
              className="flex-1 max-w-xs"
            />
          </View>
        </View>
      </SafeAreaView>

      <HelpModal visible={showHelp} onClose={() => setShowHelp(false)} />

      <IngredientAnalysisSheet
        visible={showAnalysisSheet}
        onClose={() => {
          setShowAnalysisSheet(false);
          setCapturedImage(null);
        }}
        imageUri={capturedImage}
      />

      <FreemiumGate
        visible={showFreemiumGate}
        feature="product_scan"
        featureName="Product Scanning"
        featureDescription="Analyze hair product ingredients with AI-powered insights"
        icon="camera"
        onClose={() => setShowFreemiumGate(false)}
      />
    </View>
  );
}
