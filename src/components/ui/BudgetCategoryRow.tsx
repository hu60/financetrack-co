import { useState, useEffect } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { formatCOP, pct } from '@/lib/utils'
import { CATEGORY_ICONS } from '@/lib/categoryIcons'

interface BudgetCategoryRowProps {
  category: string
  budgeted: number
  spent: number
  onSave: (amount: number) => Promise<boolean>
  onDelete: () => void
  isNew?: boolean
  onCancelNew?: () => void
}

export default function BudgetCategoryRow({
  category,
  budgeted,
  spent,
  onSave,
  onDelete,
  isNew,
  onCancelNew,
}: BudgetCategoryRowProps) {
  const [editing, setEditing] = useState(isNew ?? false)
  const [value, setValue] = useState(isNew ? '' : String(budgeted))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isNew) setValue(String(budgeted))
  }, [budgeted, isNew])

  const usage = pct(spent, budgeted)
  const remaining = budgeted - spent
  const isOver = usage >= 100
  const isWarning = usage >= 80 && usage < 100

  const barColor = isOver ? '#E74C3C' : isWarning ? '#F39C12' : '#27AE60'
  const icon = CATEGORY_ICONS[category] ?? '📦'

  async function handleSave() {
    const amount = Number(value)
    if (!amount || amount <= 0) return
    setSaving(true)
    const ok = await onSave(amount)
    setSaving(false)
    if (ok) {
      setEditing(false)
      if (isNew) onCancelNew?.()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') {
      setEditing(false)
      setValue(String(budgeted))
      if (isNew) onCancelNew?.()
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
      {/* Header fila */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xl flex-shrink-0">{icon}</span>
        <span className="flex-1 font-medium text-[#1A202C] text-sm">{category}</span>

        {editing ? (
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#718096] text-sm font-semibold">$</span>
              <input
                type="number"
                inputMode="numeric"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                placeholder="0"
                className="w-32 h-9 pl-6 pr-2 rounded-xl border border-[#1E3A5F] bg-[#F8FAFC] text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#27AE60] text-white hover:bg-green-600 transition disabled:opacity-60"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setEditing(false); setValue(String(budgeted)); if (isNew) onCancelNew?.() }}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#718096] hover:text-[#E74C3C] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditing(true)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F8FAFC] text-[#A0AEC0] hover:text-[#1E3A5F] transition"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#A0AEC0] hover:text-[#E74C3C] transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Montos */}
      {!isNew && (
        <>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-[#718096]">
              Gastado: <span className="font-semibold" style={{ color: isOver ? '#E74C3C' : '#1A202C' }}>{formatCOP(spent)}</span>
            </span>
            <span className="text-[#718096]">
              {remaining >= 0 ? (
                <>Disponible: <span className="font-semibold text-[#27AE60]">{formatCOP(remaining)}</span></>
              ) : (
                <>Excedido: <span className="font-semibold text-[#E74C3C]">{formatCOP(Math.abs(remaining))}</span></>
              )}
            </span>
          </div>

          {/* Barra de progreso */}
          <div className="h-2 bg-[#F0F4F8] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, usage)}%`, backgroundColor: barColor }}
            />
          </div>

          {/* Alertas */}
          {isOver && (
            <p className="text-xs font-medium text-[#E74C3C] mt-2">
              ⚠️ Superaste el presupuesto en {formatCOP(Math.abs(remaining))}
            </p>
          )}
          {isWarning && (
            <p className="text-xs font-medium text-[#F39C12] mt-2">
              🟡 Usaste el {usage}% — quedan {formatCOP(remaining)}
            </p>
          )}

          {/* % y presupuestado */}
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs font-bold" style={{ color: barColor }}>{usage}% usado</span>
            <span className="text-xs text-[#A0AEC0]">de {formatCOP(budgeted)}</span>
          </div>
        </>
      )}
    </div>
  )
}
