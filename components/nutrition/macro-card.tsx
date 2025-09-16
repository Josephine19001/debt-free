import { View, TouchableOpacity, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { Edit3 } from 'lucide-react-native';
import { OliveOilIcon } from '@/components/icons/olive-oil-icon';
import { useTheme } from '@/context/theme-provider';

export const MacroCard = ({
  title,
  value,
  color,
  bgColor,
  borderColor,
  iconBgColor,
  icon: Icon,
  isEditing,
  onEdit,
  onValueChange,
}: {
  title: string;
  value: number;
  color: string;
  bgColor: string;
  borderColor: string;
  iconBgColor: string;
  icon: React.ElementType;
  isEditing: boolean;
  onEdit: () => void;
  onValueChange: (value: number) => void;
}) => {
  const { isDark } = useTheme();
  
  return (
    <View className="mb-3">
      <View
        className="rounded-2xl p-4 border shadow-sm"
        style={{ backgroundColor: bgColor, borderColor: borderColor }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View
              className="w-8 h-8 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: iconBgColor }}
            >
              {Icon === OliveOilIcon ? (
                <OliveOilIcon size={14} color={color} />
              ) : (
                <Icon size={14} color={color} />
              )}
            </View>
            <View className="flex-1">
              <Text className={isDark ? "text-lg font-semibold text-gray-200" : "text-lg font-semibold text-gray-800"}>{title}</Text>
              {isEditing ? (
                <TextInput
                  value={value.toString()}
                  onChangeText={(text) => {
                    const num = parseFloat(text) || 0;
                    onValueChange(num);
                  }}
                  keyboardType="decimal-pad"
                  className={isDark ? "text-2xl font-bold bg-gray-700 rounded-lg px-3 py-1 mt-1" : "text-2xl font-bold bg-gray-50 rounded-lg px-3 py-1 mt-1"}
                  style={{ color }}
                  selectTextOnFocus
                  autoFocus
                  onBlur={onEdit}
                />
              ) : (
                <TouchableOpacity onPress={onEdit}>
                  <Text className="text-2xl font-bold mt-1" style={{ color }}>
                    {value}g
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <TouchableOpacity
            onPress={onEdit}
            className={isDark ? "w-8 h-8 bg-gray-700 rounded-full items-center justify-center ml-3" : "w-8 h-8 bg-gray-50 rounded-full items-center justify-center ml-3"}
          >
            <Edit3 size={14} color={color} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
