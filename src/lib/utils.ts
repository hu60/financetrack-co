import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import type { FinancialScore } from '@/types'

// ─── Tailwind class merge ─────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Formato COP ─────────────────────────────────────────────────────────────

const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatCOP(amount: number): string {
  return copFormatter.format(amount)
}

export function formatCOPCompact(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`
  }
  if (Math.abs(amount) >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`
  }
  return formatCOP(amount)
}

// ─── Fechas ───────────────────────────────────────────────────────────────────

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), "d 'de' MMMM, yyyy", { locale: es })
}

export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'dd/MM/yyyy', { locale: es })
}

export function formatMonth(dateStr: string): string {
  return format(parseISO(dateStr), 'MMMM yyyy', { locale: es })
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function getCurrentMonth(): { month: number; year: number } {
  const now = new Date()
  return { month: now.getMonth() + 1, year: now.getFullYear() }
}

export function isOverdue(dueDateStr: string): boolean {
  return isBefore(parseISO(dueDateStr), new Date())
}

export function isDueSoon(dueDateStr: string, days = 7): boolean {
  const dueDate = parseISO(dueDateStr)
  const now = new Date()
  return isAfter(dueDate, now) && isBefore(dueDate, addDays(now, days))
}

export function daysUntilDue(dueDateStr: string): number {
  const diff = parseISO(dueDateStr).getTime() - new Date().getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// ─── Score financiero ─────────────────────────────────────────────────────────

export function calcFinancialScore(params: {
  balance: number
  totalIncome: number
  totalDebt: number
  activeGoals: number
  budgetUsagePercent: number
}): FinancialScore {
  const { balance, totalIncome, totalDebt, activeGoals, budgetUsagePercent } = params

  let score = 50

  // Balance positivo (+20 / -20)
  if (totalIncome > 0) {
    const savingsRate = balance / totalIncome
    score += Math.min(20, savingsRate * 100)
  }

  // Ratio deuda/ingreso (-20 si deuda > 50% ingreso mensual)
  if (totalIncome > 0) {
    const debtRatio = totalDebt / (totalIncome * 12)
    score -= Math.min(20, debtRatio * 40)
  }

  // Metas activas (+10)
  if (activeGoals > 0) score += Math.min(10, activeGoals * 3)

  // Control de presupuesto (+10 si < 80%, -10 si > 100%)
  if (budgetUsagePercent < 80) score += 10
  else if (budgetUsagePercent > 100) score -= 10

  score = Math.max(0, Math.min(100, Math.round(score)))

  if (score >= 80) return { score, label: 'Excelente', color: '#27AE60' }
  if (score >= 60) return { score, label: 'Bueno', color: '#F5A623' }
  if (score >= 40) return { score, label: 'Regular', color: '#F39C12' }
  return { score, label: 'Crítico', color: '#E74C3C' }
}

// ─── Proyección de meta ───────────────────────────────────────────────────────

export function projectGoalDate(
  remaining: number,
  contributions: { amount: number; contribution_date: string }[],
): string | null {
  if (contributions.length < 2) return null

  const sorted = [...contributions].sort(
    (a, b) => new Date(a.contribution_date).getTime() - new Date(b.contribution_date).getTime(),
  )

  const totalDays =
    new Date(sorted[sorted.length - 1].contribution_date).getTime() -
    new Date(sorted[0].contribution_date).getTime()
  const totalMs = totalDays === 0 ? 30 * 24 * 60 * 60 * 1000 : totalDays

  const totalSaved = contributions.reduce((sum, c) => sum + c.amount, 0)
  const dailyRate = totalSaved / (totalMs / (24 * 60 * 60 * 1000))

  if (dailyRate <= 0) return null

  const daysNeeded = remaining / dailyRate
  const projectedDate = addDays(new Date(), daysNeeded)
  return format(projectedDate, "MMMM yyyy", { locale: es })
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function pct(part: number, total: number): number {
  if (total === 0) return 0
  return Math.min(100, Math.round((part / total) * 100))
}
