import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ArrowUpDown, CreditCard, PiggyBank, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Inicio' },
  { to: '/gastos', icon: ArrowUpDown, label: 'Gastos' },
  { to: '/deudas', icon: CreditCard, label: 'Deudas' },
  { to: '/presupuesto', icon: PiggyBank, label: 'Presupuesto' },
  { to: '/metas', icon: Target, label: 'Metas' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E2E8F0] safe-area-inset-bottom md:hidden">
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors',
                isActive ? 'text-[#1E3A5F]' : 'text-[#A0AEC0] hover:text-[#718096]',
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center transition-all',
                    isActive ? 'bg-[#1E3A5F]/10' : '',
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
