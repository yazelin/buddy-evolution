import { ACHIEVEMENTS, checkAchievements } from '@/lib/achievements'
import { createSupabaseClient } from '@/lib/supabase'

export default async function AchievementsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { user } = await searchParams
  const username = typeof user === 'string' ? user : undefined

  const categories = ['milestone', 'streak', 'usage', 'rare'] as const
  const categoryNames = { milestone: 'Milestones', streak: 'Streaks', usage: 'Usage', rare: 'Rare' }

  let earnedKeys: string[] = []
  let totalAchievements = ACHIEVEMENTS.length

  if (username) {
    const supabase = createSupabaseClient()
    const { data: buddy } = await supabase
      .from('buddies')
      .select('*')
      .eq('github_username', username)
      .single()

    if (buddy) {
      earnedKeys = checkAchievements({
        tier: buddy.tier,
        shiny: buddy.shiny,
        rarity: buddy.rarity,
        streak_days: buddy.streak_days,
        lifetime_stats: buddy.lifetime_stats as Record<string, number>,
        stat_growth: buddy.stat_growth as Record<string, number>,
        base_stats: buddy.base_stats as Record<string, number>,
      })
    }
  }

  const isPersonalized = username !== undefined

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 font-mono">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <a href="/" className="text-gray-500 hover:text-gray-300 mb-8 block">&larr; Back</a>

        <div className="flex items-baseline justify-between mb-8">
          <h1 className="text-2xl font-bold">Achievements</h1>
          {isPersonalized && (
            <span className="text-sm text-gray-400">
              <span className="text-gray-100">{earnedKeys.length}</span>
              <span className="text-gray-500">/{totalAchievements} unlocked</span>
              {username && (
                <span className="text-gray-500 ml-2">for @{username}</span>
              )}
            </span>
          )}
        </div>

        {categories.map(cat => (
          <div key={cat} className="mb-8">
            <h2 className="text-lg font-bold mb-4 text-gray-400">{categoryNames[cat]}</h2>
            <div className="grid grid-cols-1 gap-3">
              {ACHIEVEMENTS.filter(a => a.category === cat).map(a => {
                const earned = isPersonalized ? earnedKeys.includes(a.key) : true
                return (
                  <div
                    key={a.key}
                    className={`flex items-center gap-4 rounded-lg px-4 py-3 ${
                      earned
                        ? 'bg-gray-900'
                        : 'bg-gray-900/40 opacity-50'
                    }`}
                  >
                    <span className={`text-2xl ${!earned && isPersonalized ? 'grayscale' : ''}`}>
                      {!earned && isPersonalized ? '🔒' : a.icon}
                    </span>
                    <div className="flex-1">
                      <div className={`font-bold ${!earned && isPersonalized ? 'text-gray-500' : ''}`}>
                        {a.name}
                      </div>
                      <div className="text-sm text-gray-500">{a.description}</div>
                    </div>
                    {earned && isPersonalized && (
                      <span className="text-xs text-green-400 shrink-0">unlocked</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
