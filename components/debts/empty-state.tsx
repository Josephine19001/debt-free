import { View, Text, Pressable } from 'react-native';
import { CreditCard, Plus } from 'lucide-react-native';
import { GlassCard } from '@/components/layouts';

interface EmptyStateProps {
  onAddDebt: () => void;
}

export function EmptyState({ onAddDebt }: EmptyStateProps) {
  return (
    <GlassCard>
      <View className="items-center py-8">
        <View className="w-16 h-16 rounded-full bg-gray-500/20 items-center justify-center mb-4">
          <CreditCard size={32} color="#6B7280" />
        </View>
        <Text className="text-white font-semibold text-lg mb-2">
          No debts yet
        </Text>
        <Text className="text-gray-400 text-sm text-center px-4">
          Add your first debt to start tracking your journey to financial freedom.
        </Text>
        <Pressable
          onPress={onAddDebt}
          className="mt-4 bg-emerald-500 px-6 py-3 rounded-full flex-row items-center"
        >
          <Plus size={18} color="#FFFFFF" />
          <Text className="text-white font-semibold ml-2">Add Debt</Text>
        </Pressable>
      </View>
    </GlassCard>
  );
}
