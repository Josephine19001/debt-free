export type DebtCategory = 'credit_card' | 'personal_loan' | 'auto_loan' | 'student_loan' | 'mortgage' | 'medical' | 'other';

export type DebtStatus = 'active' | 'paid_off';

export interface Debt {
  id: string;
  name: string;
  category: DebtCategory;
  status: DebtStatus;
  current_balance: number;
  original_balance: number;
  interest_rate: number; // APR as decimal (e.g., 0.2499 for 24.99%)
  minimum_payment: number;
  due_date: number; // Day of month (1-31)
  paid_off_date?: string; // ISO date when debt was fully paid off
  created_at: string;
  updated_at: string;
}

export interface DebtPayment {
  id: string;
  debt_id: string;
  amount: number;
  principal_paid: number;
  interest_paid: number;
  payment_date: string;
  created_at: string;
}

export interface DebtSummary {
  total_balance: number;
  total_original_balance: number;
  total_minimum_payment: number;
  total_interest_paid: number;
  debt_count: number;
  highest_rate_debt: Debt | null;
}

export interface DebtScenario {
  extra_payment: number;
  new_payoff_date: Date;
  original_payoff_date: Date;
  total_interest_saved: number;
  months_saved: number;
}

export interface RefinanceScenario {
  new_rate: number;
  total_interest_saved: number;
  new_monthly_payment: number;
  new_payoff_date: Date;
}

export const DEBT_CATEGORY_CONFIG: Record<DebtCategory, { label: string; color: string; bgColor: string }> = {
  credit_card: { label: 'Credit Card', color: '#EF4444', bgColor: 'bg-red-500/20' },
  personal_loan: { label: 'Personal Loan', color: '#F59E0B', bgColor: 'bg-amber-500/20' },
  auto_loan: { label: 'Auto Loan', color: '#3B82F6', bgColor: 'bg-blue-500/20' },
  student_loan: { label: 'Student Loan', color: '#8B5CF6', bgColor: 'bg-violet-500/20' },
  mortgage: { label: 'Mortgage', color: '#06B6D4', bgColor: 'bg-cyan-500/20' },
  medical: { label: 'Medical', color: '#EC4899', bgColor: 'bg-pink-500/20' },
  other: { label: 'Other', color: '#6B7280', bgColor: 'bg-gray-500/20' },
};
