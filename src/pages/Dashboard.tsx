import { useState } from 'react'
import { TrendingUp, TrendingDown, CreditCard } from 'lucide-react'
import { useDashboard } from '@/hooks/useDashboard'
import { useAuthStore } from '@/stores/useAuthStore'
import { useTransactions } from '@/hooks/useTransactions'
import { formatCOP, getCurrentMonth } from '@/lib/utils'
import Modal from '@/components/ui/Modal'
import TransactionForm from '@/components/ui/TransactionForm'
import FAB from '@/components/layout/FAB'
import FinancialScoreCard from '@/components/ui/FinancialScoreCard'
import UpcomingDebtsWidget from '@/components/ui/UpcomingDebtsWidget'
import GoalsMiniWidget from '@/components/ui/GoalsMiniWidget'
import ExpenseDonut from '@/components/charts/ExpenseDonut'
import MonthlyTrendChart from '@/components/charts/MonthlyTrendChart'
import { SkeletonSummaryCard } from '@/components/ui/SkeletonCard'

const MONTHS = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]

export default function Dashboard() {
  const { user } = useAuthStore()
  const now = getCurrentMonth()
  const [showForm, setShowForm] = useState(false)

  const { data, loading } = useDashboard()
  const { create } = useTransactions({ month: now.month, year: now.year })

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'Usuario'
  const monthLabel = MONTHS[now.month - 1]

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      {/* Saludo */}
      <div className="animate-fade-in">
        <p className="text-sm text-[#718096]">Hola, {firstName} 👋</p>
        <h1 className="text-2xl font-bold text-[#1E3A5F]">Resumen de {monthLabel}</h1>
      </div>

      {/* Cards métricas */}
      {loading || !data ? (
        <div className="space-y-3">
          <SkeletonSummaryCard />
          <div className="grid grid-cols-3 gap-3">
            <SkeletonSummaryCard />
            <SkeletonSummaryCard />
            <SkeletonSummaryCard />
          </div>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-in">
          {/* Balance principal */}
          <div className="bg-[#1E3A5F] rounded-2xl p-5 text-white">
            <p className="text-sm text-white/60 mb-1">Balance del mes</p>
            <p className={`text-4xl font-bold ${data.balance < 0 ? 'text-[#E74C3C]' : 'text-white'}`}>
              {data.balance < 0 ? '-' : ''}{formatCOP(Math.abs(data.balance))}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <div className="w-2 h-2 rounded-full bg-[#F5A623]" />
              <span className="text-xs text-white/50">
                {data.budgetUsagePct}% del presupuesto usado este mes
              </span>
            </div>
          </div>

          {/* Ingresos / Gastos / Deuda */}
          <div className="grid grid-cols-3 gap-3">
            <MetricCard label="Ingresos" amount={data.totalIncome} color="#27AE60" bg="#EAFAF1" icon={<TrendingUp className="w-4 h-4" />} />
            <MetricCard label="Gastos" amount={data.totalExpense} color="#E74C3C" bg="#FEF0EE" icon={<TrendingDown className="w-4 h-4" />} />
            <MetricCard label="Deuda" amount={data.totalDebt} color="#F39C12" bg="#FEF9EE" icon={<CreditCard className="w-4 h-4" />} />
          </div>

          {/* Score financiero */}
          <FinancialScoreCard score={data.score} />

          {/* Gráfica dona */}
          {data.categoryBreakdown.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
              <p className="text-sm font-semibold text-[#1A202C] mb-1">Gastos por categoría</p>
              <p className="text-xs text-[#A0AEC0] mb-3">{monthLabel} {now.year}</p>
              <ExpenseDonut data={data.categoryBreakdown} />
            </div>
          )}

          {/* Gráfica tendencia */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
            <p className="text-sm font-semibold text-[#1A202C] mb-1">Tendencia mensual</p>
            <p className="text-xs text-[#A0AEC0] mb-3">Últimos 6 meses</p>
            <MonthlyTrendChart data={data.monthlyTrend} />
          </div>

          {/* Widgets */}
          <UpcomingDebtsWidget debts={data.upcomingDebts} />
          <GoalsMiniWidget goals={data.activeGoals} />

          {/* Balance visual ingresos vs gastos */}
          {(data.totalIncome > 0 || data.totalExpense > 0) && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
              <p className="text-sm font-semibold text-[#1A202C] mb-3">Balance del mes</p>
              <div className="space-y-2">
                <BalanceBar label="Ingresos" amount={data.totalIncome} color="#27AE60" max={Math.max(data.totalIncome, data.totalExpense)} />
                <BalanceBar label="Gastos" amount={data.totalExpense} color="#E74C3C" max={Math.max(data.totalIncome, data.totalExpense)} />
              </div>
              <div className="mt-3 pt-3 border-t border-[#F0F4F8] flex justify-between text-sm">
                <span className="text-[#718096]">Ahorro del mes</span>
                <span className="font-bold" style={{ color: data.balance >= 0 ? '#27AE60' : '#E74C3C' }}>
                  {data.balance < 0 ? '-' : '+'}{formatCOP(Math.abs(data.balance))}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FAB */}
      <FAB onClick={() => setShowForm(true)} />

      {/* Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nuevo movimiento">
        <TransactionForm onSubmit={create} onClose={() => setShowForm(false)} />
      </Modal>
    </div>
  )
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string
  amount: number
  color: string
  bg: string
  icon: React.ReactNode
}

function MetricCard({ label, amount, color, bg, icon }: MetricCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-3">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2 flex-shrink-0" style={{ backgroundColor: bg, color }}>
        {icon}
      </div>
      <p className="text-xs text-[#718096] mb-0.5">{label}</p>
      <p className="text-sm font-bold leading-tight" style={{ color }}>
        {formatCOP(amount)}
      </p>
    </div>
  )
}

interface BalanceBarProps {
  label: string
  amount: number
  color: string
  max: number
}

function BalanceBar({ label, amount, color, max }: BalanceBarProps) {
  const pct = max > 0 ? Math.round((amount / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#718096] w-16 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2.5 bg-[#F0F4F8] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-semibold w-20 text-right flex-shrink-0" style={{ color }}>
        {formatCOP(amount)}
      </span>
    </div>
  )
}
