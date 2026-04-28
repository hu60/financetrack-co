import { useState } from 'react'
import { ChevronDown, ChevronUp, Pencil, Trash2, CheckCircle, Plus } from 'lucide-react'
import { formatCOP, formatDateShort, isOverdue, isDueSoon, daysUntilDue, pct } from '@/lib/utils'
import type { Debt, DebtPayment } from '@/types'
import { cn } from '@/lib/utils'

interface DebtCardProps {
  debt: Debt
  payments: DebtPayment[]
  paymentsLoading: boolean
  onPaymentsOpen: (id: string) => void
  onAddPayment: (debt: Debt) => void
  onEdit: (debt: Debt) => void
  onDelete: (id: string) => void
  onMarkPaid: (id: string) => void
}

export default function DebtCard({
  debt,
  payments,
  paymentsLoading,
  onPaymentsOpen,
  onAddPayment,
  onEdit,
  onDelete,
  onMarkPaid,
}: DebtCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const remaining = debt.total_amount - debt.paid_amount
  const progress = pct(debt.paid_amount, debt.total_amount)
  const overdue = debt.due_date ? isOverdue(debt.due_date) : false
  const dueSoon = debt.due_date ? isDueSoon(debt.due_date) : false
  const days = debt.due_date ? daysUntilDue(debt.due_date) : null
  const isPaid = debt.status === 'paid'

  // Semáforo
  const statusColor = isPaid
    ? '#27AE60'
    : overdue
      ? '#E74C3C'
      : dueSoon
        ? '#F39C12'
        : '#1E3A5F'

  const statusBg = isPaid
    ? '#EAFAF1'
    : overdue
      ? '#FEF0EE'
      : dueSoon
        ? '#FEF9EE'
        : '#EEF2F8'

  const statusLabel = isPaid
    ? 'Pagada'
    : overdue
      ? `Vencida hace ${Math.abs(days ?? 0)} días`
      : dueSoon
        ? `Vence en ${days} días`
        : debt.due_date
          ? `${days} días restantes`
          : 'Sin fecha límite'

  function handleToggleHistory() {
    if (!expanded) onPaymentsOpen(debt.id)
    setExpanded(!expanded)
  }

  function handleDelete() {
    if (confirmDelete) { onDelete(debt.id) }
    else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000) }
  }

  return (
    <div className={cn('bg-white rounded-2xl border overflow-hidden transition-all', isPaid ? 'border-[#27AE60]/30 opacity-75' : 'border-[#E2E8F0]')}>
      {/* Barra de color superior */}
      <div className="h-1 w-full" style={{ backgroundColor: statusColor }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-[#1A202C] truncate">{debt.creditor_name}</h3>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                style={{ backgroundColor: statusBg, color: statusColor }}
              >
                {statusLabel}
              </span>
            </div>
            {debt.notes && (
              <p className="text-xs text-[#718096] mt-0.5 truncate">{debt.notes}</p>
            )}
          </div>

          {/* Acciones */}
          {!isPaid && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => onAddPayment(debt)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1E3A5F]/10 text-[#1E3A5F] hover:bg-[#1E3A5F]/20 transition"
                title="Registrar abono"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button onClick={() => onEdit(debt)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F8FAFC] text-[#A0AEC0] hover:text-[#1E3A5F] transition">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleDelete} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#A0AEC0] hover:text-[#E74C3C] transition">
                {confirmDelete ? <span className="text-[10px] font-bold text-[#E74C3C]">¿Sí?</span> : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Montos */}
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-xs text-[#718096]">Pendiente</p>
            <p className="text-xl font-bold text-[#1A202C]">{formatCOP(remaining)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#718096]">Total</p>
            <p className="text-sm font-medium text-[#718096]">{formatCOP(debt.total_amount)}</p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-[#718096] mb-1">
            <span>Pagado: {formatCOP(debt.paid_amount)}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-[#F0F4F8] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: statusColor }}
            />
          </div>
        </div>

        {/* Tasa de interés */}
        {debt.interest_rate && (
          <p className="text-xs text-[#A0AEC0] mb-3">Tasa: {debt.interest_rate}% anual</p>
        )}

        {/* Footer — historial + marcar pagada */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#F0F4F8]">
          <button
            onClick={handleToggleHistory}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-[#718096] hover:text-[#1E3A5F] py-1 transition"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            Historial de pagos
          </button>

          {!isPaid && (
            <button
              onClick={() => onMarkPaid(debt.id)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#27AE60] hover:underline py-1 transition"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Marcar pagada
            </button>
          )}
        </div>

        {/* Historial expandible */}
        {expanded && (
          <div className="mt-3 space-y-2 animate-fade-in">
            {paymentsLoading ? (
              <div className="text-xs text-[#A0AEC0] text-center py-2">Cargando...</div>
            ) : payments.length === 0 ? (
              <p className="text-xs text-[#A0AEC0] text-center py-2">Sin abonos registrados</p>
            ) : (
              payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between bg-[#F8FAFC] rounded-xl px-3 py-2">
                  <div>
                    <p className="text-xs font-medium text-[#1A202C]">{formatCOP(p.amount)}</p>
                    {p.note && <p className="text-xs text-[#718096]">{p.note}</p>}
                  </div>
                  <p className="text-xs text-[#A0AEC0]">{formatDateShort(p.payment_date)}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
