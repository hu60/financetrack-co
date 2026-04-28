import { useState, useEffect, useRef } from 'react'
import { ChevronDown, ChevronUp, Pencil, Trash2, Plus, Pause, Play } from 'lucide-react'
import { formatCOP, formatDateShort, projectGoalDate, pct } from '@/lib/utils'
import type { SavingsGoal, SavingsContribution } from '@/types'
import { cn } from '@/lib/utils'

interface GoalCardProps {
  goal: SavingsGoal
  contributions: SavingsContribution[]
  contributionsLoading: boolean
  onContributionsOpen: (id: string) => void
  onAddContribution: (goal: SavingsGoal) => void
  onEdit: (goal: SavingsGoal) => void
  onDelete: (id: string) => void
  onTogglePause: (goal: SavingsGoal) => void
}

// Mini confetti interno (CSS puro)
function Confetti() {
  const colors = ['#F5A623', '#27AE60', '#1E3A5F', '#E74C3C', '#9B59B6']
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-sm opacity-0"
          style={{
            backgroundColor: colors[i % colors.length],
            left: `${Math.random() * 100}%`,
            top: '-8px',
            animation: `confettiFall ${0.8 + Math.random() * 0.8}s ease-in ${Math.random() * 0.5}s forwards`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0%   { opacity: 1; transform: translateY(0) rotate(0deg); }
          100% { opacity: 0; transform: translateY(180px) rotate(720deg); }
        }
      `}</style>
    </div>
  )
}

export default function GoalCard({
  goal,
  contributions,
  contributionsLoading,
  onContributionsOpen,
  onAddContribution,
  onEdit,
  onDelete,
  onTogglePause,
}: GoalCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const prevAmountRef = useRef(goal.current_amount)

  const progress = pct(goal.current_amount, goal.target_amount)
  const remaining = goal.target_amount - goal.current_amount
  const isCompleted = goal.status === 'completed'
  const isPaused = goal.status === 'paused'

  // Lanzar confetti cuando la meta se completa
  useEffect(() => {
    if (isCompleted && prevAmountRef.current < goal.target_amount) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 2500)
    }
    prevAmountRef.current = goal.current_amount
  }, [isCompleted, goal.current_amount, goal.target_amount])

  const projection = projectGoalDate(remaining, contributions)

  const barColor = isCompleted ? '#27AE60' : isPaused ? '#A0AEC0' : '#1E3A5F'

  function handleToggleHistory() {
    if (!expanded) onContributionsOpen(goal.id)
    setExpanded(!expanded)
  }

  function handleDelete() {
    if (confirmDelete) onDelete(goal.id)
    else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000) }
  }

  return (
    <div className={cn(
      'relative bg-white rounded-2xl border overflow-hidden transition-all',
      isCompleted ? 'border-[#27AE60]/40' : isPaused ? 'border-[#E2E8F0] opacity-70' : 'border-[#E2E8F0]',
    )}>
      {showConfetti && <Confetti />}

      {/* Barra superior de color */}
      <div className="h-1 w-full" style={{ backgroundColor: barColor }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <span className="text-3xl flex-shrink-0">{goal.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-[#1A202C]">{goal.name}</h3>
              {isCompleted && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#EAFAF1] text-[#27AE60] font-semibold">
                  ¡Completada! 🎉
                </span>
              )}
              {isPaused && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#F0F4F8] text-[#718096] font-medium">
                  Pausada
                </span>
              )}
            </div>
            {goal.target_date && (
              <p className="text-xs text-[#A0AEC0] mt-0.5">
                Fecha objetivo: {formatDateShort(goal.target_date)}
              </p>
            )}
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {!isCompleted && (
              <button
                onClick={() => onAddContribution(goal)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#27AE60]/10 text-[#27AE60] hover:bg-[#27AE60]/20 transition"
                title="Agregar aporte"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onTogglePause(goal)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F8FAFC] text-[#A0AEC0] hover:text-[#718096] transition"
              title={isPaused ? 'Reactivar' : 'Pausar'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => onEdit(goal)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F8FAFC] text-[#A0AEC0] hover:text-[#1E3A5F] transition">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleDelete} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#A0AEC0] hover:text-[#E74C3C] transition">
              {confirmDelete ? <span className="text-[10px] font-bold text-[#E74C3C]">¿Sí?</span> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Montos */}
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-xs text-[#718096]">Ahorrado</p>
            <p className="text-2xl font-bold text-[#1A202C]">{formatCOP(goal.current_amount)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#718096]">Objetivo</p>
            <p className="text-sm font-semibold text-[#718096]">{formatCOP(goal.target_amount)}</p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mb-2">
          <div className="h-3 bg-[#F0F4F8] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, progress)}%`, backgroundColor: barColor }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="font-bold" style={{ color: barColor }}>{progress}%</span>
            {!isCompleted && <span className="text-[#718096]">Faltan {formatCOP(remaining)}</span>}
          </div>
        </div>

        {/* Proyección */}
        {!isCompleted && !isPaused && projection && contributions.length >= 2 && (
          <p className="text-xs text-[#718096] bg-[#F8FAFC] rounded-lg px-3 py-2 mb-2">
            📈 A este ritmo llegarías a tu meta en <span className="font-semibold text-[#1E3A5F]">{projection}</span>
          </p>
        )}

        {/* Footer historial */}
        <div className="pt-2 border-t border-[#F0F4F8]">
          <button
            onClick={handleToggleHistory}
            className="flex items-center gap-1.5 text-xs font-medium text-[#718096] hover:text-[#1E3A5F] py-1 transition"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            Historial de aportes
          </button>

          {/* Historial expandible */}
          {expanded && (
            <div className="mt-3 space-y-2 animate-fade-in">
              {contributionsLoading ? (
                <p className="text-xs text-[#A0AEC0] text-center py-2">Cargando...</p>
              ) : contributions.length === 0 ? (
                <p className="text-xs text-[#A0AEC0] text-center py-2">Sin aportes registrados</p>
              ) : (
                contributions.map((c) => (
                  <div key={c.id} className="flex items-center justify-between bg-[#F8FAFC] rounded-xl px-3 py-2">
                    <div>
                      <p className="text-xs font-semibold text-[#27AE60]">+{formatCOP(c.amount)}</p>
                      {c.note && <p className="text-xs text-[#718096]">{c.note}</p>}
                    </div>
                    <p className="text-xs text-[#A0AEC0]">{formatDateShort(c.contribution_date)}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
