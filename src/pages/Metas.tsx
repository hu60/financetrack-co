import { useState } from 'react'
import { Plus, Target } from 'lucide-react'
import { useSavingsGoals, useGoalContributions } from '@/hooks/useSavingsGoals'
import { formatCOP, pct } from '@/lib/utils'
import type { SavingsGoal, SavingsContribution } from '@/types'
import Modal from '@/components/ui/Modal'
import GoalForm from '@/components/ui/GoalForm'
import GoalCard from '@/components/ui/GoalCard'
import ContributionForm from '@/components/ui/ContributionForm'
import { SkeletonTransactionItem } from '@/components/ui/SkeletonCard'

export default function Metas() {
  const {
    loading,
    activeGoals,
    pausedGoals,
    completedGoals,
    totalSaved,
    totalTarget,
    createGoal,
    updateGoal,
    deleteGoal,
    togglePause,
    refresh: refreshGoals,
  } = useSavingsGoals()

  const [showGoalForm, setShowGoalForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)
  const [contributingGoal, setContributingGoal] = useState<SavingsGoal | null>(null)
  const [openHistoryId, setOpenHistoryId] = useState<string | null>(null)
  const [showCompleted, setShowCompleted] = useState(false)
  const [showPaused, setShowPaused] = useState(false)

  const { contributions, loading: contribLoading, addContribution } =
    useGoalContributions(openHistoryId)

  const contribMap: Record<string, SavingsContribution[]> = openHistoryId
    ? { [openHistoryId]: contributions }
    : {}

  function openCreate() { setEditingGoal(null); setShowGoalForm(true) }
  function openEdit(goal: SavingsGoal) { setEditingGoal(goal); setShowGoalForm(true) }
  function closeGoalForm() { setShowGoalForm(false); setEditingGoal(null) }

  async function handleGoalSubmit(data: Parameters<typeof createGoal>[0]) {
    if (editingGoal) return updateGoal(editingGoal.id, data)
    return createGoal(data)
  }

  async function handleContributionSubmit(data: Parameters<typeof addContribution>[0]) {
    const ok = await addContribution(data)
    if (ok) await refreshGoals()
    return ok
  }

  const overallPct = totalTarget > 0 ? pct(totalSaved, totalTarget) : 0

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-[#1E3A5F]">Metas de ahorro</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white text-sm font-semibold rounded-xl hover:bg-[#2A4F80] active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          Nueva meta
        </button>
      </div>

      {/* Card resumen general */}
      {!loading && (activeGoals.length > 0 || completedGoals.length > 0) && (
        <div className="bg-[#1E3A5F] rounded-2xl p-5 mb-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-5 h-5 text-[#F5A623]" />
            <span className="text-sm text-white/70">Progreso general</span>
          </div>
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-3xl font-bold">{formatCOP(totalSaved)}</p>
              <p className="text-xs text-white/50 mt-0.5">de {formatCOP(totalTarget)}</p>
            </div>
            <p className="text-2xl font-bold text-[#F5A623]">{overallPct}%</p>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#F5A623] rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, overallPct)}%` }}
            />
          </div>
          <div className="flex gap-4 mt-3 text-xs text-white/60">
            <span>{activeGoals.length} activa{activeGoals.length !== 1 ? 's' : ''}</span>
            {completedGoals.length > 0 && <span className="text-[#27AE60]">✓ {completedGoals.length} completada{completedGoals.length !== 1 ? 's' : ''}</span>}
            {pausedGoals.length > 0 && <span>{pausedGoals.length} pausada{pausedGoals.length !== 1 ? 's' : ''}</span>}
          </div>
        </div>
      )}

      {/* Lista de metas activas */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonTransactionItem key={i} />)}
        </div>
      ) : activeGoals.length === 0 && completedGoals.length === 0 && pausedGoals.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-[#718096] font-medium">Sin metas de ahorro</p>
          <p className="text-sm text-[#A0AEC0] mt-1">Toca "Nueva meta" para empezar a ahorrar</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {activeGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                contributions={contribMap[goal.id] ?? []}
                contributionsLoading={contribLoading && openHistoryId === goal.id}
                onContributionsOpen={setOpenHistoryId}
                onAddContribution={setContributingGoal}
                onEdit={openEdit}
                onDelete={deleteGoal}
                onTogglePause={togglePause}
              />
            ))}
          </div>

          {/* Metas pausadas */}
          {pausedGoals.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowPaused(!showPaused)}
                className="flex items-center gap-2 text-sm font-medium text-[#718096] hover:text-[#1E3A5F] transition mb-3"
              >
                ⏸ {showPaused ? 'Ocultar' : 'Ver'} {pausedGoals.length} meta{pausedGoals.length !== 1 ? 's' : ''} pausada{pausedGoals.length !== 1 ? 's' : ''}
              </button>
              {showPaused && (
                <div className="space-y-3 animate-fade-in">
                  {pausedGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      contributions={contribMap[goal.id] ?? []}
                      contributionsLoading={contribLoading && openHistoryId === goal.id}
                      onContributionsOpen={setOpenHistoryId}
                      onAddContribution={setContributingGoal}
                      onEdit={openEdit}
                      onDelete={deleteGoal}
                      onTogglePause={togglePause}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Metas completadas */}
          {completedGoals.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-2 text-sm font-medium text-[#718096] hover:text-[#1E3A5F] transition mb-3"
              >
                🎉 {showCompleted ? 'Ocultar' : 'Ver'} {completedGoals.length} meta{completedGoals.length !== 1 ? 's' : ''} completada{completedGoals.length !== 1 ? 's' : ''}
              </button>
              {showCompleted && (
                <div className="space-y-3 animate-fade-in">
                  {completedGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      contributions={contribMap[goal.id] ?? []}
                      contributionsLoading={contribLoading && openHistoryId === goal.id}
                      onContributionsOpen={setOpenHistoryId}
                      onAddContribution={setContributingGoal}
                      onEdit={openEdit}
                      onDelete={deleteGoal}
                      onTogglePause={togglePause}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal meta */}
      <Modal open={showGoalForm} onClose={closeGoalForm} title={editingGoal ? 'Editar meta' : 'Nueva meta'}>
        <GoalForm onSubmit={handleGoalSubmit} onClose={closeGoalForm} initial={editingGoal ?? undefined} />
      </Modal>

      {/* Modal aporte */}
      <Modal open={!!contributingGoal} onClose={() => setContributingGoal(null)} title="Registrar aporte">
        {contributingGoal && (
          <ContributionForm
            goal={contributingGoal}
            onSubmit={handleContributionSubmit}
            onClose={() => setContributingGoal(null)}
          />
        )}
      </Modal>
    </div>
  )
}
