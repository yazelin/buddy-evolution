'use client'

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase'

export default function SettingsPage() {
  const [token, setToken] = useState<string | null>(null)
  const [userId, setUserId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function generateToken() {
    setLoading(true)
    try {
      const supabase = createSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        alert('Not logged in. Please sign in first.')
        window.location.href = '/login'
        return
      }
      const res = await fetch('/api/auth/token', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      if (data.token) {
        setToken(data.token)
        setUserId(data.userId)
      } else {
        alert(data.error || 'Failed to generate token')
      }
    } finally {
      setLoading(false)
    }
  }

  function copyConfig() {
    const config = JSON.stringify({
      userId,
      apiToken: token,
      platformUrl: window.location.origin,
      companionName: 'Buddy',
    }, null, 2)
    navigator.clipboard.writeText(config)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 font-mono">
      <div className="max-w-xl mx-auto px-4 py-16">
        <a href="/" className="text-gray-500 hover:text-gray-300 mb-8 block">&larr; Back</a>
        <h1 className="text-2xl font-bold mb-8">Plugin Setup</h1>

        <div className="space-y-6">
          <div>
            <h2 className="font-bold mb-2">Step 1: Generate a plugin token</h2>
            <button
              onClick={generateToken}
              disabled={loading}
              className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded"
            >
              {loading ? 'Generating...' : 'Generate Token'}
            </button>
          </div>

          {token && (
            <div>
              <h2 className="font-bold mb-2">Step 2: Save this config</h2>
              <p className="text-gray-400 text-sm mb-2">
                Save this to <code className="text-green-400">$CLAUDE_PLUGIN_DATA/sync-config.json</code>:
              </p>
              <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
{JSON.stringify({ userId, apiToken: token, platformUrl: typeof window !== 'undefined' ? window.location.origin : '', companionName: 'Buddy' }, null, 2)}
              </pre>
              <button
                onClick={copyConfig}
                className="mt-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-sm"
              >
                {copied ? 'Copied!' : 'Copy to clipboard'}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
