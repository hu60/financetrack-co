import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/useAuthStore'
import type { Budget, BudgetInsert, Transaction } from '@/types'
import { getCurrentMonth } from '@/lib/utils'
import toast from 'react-hot-toast'

export function useBudget(month?: number, year?: number) {
  const { user } = useAuthStore()
  const now = getCurrentMonth()
  const m = month ?? now.month
  const y = year ?? now.year

  const [budgets, setBudgets] = useState<Budget[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const pad = (n: number) => String(n).padStart(2, '0')
    const from = `${y}-${pad(m)}-01`
    const lastDay = new Date(y, m, 0).getDate()
    const to = `${y}-${pad(m)}-${pad(lastDay)}`

    const [budgetRes, txRes] = await Promise.all([
      supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', m)
        .eq('year', y),
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .gte('date', from)
        .lte('date', to),
    ])

    if (budgetRes.error) toast.error('Error al cargar presupuesto')
    else setBudgets(budgetRes.data as Budget[])

    if (!txRes.error) setTransactions(txRes.data as Transaction[])
    setLoading(false)
  }, [user, m, y])

  useEffect(() => { fetch() }, [fetch])

  async function upsertBudget(payload: BudgetInsert): Promise<boolean> {
    if (!user) return false
    const existing = budgets.find(
      (b) => b.category === payload.category && b.month === payload.month && b.year === payload.year,
    )

    let error
    if (existing) {
      ;({ error } = await supabase
        .from('budgets')
        .update({ amount: payload.amount })
        .eq('id', existing.id))
    } else {
      ;({ error } = await supabase
        .from('budgets')
        .insert({ ...payload, user_id: user.id }))
    }

    if (error) { toast.error('Error al guardar'); return false }
    await fetch()
    return true
  }

  async function deleteBudget(id: string): Promise<boolean> {
    const { error } = await supabase.from('budgets').delete().eq('id', id)
    if (error) { toast.error('Error al eliminar'); return false }
    toast.success('Presupuesto eliminado')
    await fetch()
    return true
  }

  async function copyPreviousMonth(): Promise<boolean> {
    if (!user) return false
    const prevMonth = m === 1 ? 12 : m - 1
    const prevYear = m === 1 ? y - 1 : y

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', prevMonth)
      .eq('year', prevYear)

    if (error || !data || data.length === 0) {
      toast.error('No hay presupuesto el mes anterior')
      return false
    }

    // Insertar solo categorías que no existan este mes
    const existingCategories = budgets.map((b) => b.category)
    const toInsert = (data as Budget[])
      .filter((b) => !existingCategories.includes(b.category))
      .map(({ category, amount }) => ({ category, amount, month: m, year: y, user_id: user.id }))

    if (toInsert.length === 0) {
      toast('El mes ya tiene presupuesto para esas categorías', { icon: 'ℹ️' })
      return false
    }

    const { error: insertError } = await supabase.from('budgets').insert(toInsert)
    if (insertError) { toast.error('Error al copiar'); return false }

    toast.success(`${toInsert.length} categorías copiadas`)
    await fetch()
    return true
  }

  // Gasto real por categoría
  const spentByCategory: Record<string, number> = {}
  for (const tx of transactions) {
    spentByCategory[tx.category] = (spentByCategory[tx.category] ?? 0) + tx.amount
  }

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0)
  const totalAvailable = totalBudgeted - totalSpent
  const overallPct = totalBudgeted > 0 ? Math.min(100, Math.round((totalSpent / totalBudgeted) * 100)) : 0

  return {
    budgets,
    transactions,
    loading,
    spentByCategory,
    totalBudgeted,
    totalSpent,
    totalAvailable,
    overallPct,
    upsertBudget,
    deleteBudget,
    copyPreviousMonth,
    refresh: fetch,
  }
}
