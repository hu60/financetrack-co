import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, TrendingUp } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Ingresa tu nombre'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type RegisterForm = z.infer<typeof registerSchema>

export default function Register() {
  const { signUpWithEmail, signInWithGoogle } = useAuth()
  const [showPass, setShowPass] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  async function onSubmit(data: RegisterForm) {
    setAuthError(null)
    try {
      await signUpWithEmail(data.email, data.password, data.fullName)
      setSuccess(true)
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Error al registrarse')
    }
  }

  if (success) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center bg-[#F8FAFC] px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-8 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✉️</span>
          </div>
          <h2 className="text-xl font-bold text-[#1A202C] mb-2">Revisa tu correo</h2>
          <p className="text-sm text-[#718096] mb-6">
            Te enviamos un enlace de confirmación. Haz clic en él para activar tu cuenta.
          </p>
          <Link
            to="/auth/login"
            className="block w-full min-h-[48px] bg-[#1E3A5F] text-white font-semibold rounded-xl flex items-center justify-center hover:bg-[#2A4F80] transition"
          >
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-[#F8FAFC] px-4 py-8">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-[#1E3A5F] flex items-center justify-center mb-3 shadow-lg">
          <TrendingUp className="w-8 h-8 text-[#F5A623]" />
        </div>
        <h1 className="text-2xl font-bold text-[#1E3A5F]">FinanceTrack CO</h1>
        <p className="text-sm text-[#718096] mt-1">Crea tu cuenta gratis</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 animate-slide-up">
        <h2 className="text-xl font-semibold text-[#1A202C] mb-6">Crear cuenta</h2>

        {authError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-[#E74C3C]">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-[#1A202C] mb-1.5">
              Nombre completo
            </label>
            <input
              {...register('fullName')}
              type="text"
              autoComplete="name"
              placeholder="Juan Pérez"
              className="w-full min-h-[48px] px-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition"
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-[#E74C3C]">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#1A202C] mb-1.5">
              Correo electrónico
            </label>
            <input
              {...register('email')}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="tu@email.com"
              className="w-full min-h-[48px] px-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-[#E74C3C]">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-[#1A202C] mb-1.5">Contraseña</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full min-h-[48px] px-4 pr-12 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#1A202C] transition"
              >
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-[#E74C3C]">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-[#1A202C] mb-1.5">
              Confirmar contraseña
            </label>
            <input
              {...register('confirmPassword')}
              type={showPass ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              className="w-full min-h-[48px] px-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-[#E74C3C]">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[48px] bg-[#1E3A5F] text-white font-semibold rounded-xl hover:bg-[#2A4F80] active:scale-[0.98] disabled:opacity-60 transition-all"
          >
            {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-[#E2E8F0]" />
          <span className="mx-3 text-xs text-[#718096]">o continúa con</span>
          <div className="flex-1 h-px bg-[#E2E8F0]" />
        </div>

        {/* Google */}
        <button
          onClick={() => signInWithGoogle()}
          className="w-full min-h-[48px] flex items-center justify-center gap-3 bg-white border border-[#E2E8F0] rounded-xl font-medium text-[#1A202C] hover:bg-[#F8FAFC] active:scale-[0.98] transition-all"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continuar con Google
        </button>

        {/* Login link */}
        <p className="mt-5 text-center text-sm text-[#718096]">
          ¿Ya tienes cuenta?{' '}
          <Link to="/auth/login" className="text-[#1E3A5F] font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
