import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import { formatCOP, formatDateShort, isOverdue, daysUntilDue } from '@/lib/utils'
import type { Debt } from '@/types'

interface UpcomingDebtsWidgetProps {
  debts: Debt[]
}

export default function UpcomingDebtsWidget({ debts }: UpcomingDebtsWidgetProps) {
  const navigate = useNavigate()

  if (debts.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0F4F8]">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#F39C12]" />
          <p className="text-sm font-semibold text-[#1A202C]">Próximas a vencer</p>
        </div>
        <button
          onClick={() => navigate('/deudas')}
          className="text-xs text-[#1E3A5F] font-medium flex items-center gap-0.5 hover:underline"
        >
          Ver todas <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="divide-y divide-[#F0F4F8]">
        {debts.map((debt) => {
          const overdue = isOverdue(debt.due_date!)
          const days = daysUntilDue(debt.due_date!)
          const remaining = debt.total_amount - debt.paid_amount

          return (
            <div key={debt.id} className="flex items-center justify-between px-4 py-3 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: overdue ? '#E74C3C' : '#F39C12' }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1A202C] truncate">{debt.creditor_name}</p>
                  <p className="text-xs" style={{ color: overdue ? '#E74C3C' : '#F39C12' }}>
                    {overdue
                      ? `Vencida hace ${Math.abs(days)} días`
                      : days === 0
                        ? 'Vence hoy'
                        : `Vence en ${days} días — ${formatDateShort(debt.due_date!)}`}
                  </p>
                </div>
              </div>
              <p className="text-sm font-bold text-[#E74C3C] flex-shrink-0">
                {formatCOP(remaining)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
