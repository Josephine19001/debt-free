import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LucideIcon } from 'lucide-react-native';
import { useColors } from '@/lib/hooks/use-colors';
import { useTheme } from '@/context/theme-provider';

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
}: MetricCardProps) {
  const colors = useColors();
  const { isDark } = useTheme();

  return (
    <View className="flex-1 mx-1 rounded-2xl overflow-hidden min-h-[100px]">
      <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill}>
        <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }} />
      </BlurView>
      <View className="absolute inset-0 rounded-2xl" style={{ borderWidth: 1, borderColor: colors.border }} />

      <View className="p-4">
        <View className={`w-9 h-9 rounded-full ${iconBgColor} items-center justify-center mb-3`}>
          <Icon size={18} color={iconColor} />
        </View>

        <Text style={{ color: colors.textSecondary }} className="text-xs mb-1">{label}</Text>
        <Text style={{ color: colors.text }} className="font-bold text-lg">{value}</Text>
        {subValue && (
          <Text style={{ color: colors.textMuted }} className="text-xs mt-0.5">{subValue}</Text>
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
  borderColor,
}: LargeMetricCardProps) {
  const colors = useColors();
  const { isDark } = useTheme();

  return (
    <View className="mx-4 my-2 rounded-2xl overflow-hidden">
      <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill}>
        <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }} />
      </BlurView>
      <View className="absolute inset-0 rounded-2xl" style={{ borderWidth: 1, borderColor: borderColor || colors.border }} />

      <View className="p-5 flex-row items-center">
        <View className={`w-12 h-12 rounded-full ${iconBgColor} items-center justify-center mr-4`}>
          <Icon size={24} color={iconColor} />
        </View>

        <View className="flex-1">
          <Text style={{ color: colors.textSecondary }} className="text-xs mb-1">{label}</Text>
          <Text style={{ color: colors.text }} className="font-bold text-2xl">{value}</Text>
          {description && (
            <Text style={{ color: colors.textMuted }} className="text-xs mt-1">{description}</Text>
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
  const colors = useColors();
  const { isDark } = useTheme();

  return (
    <View className="mx-4 my-2 rounded-2xl overflow-hidden">
      <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill}>
        <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }} />
      </BlurView>
      <View className="absolute inset-0 rounded-2xl" style={{ borderWidth: 1, borderColor: colors.border }} />

      <View className="p-4 flex-row">
        {items.map((item, index) => (
          <View
            key={index}
            className={`flex-1 ${index > 0 ? 'pl-4' : ''}`}
            style={index < items.length - 1 ? { borderRightWidth: 1, borderRightColor: colors.borderLight, paddingRight: 16 } : undefined}
          >
            <Text style={{ color: colors.textSecondary }} className="text-xs mb-1">{item.label}</Text>
            <Text style={{ color: colors.text }} className="font-bold text-base">
              {item.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
