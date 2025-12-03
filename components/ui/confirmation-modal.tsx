import { View, Modal, Pressable, StyleSheet, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { useColors } from '@/lib/hooks/use-colors';
import { useTheme } from '@/context/theme-provider';

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
  const colors = useColors();
  const { isDark } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        className="flex-1 justify-center items-center px-6"
        style={{ backgroundColor: isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.4)' }}
        onPress={onClose}
      >
        <Pressable
          className="w-full rounded-3xl overflow-hidden"
          onPress={(e) => e.stopPropagation()}
        >
          <BlurView intensity={isDark ? 60 : 80} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill}>
            <View
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.7)',
              }}
            />
          </BlurView>
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          />
          <View className="p-6">
            <Text className="text-xl font-semibold text-center mb-2" style={{ color: colors.text }}>
              {title}
            </Text>
            <Text className="text-center mb-6" style={{ color: colors.textSecondary }}>{message}</Text>

            <View className="gap-3">
              <Pressable
                onPress={onConfirm}
                className="py-4 rounded-2xl"
                style={{ backgroundColor: destructive ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.8)' }}
              >
                <Text className="text-white text-center font-semibold">
                  {confirmText}
                </Text>
              </Pressable>

              <Pressable
                onPress={onClose}
                className="py-4 rounded-2xl"
                style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)' }}
              >
                <Text className="text-center font-medium" style={{ color: colors.text }}>
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
