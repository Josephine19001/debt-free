import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import { queryKeys } from './query-keys';
import { handleError } from './utils';
import {
  Debt,
  DebtPayment,
  DebtSummary,
  DebtCategory,
} from '@/lib/types/debt';
import {
  MOCK_DEBTS,
  MOCK_PAYMENTS,
  calculateDebtSummary,
  simulateDelay,
} from '@/lib/mock/debts';

// In-memory store for mock data (simulates database)
let mockDebts = [...MOCK_DEBTS];
let mockPayments = [...MOCK_PAYMENTS];

/**
 * Fetch all debts, optionally filtered by search query
 * Returns debts sorted by interest rate (highest first - Avalanche method)
 */
export function useDebts(
  search?: string,
  options?: Omit<UseQueryOptions<Debt[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.debts.list(search),
    queryFn: async () => {
      await simulateDelay(300);

      let debts = [...mockDebts];

      // Filter by search if provided
      if (search && search.trim()) {
        const searchLower = search.toLowerCase();
        debts = debts.filter(
          d =>
            d.name.toLowerCase().includes(searchLower) ||
            d.category.toLowerCase().includes(searchLower)
        );
      }

      // Sort by interest rate (highest first - Avalanche method)
      return debts.sort((a, b) => b.interest_rate - a.interest_rate);
    },
    ...options,
  });
}

/**
 * Fetch a single debt by ID
 */
export function useDebt(
  id: string,
  options?: Omit<UseQueryOptions<Debt | null, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.debts.detail(id),
    queryFn: async () => {
      await simulateDelay(200);
      return mockDebts.find(d => d.id === id) || null;
    },
    enabled: !!id,
    ...options,
  });
}

/**
 * Fetch debt summary statistics
 */
export function useDebtSummary(
  options?: Omit<UseQueryOptions<DebtSummary, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.debts.summary(),
    queryFn: async () => {
      await simulateDelay(200);
      return calculateDebtSummary(mockDebts);
    },
    ...options,
  });
}

/**
 * Fetch payment history for a specific debt
 */
export function useDebtPayments(
  debtId: string,
  options?: Omit<UseQueryOptions<DebtPayment[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.debts.payments(debtId),
    queryFn: async () => {
      await simulateDelay(200);
      return mockPayments
        .filter(p => p.debt_id === debtId)
        .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());
    },
    enabled: !!debtId,
    ...options,
  });
}

interface CreateDebtPayload {
  name: string;
  category: DebtCategory;
  current_balance: number;
  interest_rate: number;
  minimum_payment: number;
  due_date?: number;
}

/**
 * Create a new debt
 */
export function useCreateDebt() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateDebtPayload) => {
      await simulateDelay(500);

      const newDebt: Debt = {
        id: String(Date.now()),
        name: payload.name,
        category: payload.category,
        status: 'active',
        current_balance: payload.current_balance,
        original_balance: payload.current_balance,
        interest_rate: payload.interest_rate,
        minimum_payment: payload.minimum_payment,
        due_date: payload.due_date || 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockDebts.push(newDebt);
      return newDebt;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.debts.all });
      toast.success('Debt added successfully');
    },
    onError: (err: any) => handleError(err, 'Failed to add debt'),
  });
}

interface UpdateDebtPayload {
  id: string;
  name?: string;
  category?: DebtCategory;
  current_balance?: number;
  interest_rate?: number;
  minimum_payment?: number;
  due_date?: number;
}

/**
 * Update an existing debt
 */
export function useUpdateDebt() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateDebtPayload) => {
      await simulateDelay(500);

      const index = mockDebts.findIndex(d => d.id === payload.id);
      if (index === -1) throw new Error('Debt not found');

      mockDebts[index] = {
        ...mockDebts[index],
        ...payload,
        updated_at: new Date().toISOString(),
      };

      return mockDebts[index];
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.debts.all });
      qc.invalidateQueries({ queryKey: queryKeys.debts.detail(data.id) });
      toast.success('Debt updated successfully');
    },
    onError: (err: any) => handleError(err, 'Failed to update debt'),
  });
}

/**
 * Delete a debt
 */
export function useDeleteDebt() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await simulateDelay(500);

      const index = mockDebts.findIndex(d => d.id === id);
      if (index === -1) throw new Error('Debt not found');

      mockDebts.splice(index, 1);
      mockPayments = mockPayments.filter(p => p.debt_id !== id);

      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.debts.all });
      toast.success('Debt deleted successfully');
    },
    onError: (err: any) => handleError(err, 'Failed to delete debt'),
  });
}

interface RecordPaymentPayload {
  debt_id: string;
  amount: number;
}

/**
 * Record a payment for a debt
 */
export function useRecordPayment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RecordPaymentPayload) => {
      await simulateDelay(500);

      const debt = mockDebts.find(d => d.id === payload.debt_id);
      if (!debt) throw new Error('Debt not found');

      // Calculate interest/principal split (simplified)
      const monthlyInterest = (debt.current_balance * debt.interest_rate) / 12;
      const interestPaid = Math.min(monthlyInterest, payload.amount);
      const principalPaid = payload.amount - interestPaid;

      const newPayment: DebtPayment = {
        id: String(Date.now()),
        debt_id: payload.debt_id,
        amount: payload.amount,
        principal_paid: principalPaid,
        interest_paid: interestPaid,
        payment_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      mockPayments.push(newPayment);

      // Update debt balance
      const debtIndex = mockDebts.findIndex(d => d.id === payload.debt_id);
      const newBalance = Math.max(0, debt.current_balance - principalPaid);
      mockDebts[debtIndex].current_balance = newBalance;
      mockDebts[debtIndex].updated_at = new Date().toISOString();

      // Auto mark as paid off when balance reaches 0
      if (newBalance === 0) {
        mockDebts[debtIndex].status = 'paid_off';
        mockDebts[debtIndex].paid_off_date = new Date().toISOString();
        mockDebts[debtIndex].minimum_payment = 0;
      }

      return newPayment;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.debts.all });
      qc.invalidateQueries({ queryKey: queryKeys.debts.detail(data.debt_id) });
      qc.invalidateQueries({ queryKey: queryKeys.debts.payments(data.debt_id) });
      toast.success('Payment recorded successfully');
    },
    onError: (err: any) => handleError(err, 'Failed to record payment'),
  });
}
