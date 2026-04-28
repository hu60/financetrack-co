// ─── Auth ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

// ─── Transacciones ────────────────────────────────────────────────────────────

export type TransactionType = 'income' | 'expense'

export const CATEGORIES = [
  'Arriendo',
  'Mercado',
  'Transporte',
  'Salud',
  'Educación',
  'Entretenimiento',
  'Restaurantes',
  'Servicios',
  'Ropa',
  'Deudas',
  'Ahorro',
  'Mascota',
  'Gym',
  'Familia',
  'Tecnología',
  'Otros',
] as const

export type Category = (typeof CATEGORIES)[number]

export const INCOME_CATEGORIES = [
  'Salario',
  'Freelance',
  'Quincena',
  'Negocio',
  'Inversión',
  'Regalo',
  'Otros ingresos',
] as const

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number]

export interface Transaction {
  id: string
  user_id: string
  amount: number
  type: TransactionType
  category: string
  description: string | null
  date: string
  created_at: string
}

export interface TransactionInsert {
  amount: number
  type: TransactionType
  category: string
  description?: string | null
  date: string
}

// ─── Deudas ──────────────────────────────────────────────────────────────────

export type DebtStatus = 'active' | 'paid' | 'overdue'

export interface Debt {
  id: string
  user_id: string
  creditor_name: string
  total_amount: number
  paid_amount: number
  interest_rate: number | null
  due_date: string | null
  status: DebtStatus
  notes: string | null
  created_at: string
}

export interface DebtInsert {
  creditor_name: string
  total_amount: number
  paid_amount?: number
  interest_rate?: number | null
  due_date?: string | null
  notes?: string | null
}

export interface DebtPayment {
  id: string
  debt_id: string
  user_id: string
  amount: number
  payment_date: string
  note: string | null
  created_at: string
}

export interface DebtPaymentInsert {
  debt_id: string
  amount: number
  payment_date: string
  note?: string | null
}

// ─── Presupuesto ─────────────────────────────────────────────────────────────

export interface Budget {
  id: string
  user_id: string
  category: string
  amount: number
  month: number
  year: number
  created_at: string
}

export interface BudgetInsert {
  category: string
  amount: number
  month: number
  year: number
}

// ─── Metas de Ahorro ─────────────────────────────────────────────────────────

export type GoalStatus = 'active' | 'completed' | 'paused'

export interface SavingsGoal {
  id: string
  user_id: string
  name: string
  target_amount: number
  current_amount: number
  target_date: string | null
  emoji: string
  status: GoalStatus
  created_at: string
}

export interface SavingsGoalInsert {
  name: string
  target_amount: number
  current_amount?: number
  target_date?: string | null
  emoji?: string
}

export interface SavingsContribution {
  id: string
  goal_id: string
  user_id: string
  amount: number
  contribution_date: string
  note: string | null
  created_at: string
}

export interface SavingsContributionInsert {
  goal_id: string
  amount: number
  contribution_date: string
  note?: string | null
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface MonthSummary {
  totalIncome: number
  totalExpense: number
  balance: number
  transactionCount: number
}

export interface CategoryBreakdown {
  category: string
  amount: number
  percentage: number
}

export interface MonthlyTrend {
  month: string
  income: number
  expense: number
}

export interface FinancialScore {
  score: number
  label: 'Crítico' | 'Regular' | 'Bueno' | 'Excelente'
  color: string
}
