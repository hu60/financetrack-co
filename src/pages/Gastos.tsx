import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, X, TrendingUp, TrendingDown, Scale } from 'lucide-react'
import { useTransactions } from '@/hooks/useTransactions'
import { formatCOP, getCurrentMonth } from '@/lib/utils'
import { CATEGORIES, INCOME_CATEGORIES } from '@/types'
import type { Transaction } from '@/types'
import Modal from '@/components/ui/Modal'
import TransactionForm from '@/components/ui/TransactionForm'
import TransactionItem from '@/components/ui/TransactionItem'
import FAB from '@/components/layout/FAB'
import { SkeletonSummaryCard, SkeletonTransactionItem } from '@/components/ui/SkeletonCard'

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export default function Gastos() {
  const now = getCurrentMonth()

  // Filtros
  const [month, setMonth] = useState(now.month)
  const [year, setYear] = useState(now.year)
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Modal
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)

  const { transactions, loading, create, update, remove, totalIncome, totalExpense, balance } =
    useTransactions({ month, year, type: typeFilter, category: categoryFilter || undefined, search: search || undefined })

  const allCategories = useMemo(
    () => [...CATEGORIES, ...INCOME_CATEGORIES],
    [],
  )

  function openCreate() { setEditing(null); setShowForm(true) }
  function openEdit(t: Transaction) { setEditing(t); setShowForm(true) }
  function closeForm() { setShowForm(false); setEditing(null) }

  async function handleSubmit(data: Parameters<typeof create>[0]) {
    if (editing) return update(editing.id, data)
    return create(data)
  }

  const hasActiveFilters = typeFilter !== 'all' || categoryFilter !== '' || search !== ''

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-[#1E3A5F]">Movimientos</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white text-sm font-medium text-[#718096] hover:border-[#1E3A5F] hover:text-[#1E3A5F] transition"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
          {hasActiveFilters && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#F5A623] rounded-full text-[10px] text-white font-bold flex items-center justify-center">
              !
            </span>
          )}
        </button>
      </div>

      {/* Selector mes/año */}
      <div className="flex gap-2 mb-4">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="flex-1 min-h-[40px] px-3 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] transition"
        >
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="w-24 min-h-[40px] px-3 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] transition"
        >
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Filtros expandibles */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 mb-4 space-y-3 animate-fade-in">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por descripción..."
              className="w-full min-h-[40px] pl-9 pr-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] transition"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0AEC0] hover:text-[#718096]">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Tipo */}
          <div className="flex gap-2">
            {(['all', 'expense', 'income'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition ${
                  typeFilter === t
                    ? t === 'expense'
                      ? 'bg-[#E74C3C] text-white border-[#E74C3C]'
                      : t === 'income'
                        ? 'bg-[#27AE60] text-white border-[#27AE60]'
                        : 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                    : 'bg-white text-[#718096] border-[#E2E8F0]'
                }`}
              >
                {t === 'all' ? 'Todos' : t === 'expense' ? 'Gastos' : 'Ingresos'}
              </button>
            ))}
          </div>

          {/* Categoría */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full min-h-[40px] px-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] transition"
          >
            <option value="">Todas las categorías</option>
            {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Limpiar filtros */}
          {hasActiveFilters && (
            <button
              onClick={() => { setTypeFilter('all'); setCategoryFilter(''); setSearch('') }}
              className="w-full py-2 text-xs font-medium text-[#E74C3C] hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Cards resumen */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {loading ? (
          <>
            <SkeletonSummaryCard />
            <SkeletonSummaryCard />
            <SkeletonSummaryCard />
          </>
        ) : (
          <>
            <SummaryCard
              label="Ingresos"
              amount={totalIncome}
              color="#27AE60"
              bg="#EAFAF1"
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <SummaryCard
              label="Gastos"
              amount={totalExpense}
              color="#E74C3C"
              bg="#FEF0EE"
              icon={<TrendingDown className="w-4 h-4" />}
            />
            <SummaryCard
              label="Balance"
              amount={balance}
              color={balance >= 0 ? '#27AE60' : '#E74C3C'}
              bg={balance >= 0 ? '#EAFAF1' : '#FEF0EE'}
              icon={<Scale className="w-4 h-4" />}
            />
          </>
        )}
      </div>

      {/* Lista de transacciones */}
      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonTransactionItem key={i} />)
        ) : transactions.length === 0 ? (
          <div className="text-center py-14">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-[#718096] font-medium">Sin movimientos</p>
            <p className="text-sm text-[#A0AEC0] mt-1">
              {hasActiveFilters ? 'Prueba con otros filtros' : 'Toca el botón + para registrar uno'}
            </p>
          </div>
        ) : (
          transactions.map((t) => (
            <TransactionItem
              key={t.id}
              transaction={t}
              onDelete={remove}
              onEdit={openEdit}
            />
          ))
        )}
      </div>

      {/* FAB */}
      <FAB onClick={openCreate} />

      {/* Modal formulario */}
      <Modal
        open={showForm}
        onClose={closeForm}
        title={editing ? 'Editar movimiento' : 'Nuevo movimiento'}
      >
        <TransactionForm
          onSubmit={handleSubmit}
          onClose={closeForm}
          initial={editing ?? undefined}
        />
      </Modal>
    </div>
  )
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

interface SummaryCardProps {
  label: string
  amount: number
  color: string
  bg: string
  icon: React.ReactNode
}

function SummaryCard({ label, amount, color, bg, icon }: SummaryCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: bg, color }}>
          {icon}
        </div>
        <span className="text-xs text-[#718096] font-medium">{label}</span>
      </div>
      <p className="text-sm font-bold leading-tight" style={{ color }}>
        {amount < 0 ? '-' : ''}{formatCOP(Math.abs(amount))}
      </p>
    </div>
  )
}
