import { useState, useEffect } from 'react'
import { Copy, Plus, PiggyBank } from 'lucide-react'
import { useBudget } from '@/hooks/useBudget'
import { formatCOP, getCurrentMonth, pct } from '@/lib/utils'
import { CATEGORIES } from '@/types'
import BudgetCategoryRow from '@/components/ui/BudgetCategoryRow'
import { SkeletonTransactionItem } from '@/components/ui/SkeletonCard'
import toast from 'react-hot-toast'

const MONTHS = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]

export default function Presupuesto() {
  const now = getCurrentMonth()
  const [month, setMonth] = useState(now.month)
  const [year, setYear] = useState(now.year)
  const [newCategory, setNewCategory] = useState('')
  const [showAddRow, setShowAddRow] = useState(false)
  const [copying, setCopying] = useState(false)

  const {
    budgets,
    loading,
    spentByCategory,
    totalBudgeted,
    totalSpent,
    totalAvailable,
    overallPct,
    upsertBudget,
    deleteBudget,
    copyPreviousMonth,
  } = useBudget(month, year)

  // Alertas automáticas cuando cambia el presupuesto
  useEffect(() => {
    if (loading || budgets.length === 0) return
    budgets.forEach((b) => {
      const spent = spentByCategory[b.category] ?? 0
      const usage = pct(spent, b.amount)
      if (usage >= 100) {
        toast.error(`⚠️ ${b.category}: superaste el presupuesto`, { id: `over-${b.id}`, duration: 4000 })
      } else if (usage >= 80) {
        toast(`🟡 ${b.category}: usaste el ${usage}%`, { id: `warn-${b.id}`, duration: 3000 })
      }
    })
  // Solo al cargar datos nuevos
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budgets.length, month, year])

  const categoriesInBudget = budgets.map((b) => b.category)
  const availableToAdd = CATEGORIES.filter((c) => !categoriesInBudget.includes(c))

  async function handleCopy() {
    setCopying(true)
    await copyPreviousMonth()
    setCopying(false)
  }

  async function handleSave(category: string, amount: number) {
    return upsertBudget({ category, amount, month, year })
  }

  function handleStartAdd() {
    if (availableToAdd.length === 0) { toast('Ya tienes todas las categorías', { icon: 'ℹ️' }); return }
    setNewCategory(availableToAdd[0])
    setShowAddRow(true)
  }

  const overallColor = overallPct >= 100 ? '#E74C3C' : overallPct >= 80 ? '#F39C12' : '#27AE60'

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-[#1E3A5F]">Presupuesto</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={copying}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white text-sm font-medium text-[#718096] hover:border-[#1E3A5F] hover:text-[#1E3A5F] transition disabled:opacity-60"
            title="Copiar presupuesto del mes anterior"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">{copying ? 'Copiando...' : 'Copiar anterior'}</span>
          </button>
          <button
            onClick={handleStartAdd}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1E3A5F] text-white text-sm font-semibold rounded-xl hover:bg-[#2A4F80] transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Agregar</span>
          </button>
        </div>
      </div>

      {/* Selector mes/año */}
      <div className="flex gap-2 mb-5">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="flex-1 min-h-[40px] px-3 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] transition"
        >
          {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="w-24 min-h-[40px] px-3 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] transition"
        >
          {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Card resumen total */}
      {!loading && budgets.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <PiggyBank className="w-5 h-5 text-[#1E3A5F]" />
            <span className="font-semibold text-[#1A202C]">Resumen {MONTHS[month - 1]}</span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <p className="text-xs text-[#718096] mb-0.5">Presupuestado</p>
              <p className="font-bold text-[#1A202C] text-sm">{formatCOP(totalBudgeted)}</p>
            </div>
            <div>
              <p className="text-xs text-[#718096] mb-0.5">Gastado</p>
              <p className="font-bold text-sm" style={{ color: overallColor }}>{formatCOP(totalSpent)}</p>
            </div>
            <div>
              <p className="text-xs text-[#718096] mb-0.5">{totalAvailable >= 0 ? 'Disponible' : 'Excedido'}</p>
              <p className="font-bold text-sm" style={{ color: totalAvailable >= 0 ? '#27AE60' : '#E74C3C' }}>
                {formatCOP(Math.abs(totalAvailable))}
              </p>
            </div>
          </div>

          {/* Barra global */}
          <div className="h-3 bg-[#F0F4F8] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, overallPct)}%`, backgroundColor: overallColor }}
            />
          </div>
          <p className="text-xs text-right mt-1" style={{ color: overallColor }}>
            {overallPct}% del presupuesto total
          </p>
        </div>
      )}

      {/* Lista categorías */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonTransactionItem key={i} />)}
        </div>
      ) : budgets.length === 0 && !showAddRow ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-[#718096] font-medium">Sin presupuesto para este mes</p>
          <p className="text-sm text-[#A0AEC0] mt-1">
            Toca "Agregar" o "Copiar anterior" para empezar
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Fila para agregar nueva categoría */}
          {showAddRow && (
            <div className="bg-white rounded-2xl border-2 border-dashed border-[#1E3A5F]/30 p-4 animate-fade-in">
              <div className="mb-3">
                <label className="block text-sm font-medium text-[#1A202C] mb-1.5">Categoría</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] transition"
                >
                  {availableToAdd.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <BudgetCategoryRow
                key={`new-${newCategory}`}
                category={newCategory}
                budgeted={0}
                spent={spentByCategory[newCategory] ?? 0}
                onSave={(amount) => handleSave(newCategory, amount)}
                onDelete={() => setShowAddRow(false)}
                isNew
                onCancelNew={() => setShowAddRow(false)}
              />
            </div>
          )}

          {/* Categorías existentes */}
          {budgets
            .sort((a, b) => {
              const usageA = pct(spentByCategory[a.category] ?? 0, a.amount)
              const usageB = pct(spentByCategory[b.category] ?? 0, b.amount)
              return usageB - usageA // Mayor uso primero
            })
            .map((budget) => (
              <BudgetCategoryRow
                key={budget.id}
                category={budget.category}
                budgeted={budget.amount}
                spent={spentByCategory[budget.category] ?? 0}
                onSave={(amount) => handleSave(budget.category, amount)}
                onDelete={() => deleteBudget(budget.id)}
              />
            ))}
        </div>
      )}
    </div>
  )
}
