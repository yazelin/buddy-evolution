import { createSupabaseClient } from '@/lib/supabase'
import { NavButtons } from '@/components/nav-buttons'

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
          <NavButtons />
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

        <section className="mt-16">
          <h2 className="text-xl font-bold mb-8 text-center">Getting Started</h2>
          <ol className="space-y-6">
            <li className="flex gap-4">
              <span className="text-green-400 font-bold text-lg shrink-0 w-6">1.</span>
              <div className="min-w-0">
                <p className="font-bold mb-2">Install the plugin</p>
                <div className="bg-gray-900 rounded px-4 py-3 text-sm text-gray-300 space-y-1">
                  <p>/plugin marketplace add yazelin/buddy-evolution</p>
                  <p>/plugin install buddy-evolution@buddy-evolution</p>
                </div>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-green-400 font-bold text-lg shrink-0 w-6">2.</span>
              <div className="min-w-0">
                <p className="font-bold mb-2">Import your buddy</p>
                <div className="bg-gray-900 rounded px-4 py-3 text-sm text-gray-300">
                  <p>/buddy-evolution:evo setup</p>
                </div>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-green-400 font-bold text-lg shrink-0 w-6">3.</span>
              <div className="min-w-0">
                <p className="font-bold mb-2">Use Claude Code normally</p>
                <p className="text-sm text-gray-400">Hooks automatically track your tool calls, file edits, test runs, and tokens.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-green-400 font-bold text-lg shrink-0 w-6">4.</span>
              <div className="min-w-0">
                <p className="font-bold mb-2">Check your progress</p>
                <div className="bg-gray-900 rounded px-4 py-3 text-sm text-gray-300">
                  <p>/buddy-evolution:evo</p>
                </div>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-green-400 font-bold text-lg shrink-0 w-6">5.</span>
              <div className="min-w-0">
                <p className="font-bold mb-2">Sync to the platform <span className="text-gray-500 font-normal">(optional)</span></p>
                <p className="text-sm text-gray-400 mb-2">Sign in above, get a token, then:</p>
                <div className="bg-gray-900 rounded px-4 py-3 text-sm text-gray-300">
                  <p>/buddy-evolution:evo sync</p>
                </div>
              </div>
            </li>
          </ol>
        </section>

        <footer className="mt-20 pt-8 border-t border-gray-800 text-center text-sm text-gray-600 space-y-2">
          <div className="flex gap-6 justify-center">
            <a
              href="https://github.com/yazelin/buddy-evolution"
              className="hover:text-gray-400 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://github.com/anthropics/claude-code/issues/41684"
              className="hover:text-gray-400 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Original PoC Issue
            </a>
          </div>
          <p>buddy evolution — grow together</p>
        </footer>
      </div>
    </main>
  )
}
