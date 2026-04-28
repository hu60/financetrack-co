import type { FinancialScore } from '@/types'

interface FinancialScoreCardProps {
  score: FinancialScore
}

export default function FinancialScoreCard({ score }: FinancialScoreCardProps) {
  // Arco SVG semicircular
  const radius = 54
  const circumference = Math.PI * radius // semicírculo
  const offset = circumference - (score.score / 100) * circumference

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
      <p className="text-sm font-semibold text-[#718096] mb-4">Salud financiera</p>

      <div className="flex items-center gap-5">
        {/* SVG semicircular */}
        <div className="relative flex-shrink-0">
          <svg width="120" height="68" viewBox="0 0 120 68">
            {/* Track */}
            <path
              d="M 10 60 A 50 50 0 0 1 110 60"
              fill="none"
              stroke="#F0F4F8"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Progress */}
            <path
              d="M 10 60 A 50 50 0 0 1 110 60"
              fill="none"
              stroke={score.color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={`${offset}`}
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          {/* Número en el centro */}
          <div className="absolute inset-0 flex items-end justify-center pb-1">
            <span className="text-2xl font-bold" style={{ color: score.color }}>
              {score.score}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <p className="text-xl font-bold" style={{ color: score.color }}>{score.label}</p>
          <div className="mt-3 space-y-1.5 text-xs text-[#718096]">
            <ScoreFactor label="Balance positivo" ok={score.score >= 50} />
            <ScoreFactor label="Deudas bajo control" ok={score.score >= 40} />
            <ScoreFactor label="Metas activas" ok={score.score >= 60} />
            <ScoreFactor label="Presupuesto respetado" ok={score.score >= 70} />
          </div>
        </div>
      </div>
    </div>
  )
}

function ScoreFactor({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className={ok ? 'text-[#27AE60]' : 'text-[#E74C3C]'}>{ok ? '✓' : '✗'}</span>
      <span>{label}</span>
    </div>
  )
}
