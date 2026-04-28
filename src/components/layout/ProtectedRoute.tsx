import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { TrendingUp } from 'lucide-react'

export function ProtectedRoute() {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4 animate-pulse-soft">
          <div className="w-14 h-14 rounded-2xl bg-[#1E3A5F] flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-[#F5A623]" />
          </div>
          <p className="text-sm text-[#718096]">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  return <Outlet />
}

export function PublicRoute() {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-2 border-[#1E3A5F] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
