import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { SavingsGoal } from '@/types'

const GOAL_EMOJIS = ['🎯','🏠','🚗','✈️','💍','📱','💻','🎓','🏋️','🐶','👶','🌎','🎸','⛵','🏔️','💰','🏦','🛡️','🎁','🌟']

const schema = z.object({
  name: z.string().min(1, 'Ingresa un nombre'),
  target_amount: z.string().min(1, 'Ingresa el monto objetivo').refine((v) => Number(v) > 0, 'Monto inválido'),
  current_amount: z.string().optional(),
  target_date: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface GoalFormProps {
  onSubmit: (data: {
    name: string
    target_amount: number
    current_amount?: number
    target_date?: string | null
    emoji?: string
  }) => Promise<boolean>
  onClose: () => void
  initial?: SavingsGoal
}

export default function GoalForm({ onSubmit, onClose, initial }: GoalFormProps) {
  const [emoji, setEmoji] = useState(initial?.emoji ?? '🎯')
  const [showEmojis, setShowEmojis] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? '',
      target_amount: initial ? String(initial.target_amount) : '',
      current_amount: initial ? String(initial.current_amount) : '0',
      target_date: initial?.target_date ?? '',
    },
  })

  async function onValid(data: FormData) {
    const ok = await onSubmit({
      name: data.name,
      target_amount: Number(data.target_amount),
      current_amount: data.current_amount ? Number(data.current_amount) : 0,
      target_date: data.target_date || null,
      emoji,
    })
    if (ok) onClose()
  }

  const inputClass = 'w-full min-h-[48px] px-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition'
  const labelClass = 'block text-sm font-medium text-[#1A202C] mb-1.5'

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-4">
      {/* Emoji selector */}
      <div>
        <label className={labelClass}>Ícono de la meta</label>
        <button
          type="button"
          onClick={() => setShowEmojis(!showEmojis)}
          className="w-16 h-16 text-3xl rounded-2xl border-2 border-[#E2E8F0] hover:border-[#1E3A5F] bg-[#F8FAFC] transition flex items-center justify-center"
        >
          {emoji}
        </button>
        {showEmojis && (
          <div className="mt-2 grid grid-cols-10 gap-1 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
            {GOAL_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => { setEmoji(e); setShowEmojis(false) }}
                className={`text-xl h-9 w-9 rounded-lg flex items-center justify-center transition hover:bg-white ${emoji === e ? 'bg-white shadow-sm ring-2 ring-[#1E3A5F]' : ''}`}
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Nombre */}
      <div>
        <label className={labelClass}>Nombre de la meta</label>
        <input {...register('name')} type="text" placeholder="Ej: Fondo de emergencia, viaje a Europa..." className={inputClass} />
        {errors.name && <p className="mt-1 text-xs text-[#E74C3C]">{errors.name.message}</p>}
      </div>

      {/* Montos */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Monto objetivo (COP)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096] font-semibold text-sm">$</span>
            <input {...register('target_amount')} type="number" inputMode="numeric" placeholder="0" className={`${inputClass} pl-7`} />
          </div>
          {errors.target_amount && <p className="mt-1 text-xs text-[#E74C3C]">{errors.target_amount.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Ya ahorrado (COP)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096] font-semibold text-sm">$</span>
            <input {...register('current_amount')} type="number" inputMode="numeric" placeholder="0" className={`${inputClass} pl-7`} />
          </div>
        </div>
      </div>

      {/* Fecha objetivo */}
      <div>
        <label className={labelClass}>
          Fecha objetivo <span className="text-[#A0AEC0] font-normal">(opcional)</span>
        </label>
        <input {...register('target_date')} type="date" className={inputClass} />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full min-h-[52px] bg-[#1E3A5F] text-white font-semibold rounded-xl hover:bg-[#2A4F80] active:scale-[0.98] disabled:opacity-60 transition-all"
      >
        {isSubmitting ? 'Guardando...' : initial ? 'Guardar cambios' : 'Crear meta'}
      </button>
    </form>
  )
}
