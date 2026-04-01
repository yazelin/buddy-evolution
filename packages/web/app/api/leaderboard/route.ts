import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100)
  const offset = (page - 1) * limit

  const supabase = createSupabaseClient()
  const { data, error, count } = await supabase
    .from('buddies')
    .select('github_username, species, rarity, shiny, total_xp, tier, companion_name, streak_days', { count: 'exact' })
    .order('total_xp', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }

  return NextResponse.json({ data, total: count, page, limit })
}
