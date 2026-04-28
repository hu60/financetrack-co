import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/useAuthStore'
import type { Debt, DebtInsert, DebtPayment, DebtPaymentInsert } from '@/types'
import toast from 'react-hot-toast'

export function useDebts() {
  const { user } = useAuthStore()
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDebts = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) toast.error('Error al cargar deudas')
    else setDebts(data as Debt[])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchDebts() }, [fetchDebts])

  async function createDebt(payload: DebtInsert): Promise<boolean> {
    if (!user) return false
    const { error } = await supabase
      .from('debts')
      .insert({ ...payload, user_id: user.id, paid_amount: payload.paid_amount ?? 0, status: 'active' })

    if (error) { toast.error('Error al guardar deuda'); return false }
    toast.success('Deuda registrada')
    await fetchDebts()
    return true
  }

  async function updateDebt(id: string, payload: Partial<DebtInsert>): Promise<boolean> {
    const { error } = await supabase.from('debts').update(payload).eq('id', id)
    if (error) { toast.error('Error al actualizar'); return false }
    toast.success('Deuda actualizada')
    await fetchDebts()
    return true
  }

  async function deleteDebt(id: string): Promise<boolean> {
    const { error } = await supabase.from('debts').delete().eq('id', id)
    if (error) { toast.error('Error al eliminar'); return false }
    toast.success('Deuda eliminada')
    await fetchDebts()
    return true
  }

  async function markAsPaid(id: string): Promise<boolean> {
    const debt = debts.find((d) => d.id === id)
    if (!debt) return false
    const { error } = await supabase
      .from('debts')
      .update({ paid_amount: debt.total_amount, status: 'paid' })
      .eq('id', id)
    if (error) { toast.error('Error'); return false }
    toast.success('¡Deuda pagada! 🎉')
    await fetchDebts()
    return true
  }

  const totalDebt = debts
    .filter((d) => d.status !== 'paid')
    .reduce((sum, d) => sum + (d.total_amount - d.paid_amount), 0)

  const activeDebts = debts.filter((d) => d.status !== 'paid')
  const paidDebts = debts.filter((d) => d.status === 'paid')

  return { debts, loading, activeDebts, paidDebts, totalDebt, createDebt, updateDebt, deleteDebt, markAsPaid, refresh: fetchDebts }
}

export function useDebtPayments(debtId: string | null) {
  const { user } = useAuthStore()
  const [payments, setPayments] = useState<DebtPayment[]>([])
  const [loading, setLoading] = useState(false)

  const fetchPayments = useCallback(async () => {
    if (!user || !debtId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('debt_payments')
      .select('*')
      .eq('debt_id', debtId)
      .order('payment_date', { ascending: false })

    if (!error) setPayments(data as DebtPayment[])
    setLoading(false)
  }, [user, debtId])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  async function addPayment(payload: Omit<DebtPaymentInsert, 'debt_id'>): Promise<boolean> {
    if (!user || !debtId) return false
    const { error } = await supabase
      .from('debt_payments')
      .insert({ ...payload, debt_id: debtId, user_id: user.id })

    if (error) { toast.error('Error al registrar abono'); return false }
    toast.success('Abono registrado')
    await fetchPayments()
    return true
  }

  return { payments, loading, addPayment, refresh: fetchPayments }
}
