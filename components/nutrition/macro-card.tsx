import { View, TouchableOpacity, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { Edit3 } from 'lucide-react-native';
import { OliveOilIcon } from '@/components/icons/olive-oil-icon';

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
}) => (
  <View className="mb-3">
    <View
      className="rounded-2xl p-4 border shadow-sm"
      style={{ backgroundColor: bgColor, borderColor: borderColor }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: iconBgColor }}
          >
            {Icon === OliveOilIcon ? (
              <OliveOilIcon size={18} color={color} />
            ) : (
              <Icon size={18} color={color} />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-800">{title}</Text>
            {isEditing ? (
              <TextInput
                value={value.toString()}
                onChangeText={(text) => {
                  const num = parseFloat(text) || 0;
                  onValueChange(num);
                }}
                keyboardType="decimal-pad"
                className="text-2xl font-bold bg-gray-50 rounded-lg px-3 py-1 mt-1"
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
          className="w-8 h-8 bg-gray-50 rounded-full items-center justify-center ml-3"
        >
          <Edit3 size={14} color={color} />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);
