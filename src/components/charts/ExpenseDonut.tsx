import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCOP } from '@/lib/utils'
import { CATEGORY_ICONS } from '@/lib/categoryIcons'
import type { CategoryBreakdown } from '@/types'

const COLORS = [
  '#1E3A5F', '#F5A623', '#27AE60', '#E74C3C', '#9B59B6',
  '#3498DB', '#F39C12', '#1ABC9C', '#E67E22', '#2ECC71',
]

interface ExpenseDonutProps {
  data: CategoryBreakdown[]
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: CategoryBreakdown }[] }) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-[#1A202C]">
        {CATEGORY_ICONS[item.category] ?? '📦'} {item.category}
      </p>
      <p className="text-[#718096]">{formatCOP(item.amount)}</p>
      <p className="text-[#1E3A5F] font-bold">{item.percentage}%</p>
    </div>
  )
}

function CustomLegend({ payload }: { payload?: { value: string; color: string }[] }) {
  if (!payload) return null
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-2">
      {payload.slice(0, 6).map((entry) => (
        <div key={entry.value} className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-xs text-[#718096]">{CATEGORY_ICONS[entry.value] ?? ''} {entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function ExpenseDonut({ data }: ExpenseDonutProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-[#A0AEC0] text-sm">
        Sin gastos este mes
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="amount"
          nameKey="category"
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  )
}
