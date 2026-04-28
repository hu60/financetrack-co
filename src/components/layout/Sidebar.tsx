import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowUpDown,
  CreditCard,
  PiggyBank,
  Target,
  TrendingUp,
  LogOut,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/gastos', icon: ArrowUpDown, label: 'Gastos' },
  { to: '/deudas', icon: CreditCard, label: 'Deudas' },
  { to: '/presupuesto', icon: PiggyBank, label: 'Presupuesto' },
  { to: '/metas', icon: Target, label: 'Metas de ahorro' },
]

export default function Sidebar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/auth/login')
  }

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-[#1E3A5F] flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-[#F5A623] flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-5 h-5 text-[#1E3A5F]" />
        </div>
        <div>
          <span className="font-bold text-white text-lg leading-none">FinanceTrack</span>
          <span className="block text-xs text-white/50 mt-0.5">Colombia</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white',
              )
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 border-t border-white/10 pt-4 space-y-1">
        <NavLink
          to="/perfil"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
              isActive
                ? 'bg-white/15 text-white'
                : 'text-white/60 hover:bg-white/10 hover:text-white',
            )
          }
        >
          <User className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm">{user?.user_metadata?.full_name ?? 'Mi perfil'}</p>
            <p className="truncate text-xs opacity-60">{user?.email}</p>
          </div>
        </NavLink>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
