'use client'

const TIER_THRESHOLDS: Record<string, number> = {
  hatchling: 0, juvenile: 100_000, adult: 1_000_000,
  elder: 10_000_000, ascended: 100_000_000,
}

const TIER_ORDER = ['hatchling', 'juvenile', 'adult', 'elder', 'ascended']

function formatXP(xp: number): string {
  if (xp >= 1_000_000) return `${(xp / 1_000_000).toFixed(1)}M`
  if (xp >= 1_000) return `${(xp / 1_000).toFixed(1)}K`
  return String(xp)
}

export function XPProgress({ totalXP, tier }: { totalXP: number; tier: string }) {
  const idx = TIER_ORDER.indexOf(tier)
  const currentThreshold = TIER_THRESHOLDS[tier] || 0
  const nextTier = idx < TIER_ORDER.length - 1 ? TIER_ORDER[idx + 1] : null
  const nextThreshold = nextTier ? TIER_THRESHOLDS[nextTier] : totalXP

  const progress = nextTier
    ? ((totalXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100
    : 100

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-400 mb-1">
        <span>{formatXP(totalXP)} XP</span>
        <span>{nextTier ? `${formatXP(nextThreshold)} to ${nextTier}` : 'MAX'}</span>
      </div>
      <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full transition-all"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
    </div>
  )
}
