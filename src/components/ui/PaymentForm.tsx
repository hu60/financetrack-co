import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { formatCOP, todayISO } from '@/lib/utils'
import type { Debt } from '@/types'

const schema = z.object({
  amount: z.string().min(1, 'Ingresa el monto').refine((v) => Number(v) > 0, 'Monto inválido'),
  payment_date: z.string().min(1, 'Selecciona la fecha'),
  note: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface PaymentFormProps {
  debt: Debt
  onSubmit: (data: { amount: number; payment_date: string; note?: string | null }) => Promise<boolean>
  onClose: () => void
}

export default function PaymentForm({ debt, onSubmit, onClose }: PaymentFormProps) {
  const remaining = debt.total_amount - debt.paid_amount

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { payment_date: todayISO(), amount: '', note: '' },
  })

  async function onValid(data: FormData) {
    const amount = Number(data.amount)
    if (amount > remaining) return
    const ok = await onSubmit({
      amount,
      payment_date: data.payment_date,
      note: data.note || null,
    })
    if (ok) onClose()
  }

  const inputClass = 'w-full min-h-[48px] px-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition'

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-4">
      {/* Info deuda */}
      <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
        <p className="text-xs text-[#718096]">Deuda con</p>
        <p className="font-semibold text-[#1A202C]">{debt.creditor_name}</p>
        <p className="text-sm text-[#E74C3C] font-medium mt-0.5">
          Pendiente: {formatCOP(remaining)}
        </p>
      </div>

      {/* Monto */}
      <div>
        <label className="block text-sm font-medium text-[#1A202C] mb-1.5">Monto del abono (COP)</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#718096] font-semibold">$</span>
          <input
            {...register('amount')}
            type="number"
            inputMode="numeric"
            placeholder="0"
            max={remaining}
            className={`${inputClass} pl-8 text-lg font-semibold`}
          />
        </div>
        {errors.amount && <p className="mt-1 text-xs text-[#E74C3C]">{errors.amount.message}</p>}
        <p className="mt-1 text-xs text-[#A0AEC0]">Máximo: {formatCOP(remaining)}</p>
      </div>

      {/* Fecha */}
      <div>
        <label className="block text-sm font-medium text-[#1A202C] mb-1.5">Fecha del pago</label>
        <input {...register('payment_date')} type="date" className={inputClass} />
        {errors.payment_date && <p className="mt-1 text-xs text-[#E74C3C]">{errors.payment_date.message}</p>}
      </div>

      {/* Nota */}
      <div>
        <label className="block text-sm font-medium text-[#1A202C] mb-1.5">
          Nota <span className="text-[#A0AEC0] font-normal">(opcional)</span>
        </label>
        <input
          {...register('note')}
          type="text"
          placeholder="Cuota #3, transferencia Nequi..."
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full min-h-[52px] bg-[#27AE60] text-white font-semibold rounded-xl hover:bg-green-600 active:scale-[0.98] disabled:opacity-60 transition-all"
      >
        {isSubmitting ? 'Registrando...' : 'Registrar abono'}
      </button>
    </form>
  )
}
