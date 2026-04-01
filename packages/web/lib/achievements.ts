export interface AchievementDef {
  key: string
  name: string
  description: string
  icon: string
  category: 'milestone' | 'streak' | 'usage' | 'rare'
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { key: 'first_session', name: 'First Steps', description: 'Complete your first session', icon: '👣', category: 'milestone' },
  { key: 'juvenile', name: 'Growing Up', description: 'Reach Juvenile tier', icon: '⚡', category: 'milestone' },
  { key: 'adult', name: 'Coming of Age', description: 'Reach Adult tier', icon: '🌟', category: 'milestone' },
  { key: 'elder', name: 'Ancient Power', description: 'Reach Elder tier', icon: '👑', category: 'milestone' },
  { key: 'ascended', name: 'Transcendence', description: 'Reach Ascended tier', icon: '✨', category: 'milestone' },
  { key: 'streak_7', name: 'Week Warrior', description: '7-day streak', icon: '🔥', category: 'streak' },
  { key: 'streak_30', name: 'Monthly Devotion', description: '30-day streak', icon: '💎', category: 'streak' },
  { key: 'tool_1000', name: 'Tool Master', description: '1,000 tool calls', icon: '🔧', category: 'usage' },
  { key: 'debug_100', name: 'Bug Hunter', description: 'DEBUGGING stat reaches 100', icon: '🐛', category: 'usage' },
  { key: 'shiny', name: 'Lucky Star', description: 'Own a shiny buddy', icon: '⭐', category: 'rare' },
  { key: 'legendary', name: 'One in a Hundred', description: 'Legendary rarity buddy', icon: '🏆', category: 'rare' },
  { key: 'million_tokens', name: 'Token Millionaire', description: '1M output tokens', icon: '💰', category: 'usage' },
]

export function checkAchievements(buddy: {
  tier: string
  shiny: boolean
  rarity: string
  streak_days: number
  lifetime_stats: Record<string, number>
  stat_growth: Record<string, number>
  base_stats: Record<string, number>
}): string[] {
  const earned: string[] = []
  const stats = buddy.lifetime_stats

  if ((stats.totalSessions || 0) >= 1) earned.push('first_session')
  if (['juvenile', 'adult', 'elder', 'ascended'].includes(buddy.tier)) earned.push('juvenile')
  if (['adult', 'elder', 'ascended'].includes(buddy.tier)) earned.push('adult')
  if (['elder', 'ascended'].includes(buddy.tier)) earned.push('elder')
  if (buddy.tier === 'ascended') earned.push('ascended')
  if (buddy.streak_days >= 7) earned.push('streak_7')
  if (buddy.streak_days >= 30) earned.push('streak_30')
  if ((stats.totalToolCalls || 0) >= 1000) earned.push('tool_1000')
  if (Math.round((buddy.base_stats?.DEBUGGING || 0) + (buddy.stat_growth?.DEBUGGING || 0)) >= 100) earned.push('debug_100')
  if (buddy.shiny) earned.push('shiny')
  if (buddy.rarity === 'legendary') earned.push('legendary')
  if ((stats.totalOutputTokens || 0) >= 1_000_000) earned.push('million_tokens')

  return earned
}
