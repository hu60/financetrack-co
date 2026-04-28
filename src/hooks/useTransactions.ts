import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/useAuthStore'
import type { Transaction, TransactionInsert } from '@/types'
import toast from 'react-hot-toast'

interface Filters {
  month?: number
  year?: number
  category?: string
  type?: 'income' | 'expense' | 'all'
  search?: string
}

export function useTransactions(filters: Filters = {}) {
  const { user } = useAuthStore()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!user) return
    setLoading(true)

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (filters.month && filters.year) {
      const pad = (n: number) => String(n).padStart(2, '0')
      const from = `${filters.year}-${pad(filters.month)}-01`
      const lastDay = new Date(filters.year, filters.month, 0).getDate()
      const to = `${filters.year}-${pad(filters.month)}-${pad(lastDay)}`
      query = query.gte('date', from).lte('date', to)
    }

    if (filters.type && filters.type !== 'all') {
      query = query.eq('type', filters.type)
    }

    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    if (filters.search) {
      query = query.ilike('description', `%${filters.search}%`)
    }

    const { data, error } = await query
    if (error) {
      toast.error('Error al cargar transacciones')
    } else {
      setTransactions(data as Transaction[])
    }
    setLoading(false)
  }, [user, filters.month, filters.year, filters.category, filters.type, filters.search])

  useEffect(() => { fetch() }, [fetch])

  async function create(payload: TransactionInsert): Promise<boolean> {
    if (!user) return false
    const { error } = await supabase
      .from('transactions')
      .insert({ ...payload, user_id: user.id })

    if (error) {
      toast.error('Error al guardar')
      return false
    }
    toast.success(payload.type === 'income' ? 'Ingreso registrado' : 'Gasto registrado')
    await fetch()
    return true
  }

  async function update(id: string, payload: Partial<TransactionInsert>): Promise<boolean> {
    const { error } = await supabase
      .from('transactions')
      .update(payload)
      .eq('id', id)

    if (error) {
      toast.error('Error al actualizar')
      return false
    }
    toast.success('Actualizado')
    await fetch()
    return true
  }

  async function remove(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Error al eliminar')
      return false
    }
    toast.success('Eliminado')
    await fetch()
    return true
  }

  // Totales del conjunto actual
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense

  return { transactions, loading, create, update, remove, totalIncome, totalExpense, balance, refresh: fetch }
}
