import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LucideIcon } from 'lucide-react-native';

interface MetricCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  label: string;
  value: string;
  subValue?: string;
  valueColor?: string;
}

export function MetricCard({
  icon: Icon,
  iconColor,
  iconBgColor,
  label,
  value,
  subValue,
  valueColor = 'text-white',
}: MetricCardProps) {
  return (
    <View className="flex-1 mx-1 rounded-2xl overflow-hidden min-h-[100px]">
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill}>
        <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.05)' }} />
      </BlurView>
      <View className="absolute inset-0 rounded-2xl border border-white/10" />

      <View className="p-4">
        <View className={`w-9 h-9 rounded-full ${iconBgColor} items-center justify-center mb-3`}>
          <Icon size={18} color={iconColor} />
        </View>

        <Text className="text-gray-400 text-xs mb-1">{label}</Text>
        <Text className={`${valueColor} font-bold text-lg`}>{value}</Text>
        {subValue && (
          <Text className="text-gray-500 text-xs mt-0.5">{subValue}</Text>
        )}
      </View>
    </View>
  );
}

interface LargeMetricCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  label: string;
  value: string;
  description?: string;
  valueColor?: string;
  borderColor?: string;
}

export function LargeMetricCard({
  icon: Icon,
  iconColor,
  iconBgColor,
  label,
  value,
  description,
  valueColor = 'text-white',
  borderColor = 'border-white/10',
}: LargeMetricCardProps) {
  return (
    <View className={`mx-4 my-2 rounded-2xl overflow-hidden`}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill}>
        <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.05)' }} />
      </BlurView>
      <View className={`absolute inset-0 rounded-2xl border ${borderColor}`} />

      <View className="p-5 flex-row items-center">
        <View className={`w-12 h-12 rounded-full ${iconBgColor} items-center justify-center mr-4`}>
          <Icon size={24} color={iconColor} />
        </View>

        <View className="flex-1">
          <Text className="text-gray-400 text-xs mb-1">{label}</Text>
          <Text className={`${valueColor} font-bold text-2xl`}>{value}</Text>
          {description && (
            <Text className="text-gray-500 text-xs mt-1">{description}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

interface StatRowProps {
  items: {
    label: string;
    value: string;
    valueColor?: string;
  }[];
}

export function StatRow({ items }: StatRowProps) {
  return (
    <View className="mx-4 my-2 rounded-2xl overflow-hidden">
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill}>
        <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.05)' }} />
      </BlurView>
      <View className="absolute inset-0 rounded-2xl border border-white/10" />

      <View className="p-4 flex-row">
        {items.map((item, index) => (
          <View
            key={index}
            className={`flex-1 ${index < items.length - 1 ? 'border-r border-white/10 pr-4' : ''} ${index > 0 ? 'pl-4' : ''}`}
          >
            <Text className="text-gray-400 text-xs mb-1">{item.label}</Text>
            <Text className={`${item.valueColor || 'text-white'} font-bold text-base`}>
              {item.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
