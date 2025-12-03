import { View, Text, Pressable, ScrollView } from 'react-native';
import { Check } from 'lucide-react-native';
import { CurrencyConfig, CURRENCIES } from '@/context/currency-provider';
import { useColors } from '@/lib/hooks/use-colors';
import { useTheme } from '@/context/theme-provider';

interface CurrencySelectorProps {
  selected: CurrencyConfig;
  onSelect: (currency: CurrencyConfig) => void;
}

export function CurrencySelector({ selected, onSelect }: CurrencySelectorProps) {
  const colors = useColors();
  const { isDark } = useTheme();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View className="flex-row flex-wrap justify-center">
        {CURRENCIES.map((currency) => {
          const isSelected = selected.code === currency.code;
          return (
            <Pressable
              key={currency.code}
              onPress={() => onSelect(currency)}
              className="m-1.5"
            >
              <View
                className="w-24 h-24 rounded-2xl items-center justify-center"
                style={{
                  borderWidth: 2,
                  borderColor: isSelected ? '#10B981' : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.1)' : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                }}
              >
                {isSelected && (
                  <View className="absolute top-2 right-2">
                    <Check size={14} color="#10B981" />
                  </View>
                )}
                <Text
                  className="text-2xl font-bold mb-1"
                  style={{ color: isSelected ? '#34D399' : colors.text }}
                >
                  {currency.symbol}
                </Text>
                <Text
                  className="text-xs"
                  style={{ color: isSelected ? '#34D399' : colors.textSecondary }}
                >
                  {currency.code}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
