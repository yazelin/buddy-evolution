import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'
import { randomBytes } from 'node:crypto'

export async function POST(req: NextRequest) {
  const supabase = createSupabaseClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const token = randomBytes(32).toString('hex')

  const { error } = await supabase
    .from('plugin_tokens')
    .upsert({
      user_id: user.id,
      token,
    }, { onConflict: 'user_id' })

  if (error) {
    return NextResponse.json({ error: 'Failed to create token' }, { status: 500 })
  }

  return NextResponse.json({
    token,
    userId: user.user_metadata?.user_name || user.id,
  })
}
