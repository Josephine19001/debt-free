import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { PageLayout } from '@/components/layouts';
import { FormField, SaveButton } from '@/components/ui/form-page';
import { useCreateDebt } from '@/lib/hooks/use-debts';
import { DebtCategory, DEBT_CATEGORY_CONFIG } from '@/lib/types/debt';
import { Check } from 'lucide-react-native';

const CATEGORIES: DebtCategory[] = [
  'credit_card',
  'personal_loan',
  'auto_loan',
  'student_loan',
  'mortgage',
  'medical',
  'other',
];

export default function AddDebtScreen() {
  const router = useRouter();
  const createDebt = useCreateDebt();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<DebtCategory>('credit_card');
  const [balance, setBalance] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [minimumPayment, setMinimumPayment] = useState('');

  const isValid =
    name.trim() &&
    parseFloat(balance) > 0 &&
    parseFloat(interestRate) >= 0 &&
    parseFloat(minimumPayment) > 0;

  const handleSave = async () => {
    if (!isValid) return;

    await createDebt.mutateAsync({
      name: name.trim(),
      category,
      current_balance: parseFloat(balance),
      interest_rate: parseFloat(interestRate) / 100, // Convert percentage to decimal
      minimum_payment: parseFloat(minimumPayment),
    });

    router.back();
  };

  return (
    <PageLayout
      title="Add Debt"
      showBackButton
      rightAction={
        <SaveButton
          onPress={handleSave}
          disabled={!isValid}
          loading={createDebt.isPending}
          label="Save"
        />
      }
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-5">
          {/* Name */}
          <FormField
            label="Debt Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g., Visa Gold Card"
          />

          {/* Category */}
          <View className="gap-2">
            <Text className="text-sm font-medium text-gray-400 ml-1">Category</Text>
            <View className="flex-row flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const config = DEBT_CATEGORY_CONFIG[cat];
                const isSelected = category === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    className="rounded-full overflow-hidden"
                  >
                    <View
                      className={`px-4 py-2 rounded-full flex-row items-center ${
                        isSelected ? '' : 'bg-white/[0.03] border border-white/10'
                      }`}
                      style={isSelected ? { backgroundColor: config.color + '30' } : undefined}
                    >
                      {isSelected && (
                        <Check size={14} color={config.color} style={{ marginRight: 4 }} />
                      )}
                      <Text
                        className="text-sm"
                        style={{ color: isSelected ? config.color : '#9CA3AF' }}
                      >
                        {config.label}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Current Balance */}
          <FormField
            label="Current Balance ($)"
            value={balance}
            onChangeText={setBalance}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />

          {/* Interest Rate */}
          <FormField
            label="Interest Rate (APR %)"
            value={interestRate}
            onChangeText={setInterestRate}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />

          {/* Minimum Payment */}
          <FormField
            label="Minimum Monthly Payment ($)"
            value={minimumPayment}
            onChangeText={setMinimumPayment}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
        </View>
      </ScrollView>
    </PageLayout>
  );
}
