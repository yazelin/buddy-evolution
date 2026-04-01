import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'node:crypto'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing access token' }, { status: 401 })
  }

  const accessToken = authHeader.slice(7)

  // Use service role to verify the user and write to plugin_tokens
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // Verify the access token by getting the user
  const { data: { user }, error: authErr } = await supabase.auth.getUser(accessToken)

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
