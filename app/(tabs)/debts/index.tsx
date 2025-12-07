import { useState, useRef } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Search, SlidersHorizontal, X, Check, ChevronDown } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { PageLayout } from '@/components/layouts';
import { GlassBottomSheet, GlassBottomSheetRef } from '@/components/ui/glass-bottom-sheet';
import { DebtListItem, EmptyState, DebtListSkeleton } from '@/components/debts';
import { PaymentDueBanner } from '@/components/home';
import { useDebts, usePaymentsDue } from '@/lib/hooks/use-debts';
import { useDebouncedValue } from '@/lib/hooks/utils';
import { DebtCategory, DebtStatus, DEBT_CATEGORY_CONFIG } from '@/lib/types/debt';
import { MOCK_DATA, DEMO_MODE } from '@/lib/config/mock-data';
import { useColors } from '@/lib/hooks/use-colors';
import { useTheme } from '@/context/theme-provider';

type Strategy = 'avalanche' | 'snowball';
type SortOption = 'interest_rate' | 'balance' | 'name';
type StatusFilter = DebtStatus | 'all';

const STRATEGIES: { value: Strategy; label: string; description: string }[] = [
  {
    value: 'avalanche',
    label: 'Avalanche',
    description: 'Pay highest interest first - saves the most money',
  },
  {
    value: 'snowball',
    label: 'Snowball',
    description: 'Pay smallest balance first - quick wins for motivation',
  },
];

