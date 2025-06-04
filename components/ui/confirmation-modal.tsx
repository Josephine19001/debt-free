import { View, Modal, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';

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
  confirmText = 'Delete',
  cancelText = 'Cancel',
  destructive = false,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View className="bg-white w-full rounded-xl p-6">
          <Text className="text-2xl font-semibold text-center mb-2">{title}</Text>
          <Text className="text-gray-600 text-center mb-8">{message}</Text>

          <View className="flex-row gap-4">
            <Pressable
              onPress={onConfirm}
              className={`flex-1 py-3 rounded-xl ${destructive ? 'bg-black' : 'bg-blue-500'}`}
            >
              <Text className="text-white text-center font-medium">{confirmText}</Text>
            </Pressable>

            <Pressable onPress={onClose} className="flex-1 py-3 rounded-xl bg-gray-100">
              <Text className="text-center font-medium">{cancelText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
