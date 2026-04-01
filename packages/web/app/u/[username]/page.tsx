import { createSupabaseClient } from '@/lib/supabase'
import { XPProgress } from '@/components/xp-progress'
import { StatRadar } from '@/components/stat-radar'
import { notFound } from 'next/navigation'
import { checkAchievements, ACHIEVEMENTS } from '@/lib/achievements'

const TIER_ICONS: Record<string, string> = {
  hatchling: '🥚', juvenile: '⚡', adult: '🌟', elder: '👑', ascended: '✨',
}

const SPECIES_ICONS: Record<string, string> = {
  duck: '🦆', goose: '🪿', blob: '🫧', cat: '🐱', dragon: '🐉',
  octopus: '🐙', owl: '🦉', penguin: '🐧', turtle: '🐢', snail: '🐌',
  ghost: '👻', axolotl: '🦎', capybara: '🦫', cactus: '🌵', robot: '🤖',
  rabbit: '🐰', mushroom: '🍄', chonk: '🐈',
}

function formatXP(xp: number): string {
  return xp.toLocaleString('en-US')
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = createSupabaseClient()

  const { data: buddy, error } = await supabase
    .from('buddies')
    .select('*')
    .eq('github_username', username)
    .single()

  if (error || !buddy) {
    notFound()
  }

  const stats = buddy.lifetime_stats as Record<string, number> || {}

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 font-mono">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <a href="/" className="text-gray-500 hover:text-gray-300 mb-8 block">&larr; Back</a>

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">
            {SPECIES_ICONS[buddy.species] || '🐾'}
            {buddy.shiny && <span className="text-yellow-400"> ✦</span>}
          </div>
          <h1 className="text-2xl font-bold">
            {buddy.companion_name}
            <span className="text-gray-500 font-normal ml-2">@{buddy.github_username}</span>
          </h1>
          <div className="mt-2 text-lg">
            {TIER_ICONS[buddy.tier]} {buddy.tier.charAt(0).toUpperCase() + buddy.tier.slice(1)}
            <span className="text-gray-500 ml-3">{buddy.rarity}</span>
          </div>
        </div>

        <div className="mb-8">
          <XPProgress totalXP={buddy.total_xp} tier={buddy.tier} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-lg font-bold mb-4">Stats</h2>
            <StatRadar
              baseStats={buddy.base_stats as Record<string, number>}
              statGrowth={buddy.stat_growth as Record<string, number>}
            />
            <div className="text-center text-xs text-gray-500 mt-2">
              <span className="text-blue-400">■</span> Base
              <span className="text-green-400 ml-3">■</span> With Growth
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-4">Lifetime</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Sessions</span><span>{stats.totalSessions || 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Tool Calls</span><span>{stats.totalToolCalls || 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">File Edits</span><span>{stats.fileEdits || 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Test Runs</span><span>{stats.testRuns || 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Output Tokens</span><span>{formatXP(stats.totalOutputTokens || 0)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Streak</span><span>{buddy.streak_days > 0 ? `🔥 ${buddy.streak_days}d` : '-'}</span></div>
            </div>
          </div>
        </div>

        {(() => {
          const earnedKeys = checkAchievements({
            tier: buddy.tier,
            shiny: buddy.shiny,
            rarity: buddy.rarity,
            streak_days: buddy.streak_days,
            lifetime_stats: buddy.lifetime_stats as Record<string, number>,
            stat_growth: buddy.stat_growth as Record<string, number>,
            base_stats: buddy.base_stats as Record<string, number>,
          })
          const earnedAchievements = ACHIEVEMENTS.filter(a => earnedKeys.includes(a.key))
          if (earnedAchievements.length === 0) return null
          return (
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-4">Achievements</h2>
              <div className="flex flex-wrap gap-2">
                {earnedAchievements.map(a => (
                  <div key={a.key} className="bg-gray-900 rounded-full px-3 py-1 text-sm flex items-center gap-1" title={a.description}>
                    <span>{a.icon}</span>
                    <span>{a.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}
      </div>
    </main>
  )
}
