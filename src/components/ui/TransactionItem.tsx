import { useState, useRef } from 'react'
import { Trash2, Pencil } from 'lucide-react'
import { formatCOP, formatDateShort } from '@/lib/utils'
import { CATEGORY_ICONS } from '@/lib/categoryIcons'
import type { Transaction } from '@/types'

interface TransactionItemProps {
  transaction: Transaction
  onDelete: (id: string) => void
  onEdit: (t: Transaction) => void
}

export default function TransactionItem({ transaction, onDelete, onEdit }: TransactionItemProps) {
  const [swiped, setSwiped] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const startX = useRef<number>(0)
  const isIncome = transaction.type === 'income'

  // Touch handlers para swipe-to-delete en mobile
  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX
  }

  function onTouchEnd(e: React.TouchEvent) {
    const diff = startX.current - e.changedTouches[0].clientX
    if (diff > 60) setSwiped(true)
    if (diff < -30) setSwiped(false)
  }

  function handleDelete() {
    if (confirmDelete) {
      onDelete(transaction.id)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  const icon = CATEGORY_ICONS[transaction.category] ?? '💳'

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Fondo rojo de delete */}
      <div className="absolute inset-0 bg-[#E74C3C] flex items-center justify-end pr-4 rounded-xl">
        <Trash2 className="w-5 h-5 text-white" />
      </div>

      {/* Item principal */}
      <div
        className="relative bg-white border border-[#E2E8F0] rounded-xl transition-transform duration-200"
        style={{ transform: swiped ? 'translateX(-72px)' : 'translateX(0)' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Ícono categoría */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
            style={{ backgroundColor: isIncome ? '#EAFAF1' : '#FEF0EE' }}
          >
            {icon}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#1A202C] truncate">
              {transaction.category}
            </p>
            {transaction.description && (
              <p className="text-xs text-[#718096] truncate">{transaction.description}</p>
            )}
            <p className="text-xs text-[#A0AEC0] mt-0.5">{formatDateShort(transaction.date)}</p>
          </div>

          {/* Monto */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className="font-semibold text-sm"
              style={{ color: isIncome ? '#27AE60' : '#E74C3C' }}
            >
              {isIncome ? '+' : '-'}{formatCOP(transaction.amount)}
            </span>

            {/* Botones desktop */}
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={() => onEdit(transaction)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F8FAFC] text-[#A0AEC0] hover:text-[#1E3A5F] transition"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDelete}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#A0AEC0] hover:text-[#E74C3C] transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Confirm delete overlay (mobile swipe) */}
        {swiped && (
          <div className="absolute right-0 top-0 bottom-0 flex items-center">
            <button
              onClick={handleDelete}
              className="h-full px-5 bg-[#E74C3C] text-white text-xs font-semibold rounded-r-xl flex flex-col items-center justify-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              {confirmDelete ? '¿Seguro?' : 'Eliminar'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
