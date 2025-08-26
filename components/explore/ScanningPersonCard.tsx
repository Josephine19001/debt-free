import { View, TouchableOpacity, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Text } from '@/components/ui/text';
import { ScanLine, X } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

export interface ScanningPerson {
  id: number;
  name: string;
  product: string;
  image: any;
}

interface ScanningPersonCardProps {
  person: ScanningPerson;
}

export function ScanningPersonCard({ person }: ScanningPersonCardProps) {
  const [modalVisible, setModalVisible] = useState(false);

  // Animation values for scanning effect
  const scanLineY = useSharedValue(-50);
  const scanOpacity = useSharedValue(0.3);

  useEffect(() => {
    // Animated scanning line
    scanLineY.value = withRepeat(
      withSequence(withTiming(180, { duration: 2000 }), withTiming(-50, { duration: 0 })),
      -1,
      false
    );

    // Pulsing scan effect
    scanOpacity.value = withRepeat(
      withSequence(withTiming(0.8, { duration: 1000 }), withTiming(0.3, { duration: 1000 })),
      -1,
      true
    );
  }, []);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
    opacity: scanOpacity.value,
  }));

  const scanOverlayStyle = useAnimatedStyle(() => ({
    opacity: scanOpacity.value * 0.5,
  }));

  return (
    <>
      <View className="mr-4">
        <TouchableOpacity onPress={() => setModalVisible(true)} className="relative">
          {/* Portrait container with rounded corners */}
          <View className="w-32 h-44 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <Image
              source={person.image}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />

            {/* Scanning overlay */}
            <Animated.View
              className="absolute inset-0 bg-purple-500/20 items-center justify-center"
              style={scanOverlayStyle}
            />

            {/* Animated scanning line */}
            <Animated.View
              className="absolute left-0 right-0 h-1 bg-purple-400"
              style={[{ top: 0 }, scanLineStyle]}
            />

            {/* Scan icon overlay */}
            <View className="absolute inset-0 items-center justify-center">
              <View className="bg-black/50 rounded-full p-2">
                <ScanLine size={24} color="#8B5CF6" />
              </View>
            </View>

            {/* Info overlay at bottom */}
            <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
              <Text className="text-white text-xs font-semibold">{person.name}</Text>
              <Text className="text-white/80 text-xs">{person.product}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Modal for fullscreen view */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black">
          <SafeAreaView className="flex-1">
            {/* Close button */}
            <View className="absolute top-12 right-4 z-10">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="bg-black/50 rounded-full p-2"
              >
                <X size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Fullscreen image with scan effect */}
            <View className="flex-1 items-center justify-center px-4">
              <View className="w-full h-4/5 rounded-2xl overflow-hidden relative">
                <Image
                  source={person.image}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="contain"
                />

                {/* Fullscreen scanning overlay */}
                <Animated.View
                  className="absolute inset-0 bg-purple-500/10"
                  style={scanOverlayStyle}
                />

                {/* Animated scanning line for modal */}
                <Animated.View
                  className="absolute left-0 right-0 h-2 bg-purple-400"
                  style={[{ top: 0 }, scanLineStyle]}
                />

                {/* Large scan icon overlay */}
                <View className="absolute inset-0 items-center justify-center">
                  <View className="bg-black/50 rounded-full p-4">
                    <ScanLine size={48} color="#8B5CF6" />
                  </View>
                </View>
              </View>

              {/* Person info */}
              <View className="p-6 items-center">
                <Text className="text-white text-2xl font-bold mb-2 text-center">
                  {person.name}
                </Text>
                <Text className="text-gray-300 text-lg text-center">Scanning {person.product}</Text>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}
