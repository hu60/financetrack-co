export function SkeletonSummaryCard() {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
      <div className="skeleton h-3 w-20 mb-3 rounded" />
      <div className="skeleton h-7 w-32 rounded" />
    </div>
  )
}

export function SkeletonTransactionItem() {
  return (
    <div className="flex items-center gap-3 py-3 px-4 bg-white rounded-xl border border-[#E2E8F0]">
      <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-2.5 w-16 rounded" />
      </div>
      <div className="skeleton h-4 w-20 rounded" />
    </div>
  )
}
