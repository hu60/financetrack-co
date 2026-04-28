import { Plus } from 'lucide-react'

interface FABProps {
  onClick: () => void
}

export default function FAB({ onClick }: FABProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Registrar gasto rápido"
      className="fixed bottom-20 right-4 z-50 w-14 h-14 bg-[#F5A623] text-[#1E3A5F] rounded-full shadow-lg flex items-center justify-center hover:bg-[#F7B84A] active:scale-95 transition-all md:bottom-6 md:right-6"
      style={{ boxShadow: '0 4px 20px rgba(245,166,35,0.4)' }}
    >
      <Plus className="w-7 h-7 stroke-[2.5]" />
    </button>
  )
}
