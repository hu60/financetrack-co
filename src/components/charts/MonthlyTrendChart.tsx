import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { formatCOPCompact } from '@/lib/utils'
import type { MonthlyTrend } from '@/types'

interface MonthlyTrendChartProps {
  data: MonthlyTrend[]
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-[#1A202C] mb-1 capitalize">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-[#718096]">{p.name === 'income' ? 'Ingresos' : 'Gastos'}:</span>
          <span className="font-semibold" style={{ color: p.color }}>{formatCOPCompact(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const hasData = data.some((d) => d.income > 0 || d.expense > 0)

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-48 text-[#A0AEC0] text-sm">
        Sin datos históricos aún
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: '#A0AEC0' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatCOPCompact}
          tick={{ fontSize: 10, fill: '#A0AEC0' }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span className="text-xs text-[#718096]">
              {value === 'income' ? 'Ingresos' : 'Gastos'}
            </span>
          )}
        />
        <Line
          type="monotone"
          dataKey="income"
          stroke="#27AE60"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#27AE60', strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="expense"
          stroke="#E74C3C"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#E74C3C', strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
