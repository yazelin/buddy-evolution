#!/usr/bin/env node

import { processSessionEnd } from '@buddy-evolution/core'
import { parseTranscript } from './transcript-parser.js'
import { finalizeSession } from './accumulator.js'
import { loadEvolutionState, saveEvolutionState } from './evolution-store.js'
import { readFileSync, existsSync, unlinkSync } from 'node:fs'
import { getSessionPath, getSyncConfigPath } from './paths.js'
import { rollCompanionBones } from '@buddy-evolution/core'

async function main(): Promise<void> {
  let hookInput: { transcript_path?: string } = {}
  try {
    const stdin = readFileSync(0, 'utf-8')
    hookInput = JSON.parse(stdin)
  } catch {
    // No stdin or invalid JSON
  }

  const transcriptPath = hookInput.transcript_path || ''
  const tokens = parseTranscript(transcriptPath)

  const metrics = finalizeSession(tokens.outputTokens, tokens.inputTokens)
  if (!metrics) return

  const currentState = loadEvolutionState()
  const result = processSessionEnd(currentState, metrics)
  saveEvolutionState(result.newState)

  const sessionPath = getSessionPath()
  if (existsSync(sessionPath)) {
    unlinkSync(sessionPath)
  }

  // Auto-sync (silent failure)
  try {
    const configPath = getSyncConfigPath()
    if (existsSync(configPath)) {
      const config = JSON.parse(readFileSync(configPath, 'utf-8'))
      if (config.apiToken && config.platformUrl) {
        const bones = rollCompanionBones(config.userId || 'default-user')
        await fetch(`${config.platformUrl}/api/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiToken}`,
          },
          body: JSON.stringify({
            bones,
            evolution: result.newState,
            companionName: config.companionName || 'Buddy',
          }),
        }).catch(() => {})
      }
    }
  } catch {
    // Silent failure
  }

  if (result.tierChanged) {
    const tier = result.newState.tier
    console.error(`[buddy-evo] Evolved to ${tier}! (+${result.xpGained} XP)`)
  }
}

main().catch(() => {})
