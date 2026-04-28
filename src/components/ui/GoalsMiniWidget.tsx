import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { formatCOP, pct } from '@/lib/utils'
import type { SavingsGoal } from '@/types'

interface GoalsMiniWidgetProps {
  goals: SavingsGoal[]
}

export default function GoalsMiniWidget({ goals }: GoalsMiniWidgetProps) {
  const navigate = useNavigate()

  if (goals.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0F4F8]">
        <p className="text-sm font-semibold text-[#1A202C]">Metas activas</p>
        <button
          onClick={() => navigate('/metas')}
          className="text-xs text-[#1E3A5F] font-medium flex items-center gap-0.5 hover:underline"
        >
          Ver todas <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="divide-y divide-[#F0F4F8]">
        {goals.map((goal) => {
          const progress = pct(goal.current_amount, goal.target_amount)
          return (
            <div key={goal.id} className="px-4 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base flex-shrink-0">{goal.emoji}</span>
                  <p className="text-sm font-medium text-[#1A202C] truncate">{goal.name}</p>
                </div>
                <span className="text-xs font-bold text-[#1E3A5F] flex-shrink-0 ml-2">{progress}%</span>
              </div>
              <div className="h-1.5 bg-[#F0F4F8] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1E3A5F] rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-[#A0AEC0] mt-1">
                <span>{formatCOP(goal.current_amount)}</span>
                <span>{formatCOP(goal.target_amount)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
