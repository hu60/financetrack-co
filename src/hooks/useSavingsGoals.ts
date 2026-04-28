import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/useAuthStore'
import type { SavingsGoal, SavingsGoalInsert, SavingsContribution, SavingsContributionInsert } from '@/types'
import toast from 'react-hot-toast'

export function useSavingsGoals() {
  const { user } = useAuthStore()
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [loading, setLoading] = useState(true)

  const fetchGoals = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) toast.error('Error al cargar metas')
    else setGoals(data as SavingsGoal[])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchGoals() }, [fetchGoals])

  async function createGoal(payload: SavingsGoalInsert): Promise<boolean> {
    if (!user) return false
    const { error } = await supabase.from('savings_goals').insert({
      ...payload,
      user_id: user.id,
      current_amount: payload.current_amount ?? 0,
      emoji: payload.emoji ?? '🎯',
      status: 'active',
    })
    if (error) { toast.error('Error al guardar meta'); return false }
    toast.success('Meta creada')
    await fetchGoals()
    return true
  }

  async function updateGoal(id: string, payload: Partial<SavingsGoalInsert>): Promise<boolean> {
    const { error } = await supabase.from('savings_goals').update(payload).eq('id', id)
    if (error) { toast.error('Error al actualizar'); return false }
    toast.success('Meta actualizada')
    await fetchGoals()
    return true
  }

  async function deleteGoal(id: string): Promise<boolean> {
    const { error } = await supabase.from('savings_goals').delete().eq('id', id)
    if (error) { toast.error('Error al eliminar'); return false }
    toast.success('Meta eliminada')
    await fetchGoals()
    return true
  }

  async function togglePause(goal: SavingsGoal): Promise<boolean> {
    const newStatus = goal.status === 'paused' ? 'active' : 'paused'
    const { error } = await supabase.from('savings_goals').update({ status: newStatus }).eq('id', goal.id)
    if (error) { toast.error('Error'); return false }
    toast.success(newStatus === 'paused' ? 'Meta pausada' : 'Meta reactivada')
    await fetchGoals()
    return true
  }

  const activeGoals = goals.filter((g) => g.status === 'active')
  const pausedGoals = goals.filter((g) => g.status === 'paused')
  const completedGoals = goals.filter((g) => g.status === 'completed')
  const totalSaved = goals.filter((g) => g.status !== 'paused').reduce((s, g) => s + g.current_amount, 0)
  const totalTarget = goals.filter((g) => g.status !== 'paused').reduce((s, g) => s + g.target_amount, 0)

  return { goals, loading, activeGoals, pausedGoals, completedGoals, totalSaved, totalTarget, createGoal, updateGoal, deleteGoal, togglePause, refresh: fetchGoals }
}

export function useGoalContributions(goalId: string | null) {
  const { user } = useAuthStore()
  const [contributions, setContributions] = useState<SavingsContribution[]>([])
  const [loading, setLoading] = useState(false)

  const fetchContributions = useCallback(async () => {
    if (!user || !goalId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('savings_contributions')
      .select('*')
      .eq('goal_id', goalId)
      .order('contribution_date', { ascending: false })

    if (!error) setContributions(data as SavingsContribution[])
    setLoading(false)
  }, [user, goalId])

  useEffect(() => { fetchContributions() }, [fetchContributions])

  async function addContribution(payload: Omit<SavingsContributionInsert, 'goal_id'>): Promise<boolean> {
    if (!user || !goalId) return false
    const { error } = await supabase
      .from('savings_contributions')
      .insert({ ...payload, goal_id: goalId, user_id: user.id })

    if (error) { toast.error('Error al registrar aporte'); return false }
    toast.success('¡Aporte registrado! 💪')
    await fetchContributions()
    return true
  }

  return { contributions, loading, addContribution, refresh: fetchContributions }
}
