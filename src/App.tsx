import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthListener } from '@/hooks/useAuth'
import AppLayout from '@/components/layout/AppLayout'
import { ProtectedRoute, PublicRoute } from '@/components/layout/ProtectedRoute'
import { TrendingUp } from 'lucide-react'

// Lazy-loaded pages
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Gastos = lazy(() => import('@/pages/Gastos'))
const Deudas = lazy(() => import('@/pages/Deudas'))
const Presupuesto = lazy(() => import('@/pages/Presupuesto'))
const Metas = lazy(() => import('@/pages/Metas'))
const Perfil = lazy(() => import('@/pages/Perfil'))
const Login = lazy(() => import('@/pages/Login'))
const Register = lazy(() => import('@/pages/Register'))

function PageLoader() {
  return (
    <div className="min-h-svh flex items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-3 animate-pulse-soft">
        <div className="w-12 h-12 rounded-2xl bg-[#1E3A5F] flex items-center justify-center">
          <TrendingUp className="w-7 h-7 text-[#F5A623]" />
        </div>
      </div>
    </div>
  )
}

function AppRoutes() {
  useAuthListener()

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Rutas públicas */}
        <Route element={<PublicRoute />}>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
        </Route>

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/gastos" element={<Gastos />} />
            <Route path="/deudas" element={<Deudas />} />
            <Route path="/presupuesto" element={<Presupuesto />} />
            <Route path="/metas" element={<Metas />} />
            <Route path="/perfil" element={<Perfil />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1A202C',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          },
          success: { iconTheme: { primary: '#27AE60', secondary: '#fff' } },
          error: { iconTheme: { primary: '#E74C3C', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  )
}
