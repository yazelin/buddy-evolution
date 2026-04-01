import { ACHIEVEMENTS } from '@/lib/achievements'

export default function AchievementsPage() {
  const categories = ['milestone', 'streak', 'usage', 'rare'] as const
  const categoryNames = { milestone: 'Milestones', streak: 'Streaks', usage: 'Usage', rare: 'Rare' }

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 font-mono">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <a href="/" className="text-gray-500 hover:text-gray-300 mb-8 block">&larr; Back</a>
        <h1 className="text-2xl font-bold mb-8">Achievements</h1>

        {categories.map(cat => (
          <div key={cat} className="mb-8">
            <h2 className="text-lg font-bold mb-4 text-gray-400">{categoryNames[cat]}</h2>
            <div className="grid grid-cols-1 gap-3">
              {ACHIEVEMENTS.filter(a => a.category === cat).map(a => (
                <div key={a.key} className="flex items-center gap-4 bg-gray-900 rounded-lg px-4 py-3">
                  <span className="text-2xl">{a.icon}</span>
                  <div>
                    <div className="font-bold">{a.name}</div>
                    <div className="text-sm text-gray-400">{a.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
