'use client'

import { createSupabaseClient } from '@/lib/supabase'

export default function LoginPage() {
  async function handleLogin() {
    const supabase = createSupabaseClient()
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 font-mono flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Sign in to Buddy Evolution</h1>
        <p className="text-gray-400 mb-8">Connect with GitHub to sync your buddy</p>
        <button
          onClick={handleLogin}
          className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-mono"
        >
          Sign in with GitHub
        </button>
      </div>
    </main>
  )
}
