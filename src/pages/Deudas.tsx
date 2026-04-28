import { useState } from 'react'
import { Plus, CreditCard, CheckCircle } from 'lucide-react'
import { useDebts, useDebtPayments } from '@/hooks/useDebts'
import { formatCOP } from '@/lib/utils'
import type { Debt, DebtPayment } from '@/types'
import Modal from '@/components/ui/Modal'
import DebtForm from '@/components/ui/DebtForm'
import DebtCard from '@/components/ui/DebtCard'
import PaymentForm from '@/components/ui/PaymentForm'
import { SkeletonTransactionItem } from '@/components/ui/SkeletonCard'

export default function Deudas() {
  const { debts, loading, activeDebts, paidDebts, totalDebt, createDebt, updateDebt, deleteDebt, markAsPaid, refresh: refreshDebts } = useDebts()

  // Modales
  const [showDebtForm, setShowDebtForm] = useState(false)
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null)
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null)

  // Historial de pagos por deuda (cargado bajo demanda)
  const [openHistoryId, setOpenHistoryId] = useState<string | null>(null)
  const { payments, loading: paymentsLoading, addPayment } = useDebtPayments(openHistoryId)

  // Mapa de pagos por deuda para pasar a cada card
  const paymentsMap: Record<string, DebtPayment[]> = openHistoryId
    ? { [openHistoryId]: payments }
    : {}

  function openCreate() { setEditingDebt(null); setShowDebtForm(true) }
  function openEdit(debt: Debt) { setEditingDebt(debt); setShowDebtForm(true) }
  function closeDebtForm() { setShowDebtForm(false); setEditingDebt(null) }

  async function handleDebtSubmit(data: Parameters<typeof createDebt>[0]) {
    if (editingDebt) return updateDebt(editingDebt.id, data)
    return createDebt(data)
  }

  async function handlePaymentSubmit(data: Parameters<typeof addPayment>[0]) {
    const ok = await addPayment(data)
    if (ok) await refreshDebts()  // refresca paid_amount actualizado por el trigger
    return ok
  }

  const [showPaid, setShowPaid] = useState(false)

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-[#1E3A5F]">Deudas</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white text-sm font-semibold rounded-xl hover:bg-[#2A4F80] active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          Nueva deuda
        </button>
      </div>

      {/* Card resumen total */}
      {!loading && debts.length > 0 && (
        <div className="bg-[#1E3A5F] rounded-2xl p-5 mb-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-5 h-5 text-[#F5A623]" />
            <span className="text-sm text-white/70">Total adeudado</span>
          </div>
          <p className="text-3xl font-bold">{formatCOP(totalDebt)}</p>
          <div className="flex items-center gap-4 mt-3 text-sm text-white/60">
            <span>{activeDebts.length} deuda{activeDebts.length !== 1 ? 's' : ''} activa{activeDebts.length !== 1 ? 's' : ''}</span>
            {paidDebts.length > 0 && (
              <span className="text-[#27AE60]">✓ {paidDebts.length} pagada{paidDebts.length !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      )}

      {/* Lista activas */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonTransactionItem key={i} />)}
        </div>
      ) : activeDebts.length === 0 && paidDebts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-[#718096] font-medium">Sin deudas registradas</p>
          <p className="text-sm text-[#A0AEC0] mt-1">Toca "Nueva deuda" para agregar una</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {activeDebts.map((debt) => (
              <DebtCard
                key={debt.id}
                debt={debt}
                payments={paymentsMap[debt.id] ?? []}
                paymentsLoading={paymentsLoading && openHistoryId === debt.id}
                onPaymentsOpen={setOpenHistoryId}
                onAddPayment={setPayingDebt}
                onEdit={openEdit}
                onDelete={deleteDebt}
                onMarkPaid={markAsPaid}
              />
            ))}
          </div>

          {/* Deudas pagadas */}
          {paidDebts.length > 0 && (
            <>
              <button
                onClick={() => setShowPaid(!showPaid)}
                className="flex items-center gap-2 text-sm font-medium text-[#718096] hover:text-[#1E3A5F] transition mb-3"
              >
                <CheckCircle className="w-4 h-4 text-[#27AE60]" />
                {showPaid ? 'Ocultar' : 'Ver'} {paidDebts.length} deuda{paidDebts.length !== 1 ? 's' : ''} pagada{paidDebts.length !== 1 ? 's' : ''}
              </button>

              {showPaid && (
                <div className="space-y-3 animate-fade-in">
                  {paidDebts.map((debt) => (
                    <DebtCard
                      key={debt.id}
                      debt={debt}
                      payments={paymentsMap[debt.id] ?? []}
                      paymentsLoading={paymentsLoading && openHistoryId === debt.id}
                      onPaymentsOpen={setOpenHistoryId}
                      onAddPayment={setPayingDebt}
                      onEdit={openEdit}
                      onDelete={deleteDebt}
                      onMarkPaid={markAsPaid}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Modal deuda */}
      <Modal
        open={showDebtForm}
        onClose={closeDebtForm}
        title={editingDebt ? 'Editar deuda' : 'Nueva deuda'}
      >
        <DebtForm
          onSubmit={handleDebtSubmit}
          onClose={closeDebtForm}
          initial={editingDebt ?? undefined}
        />
      </Modal>

      {/* Modal abono */}
      <Modal
        open={!!payingDebt}
        onClose={() => setPayingDebt(null)}
        title="Registrar abono"
      >
        {payingDebt && (
          <PaymentForm
            debt={payingDebt}
            onSubmit={handlePaymentSubmit}
            onClose={() => setPayingDebt(null)}
          />
        )}
      </Modal>
    </div>
  )
}
