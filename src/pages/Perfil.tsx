import { useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function Perfil() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/auth/login')
  }

  return (
    <div className="p-4 md:p-6 max-w-lg">
      <h1 className="text-2xl font-bold text-[#1E3A5F] mb-6">Mi perfil</h1>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 mb-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center">
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="Avatar"
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <User className="w-7 h-7 text-[#1E3A5F]" />
            )}
          </div>
          <div>
            <p className="font-semibold text-[#1A202C]">
              {user?.user_metadata?.full_name ?? 'Usuario'}
            </p>
            <p className="text-sm text-[#718096]">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-[#E2E8F0]">
            <span className="text-[#718096]">Moneda</span>
            <span className="font-medium text-[#1A202C]">COP — Peso Colombiano</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-[#718096]">Cuenta creada</span>
            <span className="font-medium text-[#1A202C]">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('es-CO') : '—'}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={handleSignOut}
        className="w-full min-h-[48px] flex items-center justify-center gap-2 bg-red-50 border border-red-200 text-[#E74C3C] font-semibold rounded-xl hover:bg-red-100 active:scale-[0.98] transition-all"
      >
        <LogOut className="w-5 h-5" />
        Cerrar sesión
      </button>
    </div>
  )
}
