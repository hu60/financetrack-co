import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/useAuthStore'
import { getCurrentMonth, calcFinancialScore, isDueSoon, isOverdue } from '@/lib/utils'
import type {
  Transaction, Debt, SavingsGoal, Budget,
  CategoryBreakdown, MonthlyTrend, FinancialScore,
} from '@/types'
import { format, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'

export interface DashboardData {
  totalIncome: number
  totalExpense: number
  balance: number
  categoryBreakdown: CategoryBreakdown[]
  monthlyTrend: MonthlyTrend[]
  upcomingDebts: Debt[]
  activeGoals: SavingsGoal[]
  score: FinancialScore
  totalDebt: number
  budgetUsagePct: number
}

export function useDashboard() {
  const { user } = useAuthStore()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const now = getCurrentMonth()
    const pad = (n: number) => String(n).padStart(2, '0')
    const monthFrom = `${now.year}-${pad(now.month)}-01`
    const lastDay = new Date(now.year, now.month, 0).getDate()
    const monthTo = `${now.year}-${pad(now.month)}-${pad(lastDay)}`

    // 6 meses para la tendencia
    const trendFrom = format(subMonths(new Date(), 5), 'yyyy-MM-01')

    const [txRes, debtRes, goalsRes, budgetRes, trendRes] = await Promise.all([
      // Transacciones del mes actual
      supabase.from('transactions').select('*')
        .eq('user_id', user.id)
        .gte('date', monthFrom).lte('date', monthTo),
      // Deudas activas
      supabase.from('debts').select('*')
        .eq('user_id', user.id)
        .neq('status', 'paid'),
      // Metas activas
      supabase.from('savings_goals').select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('current_amount', { ascending: false })
        .limit(3),
      // Presupuesto del mes
      supabase.from('budgets').select('*')
        .eq('user_id', user.id)
        .eq('month', now.month)
        .eq('year', now.year),
      // Transacciones últimos 6 meses para tendencia
      supabase.from('transactions').select('amount, type, date')
        .eq('user_id', user.id)
        .gte('date', trendFrom),
    ])

    const transactions = (txRes.data ?? []) as Transaction[]
    const debts = (debtRes.data ?? []) as Debt[]
    const goals = (goalsRes.data ?? []) as SavingsGoal[]
    const budgets = (budgetRes.data ?? []) as Budget[]
    const trendTx = (trendRes.data ?? []) as Pick<Transaction, 'amount' | 'type' | 'date'>[]

    // Totales del mes
    const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const balance = totalIncome - totalExpense

    // Desglose por categoría (solo gastos)
    const catMap: Record<string, number> = {}
    for (const t of transactions.filter((t) => t.type === 'expense')) {
      catMap[t.category] = (catMap[t.category] ?? 0) + t.amount
    }
    const categoryBreakdown: CategoryBreakdown[] = Object.entries(catMap)
      .map(([category, amount]) => ({ category, amount, percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0 }))
      .sort((a, b) => b.amount - a.amount)

    // Tendencia mensual (últimos 6 meses)
    const monthlyMap: Record<string, { income: number; expense: number }> = {}
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(new Date(), i)
      const key = format(d, 'yyyy-MM')
      monthlyMap[key] = { income: 0, expense: 0 }
    }
    for (const t of trendTx) {
      const key = t.date.slice(0, 7)
      if (monthlyMap[key]) {
        if (t.type === 'income') monthlyMap[key].income += t.amount
        else monthlyMap[key].expense += t.amount
      }
    }
    const monthlyTrend: MonthlyTrend[] = Object.entries(monthlyMap).map(([key, val]) => ({
      month: format(new Date(key + '-15'), 'MMM', { locale: es }),
      income: val.income,
      expense: val.expense,
    }))

    // Deudas próximas (próximos 7 días o vencidas)
    const upcomingDebts = debts.filter(
      (d) => d.due_date && (isOverdue(d.due_date) || isDueSoon(d.due_date, 7)),
    ).slice(0, 5)

    // Presupuesto: % total usado
    const totalBudgeted = budgets.reduce((s, b) => s + b.amount, 0)
    const budgetUsagePct = totalBudgeted > 0 ? Math.round((totalExpense / totalBudgeted) * 100) : 0

    // Deuda total activa
    const totalDebt = debts.reduce((s, d) => s + (d.total_amount - d.paid_amount), 0)

    // Score financiero
    const score = calcFinancialScore({
      balance,
      totalIncome,
      totalDebt,
      activeGoals: goals.length,
      budgetUsagePercent: budgetUsagePct,
    })

    setData({
      totalIncome, totalExpense, balance,
      categoryBreakdown, monthlyTrend,
      upcomingDebts, activeGoals: goals,
      score, totalDebt, budgetUsagePct,
    })
    setLoading(false)
  }, [user])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, refresh: fetch }
}
