import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { formatCOP, todayISO, pct } from '@/lib/utils'
import type { SavingsGoal } from '@/types'

const schema = z.object({
  amount: z.string().min(1, 'Ingresa el monto').refine((v) => Number(v) > 0, 'Monto inválido'),
  contribution_date: z.string().min(1, 'Selecciona una fecha'),
  note: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface ContributionFormProps {
  goal: SavingsGoal
  onSubmit: (data: { amount: number; contribution_date: string; note?: string | null }) => Promise<boolean>
  onClose: () => void
}

export default function ContributionForm({ goal, onSubmit, onClose }: ContributionFormProps) {
  const remaining = goal.target_amount - goal.current_amount
  const progress = pct(goal.current_amount, goal.target_amount)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { contribution_date: todayISO(), amount: '', note: '' },
  })

  async function onValid(data: FormData) {
    const ok = await onSubmit({
      amount: Number(data.amount),
      contribution_date: data.contribution_date,
      note: data.note || null,
    })
    if (ok) onClose()
  }

  const inputClass = 'w-full min-h-[48px] px-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition'

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-4">
      {/* Info meta */}
      <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{goal.emoji}</span>
          <div>
            <p className="font-semibold text-[#1A202C]">{goal.name}</p>
            <p className="text-xs text-[#718096]">{progress}% completado</p>
          </div>
        </div>
        <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#27AE60] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1.5 text-[#718096]">
          <span>{formatCOP(goal.current_amount)} ahorrado</span>
          <span>Faltan {formatCOP(remaining)}</span>
        </div>
      </div>

      {/* Monto */}
      <div>
        <label className="block text-sm font-medium text-[#1A202C] mb-1.5">Monto del aporte (COP)</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#718096] font-semibold">$</span>
          <input
            {...register('amount')}
            type="number"
            inputMode="numeric"
            placeholder="0"
            className={`${inputClass} pl-8 text-lg font-semibold`}
          />
        </div>
        {errors.amount && <p className="mt-1 text-xs text-[#E74C3C]">{errors.amount.message}</p>}
      </div>

      {/* Fecha */}
      <div>
        <label className="block text-sm font-medium text-[#1A202C] mb-1.5">Fecha del aporte</label>
        <input {...register('contribution_date')} type="date" className={inputClass} />
        {errors.contribution_date && <p className="mt-1 text-xs text-[#E74C3C]">{errors.contribution_date.message}</p>}
      </div>

      {/* Nota */}
      <div>
        <label className="block text-sm font-medium text-[#1A202C] mb-1.5">
          Nota <span className="text-[#A0AEC0] font-normal">(opcional)</span>
        </label>
        <input {...register('note')} type="text" placeholder="Quincena, bono, venta..." className={inputClass} />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full min-h-[52px] bg-[#27AE60] text-white font-semibold rounded-xl hover:bg-green-600 active:scale-[0.98] disabled:opacity-60 transition-all"
      >
        {isSubmitting ? 'Guardando...' : 'Registrar aporte'}
      </button>
    </form>
  )
}
