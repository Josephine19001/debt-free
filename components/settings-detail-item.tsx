import { View, Text, TextInput, Pressable } from 'react-native';
import { Pencil, Check } from 'lucide-react-native';
import { useTheme } from '@/context/theme-provider';
import { useColors } from '@/lib/hooks/use-colors';

type SettingsDetailItemProps = {
  label: string;
  value: string | Date;
  isEditing: boolean;
  tempValue: string;
  onEdit: () => void;
  onSave: () => void;
  onChangeText: (text: string) => void;
  isLast?: boolean;
};

const SettingsDetailItem = ({
  label,
  value,
  isEditing,
  tempValue,
  onEdit,
  onSave,
  onChangeText,
  isLast,
}: SettingsDetailItemProps) => {
  const { isDark } = useTheme();
  const colors = useColors();

  return (
    <View
      className="flex-row justify-between items-center rounded-2xl p-4"
      style={{
        backgroundColor: isDark ? colors.card : '#FFFFFF',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.2 : 0.04,
        shadowRadius: isDark ? 3 : 4,
        elevation: isDark ? 2 : 1,
        marginBottom: isLast ? 0 : 8,
      }}
    >
      <Text
        className="text-base font-medium flex-shrink-0"
        style={{ color: colors.text }}
      >
        {label}
      </Text>
      <View className="flex-row items-center flex-1 justify-end">
        {isEditing && label.toLowerCase().includes('date') ? null : isEditing ? (
          <>
            <TextInput
              value={tempValue}
              onChangeText={onChangeText}
              className="text-base mr-3 px-2 py-1 flex-1 min-w-[120px] text-right"
              style={{ color: colors.text }}
              autoFocus
              multiline={false}
              placeholderTextColor={colors.inputPlaceholder}
              keyboardAppearance={isDark ? 'dark' : 'light'}
            />
            <Pressable
              onPress={onSave}
              className="w-8 h-8 items-center justify-center flex-shrink-0"
            >
              <Check size={20} color={colors.textSecondary} />
            </Pressable>
          </>
        ) : (
          <>
            <Text
              className="text-base mr-3 flex-1 text-right"
              style={{ color: colors.textSecondary }}
            >
              {typeof value === 'string' ? value : value.toLocaleDateString()}
            </Text>
            <Pressable
              onPress={onEdit}
              className="w-8 h-8 items-center justify-center flex-shrink-0"
            >
              <Pencil size={20} color={colors.textSecondary} />
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
};

export default SettingsDetailItem;
