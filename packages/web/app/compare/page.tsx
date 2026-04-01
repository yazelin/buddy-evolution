import { createSupabaseClient } from '@/lib/supabase'
import { StatRadar } from '@/components/stat-radar'
import { XPProgress } from '@/components/xp-progress'

const SPECIES_ICONS: Record<string, string> = {
  duck: '🦆', goose: '🪿', blob: '🫧', cat: '🐱', dragon: '🐉',
  octopus: '🐙', owl: '🦉', penguin: '🐧', turtle: '🐢', snail: '🐌',
  ghost: '👻', axolotl: '🦎', capybara: '🦫', cactus: '🌵', robot: '🤖',
  rabbit: '🐰', mushroom: '🍄', chonk: '🐈',
}

const TIER_ICONS: Record<string, string> = {
  hatchling: '🥚', juvenile: '⚡', adult: '🌟', elder: '👑', ascended: '✨',
}

function BuddyCard({ buddy }: { buddy: any }) {
  return (
    <div className="flex-1 text-center">
      <div className="text-5xl mb-2">{SPECIES_ICONS[buddy.species] || '🐾'}</div>
      <h2 className="text-lg font-bold">{buddy.companion_name}</h2>
      <p className="text-gray-500">@{buddy.github_username}</p>
      <p className="mt-1">
        {TIER_ICONS[buddy.tier]} {buddy.tier} — {buddy.rarity}
      </p>
      <div className="mt-4 px-4">
        <XPProgress totalXP={buddy.total_xp} tier={buddy.tier} />
      </div>
      <div className="mt-4">
        <StatRadar
          baseStats={buddy.base_stats as Record<string, number>}
          statGrowth={buddy.stat_growth as Record<string, number>}
        />
      </div>
    </div>
  )
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>
}) {
  const { a, b } = await searchParams

  if (!a || !b) {
    return (
      <main className="min-h-screen bg-gray-950 text-gray-100 font-mono flex items-center justify-center">
        <p className="text-gray-400">Usage: /compare?a=username1&b=username2</p>
      </main>
    )
  }

  const supabase = createSupabaseClient()
  const [{ data: buddyA }, { data: buddyB }] = await Promise.all([
    supabase.from('buddies').select('*').eq('github_username', a).single(),
    supabase.from('buddies').select('*').eq('github_username', b).single(),
  ])

  if (!buddyA || !buddyB) {
    return (
      <main className="min-h-screen bg-gray-950 text-gray-100 font-mono flex items-center justify-center">
        <p className="text-gray-400">One or both buddies not found.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 font-mono">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <a href="/" className="text-gray-500 hover:text-gray-300 mb-8 block">&larr; Back</a>
        <h1 className="text-2xl font-bold text-center mb-8">Compare</h1>
        <div className="flex gap-8">
          <BuddyCard buddy={buddyA} />
          <div className="flex items-center text-4xl text-gray-600">VS</div>
          <BuddyCard buddy={buddyB} />
        </div>
      </div>
    </main>
  )
}
