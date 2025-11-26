import { View, Modal, Pressable, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { BlurView } from 'expo-blur';

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
};

export function ConfirmationModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        className="flex-1 justify-center items-center px-6"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        onPress={onClose}
      >
        <Pressable
          className="w-full rounded-3xl overflow-hidden"
          onPress={(e) => e.stopPropagation()}
        >
          <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill}>
            <View
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              }}
            />
          </BlurView>
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}
          />
          <View className="p-6">
            <Text className="text-xl font-semibold text-center mb-2 text-white">
              {title}
            </Text>
            <Text className="text-gray-400 text-center mb-6">{message}</Text>

            <View className="gap-3">
              <Pressable
                onPress={onConfirm}
                className={`py-4 rounded-2xl ${destructive ? 'bg-red-500/80' : 'bg-emerald-500/80'}`}
              >
                <Text className="text-white text-center font-semibold">
                  {confirmText}
                </Text>
              </Pressable>

              <Pressable
                onPress={onClose}
                className="py-4 rounded-2xl"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <Text className="text-white text-center font-medium">
                  {cancelText}
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
