import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Debt } from '@/types'

const schema = z.object({
  creditor_name: z.string().min(1, 'Ingresa el nombre del acreedor'),
  total_amount: z.string().min(1, 'Ingresa el monto').refine((v) => Number(v) > 0, 'Monto inválido'),
  paid_amount: z.string().optional(),
  interest_rate: z.string().optional(),
  due_date: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface DebtFormProps {
  onSubmit: (data: {
    creditor_name: string
    total_amount: number
    paid_amount?: number
    interest_rate?: number | null
    due_date?: string | null
    notes?: string | null
  }) => Promise<boolean>
  onClose: () => void
  initial?: Debt
}

export default function DebtForm({ onSubmit, onClose, initial }: DebtFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      creditor_name: initial?.creditor_name ?? '',
      total_amount: initial ? String(initial.total_amount) : '',
      paid_amount: initial ? String(initial.paid_amount) : '0',
      interest_rate: initial?.interest_rate ? String(initial.interest_rate) : '',
      due_date: initial?.due_date ?? '',
      notes: initial?.notes ?? '',
    },
  })

  async function onValid(data: FormData) {
    const ok = await onSubmit({
      creditor_name: data.creditor_name,
      total_amount: Number(data.total_amount),
      paid_amount: data.paid_amount ? Number(data.paid_amount) : 0,
      interest_rate: data.interest_rate ? Number(data.interest_rate) : null,
      due_date: data.due_date || null,
      notes: data.notes || null,
    })
    if (ok) onClose()
  }

  const inputClass = 'w-full min-h-[48px] px-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition'
  const labelClass = 'block text-sm font-medium text-[#1A202C] mb-1.5'

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-4">
      {/* Acreedor */}
      <div>
        <label className={labelClass}>Acreedor</label>
        <input {...register('creditor_name')} type="text" placeholder="Banco, persona, empresa..." className={inputClass} />
        {errors.creditor_name && <p className="mt-1 text-xs text-[#E74C3C]">{errors.creditor_name.message}</p>}
      </div>

      {/* Montos */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Monto total (COP)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096] font-semibold text-sm">$</span>
            <input {...register('total_amount')} type="number" inputMode="numeric" placeholder="0" className={`${inputClass} pl-7`} />
          </div>
          {errors.total_amount && <p className="mt-1 text-xs text-[#E74C3C]">{errors.total_amount.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Ya pagado (COP)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096] font-semibold text-sm">$</span>
            <input {...register('paid_amount')} type="number" inputMode="numeric" placeholder="0" className={`${inputClass} pl-7`} />
          </div>
        </div>
      </div>

      {/* Tasa y fecha */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>
            Tasa anual % <span className="text-[#A0AEC0] font-normal">(opcional)</span>
          </label>
          <input {...register('interest_rate')} type="number" step="0.01" placeholder="ej: 2.5" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>
            Fecha límite <span className="text-[#A0AEC0] font-normal">(opcional)</span>
          </label>
          <input {...register('due_date')} type="date" className={inputClass} />
        </div>
      </div>

      {/* Notas */}
      <div>
        <label className={labelClass}>
          Notas <span className="text-[#A0AEC0] font-normal">(opcional)</span>
        </label>
        <textarea
          {...register('notes')}
          rows={2}
          placeholder="Cuotas, condiciones, recordatorios..."
          className={`${inputClass} min-h-[72px] py-3 resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full min-h-[52px] bg-[#1E3A5F] text-white font-semibold rounded-xl hover:bg-[#2A4F80] active:scale-[0.98] disabled:opacity-60 transition-all"
      >
        {isSubmitting ? 'Guardando...' : initial ? 'Guardar cambios' : 'Registrar deuda'}
      </button>
    </form>
  )
}