export default function DebtsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { isDark } = useTheme();
  const filterSheetRef = useRef<GlassBottomSheetRef>(null);
  const strategySheetRef = useRef<GlassBottomSheetRef>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [strategy, setStrategy] = useState<Strategy>('avalanche');
  const [sortBy, setSortBy] = useState<SortOption>('interest_rate');
  const [categoryFilter, setCategoryFilter] = useState<DebtCategory | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  const hasActiveFilters = categoryFilter !== null || statusFilter !== 'active';
  const currentStrategy = STRATEGIES.find((s) => s.value === strategy)!;

  const handleStrategySelect = (newStrategy: Strategy) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStrategy(newStrategy);
    // Update sort based on strategy
    if (newStrategy === 'avalanche') {
      setSortBy('interest_rate');
    } else {
      setSortBy('balance');
    }
    strategySheetRef.current?.close();
  };

  const { data: realDebts, isLoading: realLoading } = useDebts(debouncedSearch);
  const { data: paymentsDue } = usePaymentsDue();

  // Use mock data in demo mode
  const debts = DEMO_MODE ? MOCK_DATA.debts : realDebts;
  const isLoading = DEMO_MODE ? false : realLoading;

  const handleAddDebt = () => {
    router.push('/debt/add');
  };

  const handleDebtPress = (debtId: string) => {
    router.push(`/debt/${debtId}`);
  };

  // Filter and sort debts
  const filteredDebts = debts
    ?.filter((debt) => {
      // Status filter (default: active)
      if (statusFilter !== 'all' && debt.status !== statusFilter) return false;
      // Category filter
      if (categoryFilter && debt.category !== categoryFilter) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'interest_rate':
          return b.interest_rate - a.interest_rate; // Highest first (Avalanche)
        case 'balance':
          return strategy === 'snowball'
            ? a.current_balance - b.current_balance // Lowest first (Snowball)
            : b.current_balance - a.current_balance; // Highest first
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const hasDebts = filteredDebts && filteredDebts.length > 0;

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'interest_rate', label: 'Interest Rate' },
    { value: 'balance', label: 'Balance' },
    { value: 'name', label: 'Name' },
  ];

  const categories = Object.entries(DEBT_CATEGORY_CONFIG).map(([key, config]) => ({
    value: key as DebtCategory,
    label: config.label,
  }));

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'paid_off', label: 'Paid Off' },
    { value: 'all', label: 'All' },
  ];

  const handleOpenFilters = () => {
    filterSheetRef.current?.expand();
  };

  const handleResetFilters = () => {
    setSortBy('interest_rate');
    setCategoryFilter(null);
    setStatusFilter('active');
  };

  const titleWithStrategy = (
    <View className="flex-row items-center">
      <Text style={{ color: colors.text }} className="text-2xl font-bold mr-2">Debts</Text>
      <Pressable
        onPress={() => strategySheetRef.current?.expand()}
        className="flex-row items-center px-3 py-1.5 rounded-full"
        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderWidth: 1, borderColor: colors.border }}
      >
        <Text className="text-emerald-400 text-sm font-medium mr-1">{currentStrategy.label}</Text>
        <ChevronDown size={14} color="#10B981" />
      </Pressable>
    </View>
  );

  const headerActions = (
    <View className="flex-row items-center">
      <Pressable
        onPress={() => {
          setShowSearch(!showSearch);
          if (showSearch) setSearchQuery('');
        }}
        className="w-9 h-9 rounded-full overflow-hidden items-center justify-center mr-2"
      >
        <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <View className="absolute inset-0 rounded-full" style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }} />
        {showSearch ? <X size={18} color={colors.icon} /> : <Search size={18} color={colors.icon} />}
      </Pressable>
      <Pressable
        onPress={handleOpenFilters}
        className="w-9 h-9 rounded-full overflow-hidden items-center justify-center mr-2"
      >
        <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <View
          className="absolute inset-0 rounded-full"
          style={{
            borderWidth: 1,
            borderColor: hasActiveFilters ? 'rgba(16, 185, 129, 0.3)' : colors.border,
            backgroundColor: hasActiveFilters ? 'rgba(16, 185, 129, 0.1)' : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
          }}
        />
        <SlidersHorizontal size={18} color={hasActiveFilters ? '#10B981' : colors.icon} />
      </Pressable>
      <Pressable
        onPress={handleAddDebt}
        className="w-9 h-9 rounded-full items-center justify-center"
        style={{ backgroundColor: '#10B981', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' }}
      >
        <Plus size={18} color="#FFFFFF" />
      </Pressable>
    </View>
  );

  return (
    <PageLayout title={titleWithStrategy} rightAction={headerActions}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Payment Due Banner */}
        {paymentsDue && paymentsDue.length > 0 && !showSearch && (
          <PaymentDueBanner debts={paymentsDue} />
        )}

        {/* Search Bar (expandable) */}
        {showSearch && (
          <View
            className="mx-4 mt-2 mb-4 rounded-2xl overflow-hidden"
            style={{
              backgroundColor: isDark ? colors.card : '#FFFFFF',
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.3 : 0.06,
              shadowRadius: isDark ? 4 : 6,
              elevation: isDark ? 3 : 2,
            }}
          >
            {isDark && <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />}
            <View
              className="absolute inset-0 rounded-2xl"
              style={{ borderWidth: 1, borderColor: isDark ? colors.border : 'rgba(0, 0, 0, 0.08)' }}
            />
            <View className="flex-row items-center px-4 py-3">
              <Search size={18} color={colors.textMuted} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search debts..."
                placeholderTextColor={colors.textMuted}
                autoFocus
                keyboardAppearance={isDark ? 'dark' : 'light'}
                className="flex-1 ml-3 text-base"
                style={{ color: colors.text }}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')}>
                  <X size={18} color={colors.textMuted} />
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* Strategy Info Banner */}
        {!isLoading && hasDebts && !debouncedSearch && (sortBy === 'interest_rate' || sortBy === 'balance') && (
          <View
            className="mx-4 mb-4 rounded-2xl p-4"
            style={{
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
              borderWidth: 1,
              borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.25)',
            }}
          >
            <Text className="text-emerald-500 font-semibold mb-1">{currentStrategy.label} Strategy</Text>
            <Text style={{ color: colors.textSecondary }} className="text-sm">
              {currentStrategy.description}
            </Text>
          </View>
        )}

        {/* Loading State */}
        {isLoading && <DebtListSkeleton count={4} />}

        {/* Empty State */}
        {!isLoading &&
          !hasDebts &&
          !debouncedSearch &&
          !categoryFilter &&
          statusFilter === 'active' && <EmptyState onAddDebt={handleAddDebt} />}

        {/* No Search/Filter Results */}
        {!isLoading &&
          !hasDebts &&
          (debouncedSearch || categoryFilter || statusFilter !== 'active') && (
            <View className="items-center py-8 px-4">
              <Text style={{ color: colors.textSecondary }} className="text-center">
                No{' '}
                {statusFilter === 'paid_off' ? 'paid off' : statusFilter === 'all' ? '' : 'active '}
                debts found
                {debouncedSearch ? ` matching "${debouncedSearch}"` : ''}
                {categoryFilter ? ` in ${DEBT_CATEGORY_CONFIG[categoryFilter].label}` : ''}
              </Text>
            </View>
          )}

        {/* Debt List */}
        {!isLoading && hasDebts && (
          <View>
            {filteredDebts.map((debt, index) => (
              <DebtListItem
                key={debt.id}
                debt={debt}
                onPress={() => handleDebtPress(debt.id)}
                showRank={!debouncedSearch && (sortBy === 'interest_rate' || sortBy === 'balance')}
                rank={index + 1}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Filter Bottom Sheet */}
      <GlassBottomSheet ref={filterSheetRef} snapPoints={['55%']}>
        <View className="px-5 pt-2 pb-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text style={{ color: colors.text }} className="text-xl font-semibold">Filter & Sort</Text>
            {hasActiveFilters && (
              <Pressable onPress={handleResetFilters}>
                <Text className="text-emerald-400 text-sm font-medium">Reset</Text>
              </Pressable>
            )}
          </View>

          {/* Status Filter */}
          <Text style={{ color: colors.textSecondary }} className="text-sm mb-3">Status</Text>
          <View className="flex-row flex-wrap mb-5">
            {statusOptions.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setStatusFilter(option.value)}
                className="flex-row items-center px-4 py-2 rounded-full mr-2 mb-2"
                style={{ backgroundColor: statusFilter === option.value ? '#10B981' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)') }}
              >
                {statusFilter === option.value && (
                  <Check size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                )}
                <Text
                  className="text-sm"
                  style={{ color: statusFilter === option.value ? '#FFFFFF' : colors.textSecondary, fontWeight: statusFilter === option.value ? '600' : '400' }}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Sort Options */}
          <Text style={{ color: colors.textSecondary }} className="text-sm mb-3">Sort by</Text>
          <View className="flex-row flex-wrap mb-5">
            {sortOptions.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setSortBy(option.value)}
                className="flex-row items-center px-4 py-2 rounded-full mr-2 mb-2"
                style={{ backgroundColor: sortBy === option.value ? '#10B981' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)') }}
              >
                {sortBy === option.value && (
                  <Check size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                )}
                <Text
                  className="text-sm"
                  style={{ color: sortBy === option.value ? '#FFFFFF' : colors.textSecondary, fontWeight: sortBy === option.value ? '600' : '400' }}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Category Filter */}
          <Text style={{ color: colors.textSecondary }} className="text-sm mb-3">Category</Text>
          <View className="flex-row flex-wrap">
            <Pressable
              onPress={() => setCategoryFilter(null)}
              className="flex-row items-center px-4 py-2 rounded-full mr-2 mb-2"
              style={{ backgroundColor: categoryFilter === null ? '#10B981' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)') }}
            >
              {categoryFilter === null && (
                <Check size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              )}
              <Text
                className="text-sm"
                style={{ color: categoryFilter === null ? '#FFFFFF' : colors.textSecondary, fontWeight: categoryFilter === null ? '600' : '400' }}
              >
                All
              </Text>
            </Pressable>
            {categories.map((cat) => (
              <Pressable
                key={cat.value}
                onPress={() => setCategoryFilter(cat.value)}
                className="flex-row items-center px-4 py-2 rounded-full mr-2 mb-2"
                style={{ backgroundColor: categoryFilter === cat.value ? '#10B981' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)') }}
              >
                {categoryFilter === cat.value && (
                  <Check size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                )}
                <Text
                  className="text-sm"
                  style={{ color: categoryFilter === cat.value ? '#FFFFFF' : colors.textSecondary, fontWeight: categoryFilter === cat.value ? '600' : '400' }}
                >
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </GlassBottomSheet>

      {/* Strategy Selection Bottom Sheet */}
      <GlassBottomSheet ref={strategySheetRef} snapPoints={['35%']}>
        <View className="px-5 pt-2 pb-4">
          <Text style={{ color: colors.text }} className="text-xl font-semibold mb-2">Payment Strategy</Text>
          <Text style={{ color: colors.textSecondary }} className="text-sm mb-6">
            Choose how to prioritize your debt payments
          </Text>

          {STRATEGIES.map((strat) => {
            const isSelected = strategy === strat.value;
            return (
              <Pressable
                key={strat.value}
                onPress={() => handleStrategySelect(strat.value)}
                className="flex-row items-center p-4 rounded-2xl mb-3"
                style={{
                  backgroundColor: isSelected
                    ? 'rgba(16, 185, 129, 0.15)'
                    : isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                  borderWidth: 1,
                  borderColor: isSelected
                    ? 'rgba(16, 185, 129, 0.3)'
                    : isDark ? colors.border : 'rgba(0, 0, 0, 0.08)',
                  shadowColor: isDark ? undefined : '#000000',
                  shadowOffset: isDark ? undefined : { width: 0, height: 1 },
                  shadowOpacity: isDark ? undefined : 0.04,
                  shadowRadius: isDark ? undefined : 4,
                  elevation: isDark ? undefined : 1,
                }}
              >
                <View className="flex-1">
                  <Text
                    className="font-semibold mb-1"
                    style={{ color: isSelected ? '#10B981' : colors.text }}
                  >
                    {strat.label}
                  </Text>
                  <Text style={{ color: colors.textSecondary }} className="text-sm">{strat.description}</Text>
                </View>
                {isSelected && <Check size={20} color="#10B981" />}
              </Pressable>
            );
          })}
        </View>
      </GlassBottomSheet>
    </PageLayout>
  );
}
