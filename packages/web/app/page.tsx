import { createSupabaseClient } from '@/lib/supabase'

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
  if (xp >= 1_000_000) return `${(xp / 1_000_000).toFixed(1)}M`
  if (xp >= 1_000) return `${(xp / 1_000).toFixed(1)}K`
  return String(xp)
}

interface BuddyRow {
  github_username: string
  species: string
  rarity: string
  shiny: boolean
  total_xp: number
  tier: string
  companion_name: string
  streak_days: number
}

export default async function Home() {
  const supabase = createSupabaseClient()
  const { data: buddies } = await supabase
    .from('buddies')
    .select('github_username, species, rarity, shiny, total_xp, tier, companion_name, streak_days')
    .order('total_xp', { ascending: false })
    .limit(20)

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 font-mono">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <pre className="text-green-400 text-sm mb-4 text-left inline-block">{`
   .----.
  ( ·  · )   buddy evolution
  (      )   ═══════════════
   \`----´    your pet grows with you
          `}</pre>
          <p className="text-gray-400 mt-4">
            Install the plugin. Use Claude Code. Watch your buddy evolve.
          </p>
          <div className="mt-6 flex gap-4 justify-center">
            <a href="/login" className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded">Sign in</a>
            <a href="/achievements" className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded">Achievements</a>
          </div>
        </header>

        <section>
          <h2 className="text-xl font-bold mb-6 text-center">Leaderboard</h2>
          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-sm">#</th>
                  <th className="px-4 py-3 text-left text-sm">Buddy</th>
                  <th className="px-4 py-3 text-left text-sm">Tier</th>
                  <th className="px-4 py-3 text-right text-sm">XP</th>
                  <th className="px-4 py-3 text-right text-sm">Streak</th>
                </tr>
              </thead>
              <tbody>
                {(buddies as BuddyRow[] || []).map((b, i) => (
                  <tr key={b.github_username} className="border-t border-gray-800 hover:bg-gray-900/50">
                    <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3">
                      <a href={`/u/${b.github_username}`} className="hover:text-green-400">
                        {SPECIES_ICONS[b.species] || '🐾'}{' '}
                        <span className="font-bold">{b.companion_name}</span>{' '}
                        <span className="text-gray-500">@{b.github_username}</span>
                        {b.shiny && <span className="ml-1 text-yellow-400">✦</span>}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      {TIER_ICONS[b.tier] || ''} {b.tier}
                    </td>
                    <td className="px-4 py-3 text-right text-green-400">{formatXP(b.total_xp)}</td>
                    <td className="px-4 py-3 text-right">
                      {b.streak_days > 0 ? `🔥${b.streak_days}d` : '-'}
                    </td>
                  </tr>
                ))}
                {(!buddies || buddies.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-600">
                      No buddies yet. Be the first to sync!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
