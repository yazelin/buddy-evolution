import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 })
  }

  const token = authHeader.slice(7)

  const supabase = createSupabaseClient()

  // Look up user by plugin token
  const { data: tokenRow, error: tokenErr } = await supabase
    .from('plugin_tokens')
    .select('user_id')
    .eq('token', token)
    .single()

  if (tokenErr || !tokenRow) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const userId = tokenRow.user_id

  // Parse body
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { bones, evolution, companionName } = body
  if (!bones || !evolution) {
    return NextResponse.json({ error: 'Missing bones or evolution' }, { status: 400 })
  }

  // We need github_username - fetch from plugin_tokens join or use a default
  // For now, use userId as fallback since we can't access auth.admin from anon key
  const githubUsername = body.githubUsername || userId

  // Upsert buddy
  const { error: upsertErr } = await supabase
    .from('buddies')
    .upsert({
      user_id: userId,
      github_username: githubUsername,
      species: bones.species,
      rarity: bones.rarity,
      eye: bones.eye,
      hat: bones.hat,
      shiny: bones.shiny || false,
      base_stats: bones.stats,
      companion_name: companionName || 'Buddy',
      total_xp: evolution.totalXP,
      tier: evolution.tier,
      stat_growth: evolution.statGrowth,
      streak_days: evolution.streak?.currentDays || 0,
      lifetime_stats: evolution.lifetimeStats,
      evolved_at: evolution.evolvedAt,
      last_synced_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

  if (upsertErr) {
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, username: githubUsername })
}
