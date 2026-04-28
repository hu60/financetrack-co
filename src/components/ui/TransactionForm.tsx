import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn, todayISO } from '@/lib/utils'
import { CATEGORIES, INCOME_CATEGORIES } from '@/types'
import type { Transaction } from '@/types'

const schema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z
    .string()
    .min(1, 'Ingresa un monto')
    .refine((v) => !isNaN(Number(v.replace(/\./g, '').replace(',', '.'))) && Number(v.replace(/\./g, '').replace(',', '.')) > 0, 'Monto inválido'),
  category: z.string().min(1, 'Selecciona una categoría'),
  description: z.string().optional(),
  date: z.string().min(1, 'Selecciona una fecha'),
})

type FormData = z.infer<typeof schema>

interface TransactionFormProps {
  onSubmit: (data: { type: 'income' | 'expense'; amount: number; category: string; description?: string; date: string }) => Promise<boolean>
  onClose: () => void
  initial?: Transaction
}

function parseCOP(val: string): number {
  return Number(val.replace(/\./g, '').replace(',', '.'))
}

export default function TransactionForm({ onSubmit, onClose, initial }: TransactionFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: initial?.type ?? 'expense',
      amount: initial ? String(initial.amount) : '',
      category: initial?.category ?? '',
      description: initial?.description ?? undefined,
      date: initial?.date ?? todayISO(),
    },
  })

  const type = watch('type')
  const categories = type === 'income' ? INCOME_CATEGORIES : CATEGORIES

  // Reset categoría al cambiar type
  useEffect(() => {
    setValue('category', '')
  }, [type, setValue])

  async function onValid(data: FormData) {
    const ok = await onSubmit({
      type: data.type,
      amount: parseCOP(data.amount),
      category: data.category,
      description: data.description || undefined,
      date: data.date,
    })
    if (ok) onClose()
  }

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-4">
      {/* Tipo: Gasto / Ingreso */}
      <div className="flex rounded-xl overflow-hidden border border-[#E2E8F0]">
        <button
          type="button"
          onClick={() => setValue('type', 'expense')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all',
            type === 'expense'
              ? 'bg-[#E74C3C] text-white'
              : 'bg-white text-[#718096] hover:bg-[#F8FAFC]',
          )}
        >
          <TrendingDown className="w-4 h-4" />
          Gasto
        </button>
        <button
          type="button"
          onClick={() => setValue('type', 'income')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all',
            type === 'income'
              ? 'bg-[#27AE60] text-white'
              : 'bg-white text-[#718096] hover:bg-[#F8FAFC]',
          )}
        >
          <TrendingUp className="w-4 h-4" />
          Ingreso
        </button>
      </div>

      {/* Monto */}
      <div>
        <label className="block text-sm font-medium text-[#1A202C] mb-1.5">
          Monto (COP)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#718096] font-semibold">$</span>
          <input
            {...register('amount')}
            type="number"
            inputMode="numeric"
            placeholder="0"
            className="w-full min-h-[52px] pl-8 pr-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#1A202C] text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition"
          />
        </div>
        {errors.amount && <p className="mt-1 text-xs text-[#E74C3C]">{errors.amount.message}</p>}
      </div>

      {/* Categoría */}
      <div>
        <label className="block text-sm font-medium text-[#1A202C] mb-1.5">Categoría</label>
        <select
          {...register('category')}
          className="w-full min-h-[48px] px-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition appearance-none"
        >
          <option value="">Seleccionar categoría...</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-xs text-[#E74C3C]">{errors.category.message}</p>}
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-[#1A202C] mb-1.5">
          Descripción <span className="text-[#A0AEC0] font-normal">(opcional)</span>
        </label>
        <input
          {...register('description')}
          type="text"
          placeholder="Ej: Mercado Éxito, almuerzo..."
          className="w-full min-h-[48px] px-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition"
        />
      </div>

      {/* Fecha */}
      <div>
        <label className="block text-sm font-medium text-[#1A202C] mb-1.5">Fecha</label>
        <input
          {...register('date')}
          type="date"
          className="w-full min-h-[48px] px-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition"
        />
        {errors.date && <p className="mt-1 text-xs text-[#E74C3C]">{errors.date.message}</p>}
      </div>

      {/* Botón submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          'w-full min-h-[52px] rounded-xl font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60',
          type === 'expense' ? 'bg-[#E74C3C] hover:bg-red-600' : 'bg-[#27AE60] hover:bg-green-600',
        )}
      >
        {isSubmitting
          ? 'Guardando...'
          : initial
            ? 'Guardar cambios'
            : type === 'expense'
              ? 'Registrar gasto'
              : 'Registrar ingreso'}
      </button>
    </form>
  )
}
