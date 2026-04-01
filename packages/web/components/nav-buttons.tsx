'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'

export function NavButtons() {
  const [user, setUser] = useState<{ username: string } | null>(null)

  useEffect(() => {
    const supabase = createSupabaseClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const username = session.user.user_metadata?.user_name || session.user.email
        setUser({ username })
      }
    })
  }, [])

  if (user) {
    return (
      <div className="mt-6 flex gap-4 justify-center">
        <a href={`/u/${user.username}`} className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded">
          My Profile
        </a>
        <a href={`/achievements?user=${user.username}`} className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded">
          My Achievements
        </a>
        <a href="/settings" className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded">
          Settings
        </a>
      </div>
    )
  }

  return (
    <div className="mt-6 flex gap-4 justify-center">
      <a href="/login" className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded">Sign in</a>
      <a href="/achievements" className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded">Achievements</a>
    </div>
  )
}
