#!/usr/bin/env node

import { rollCompanionBones, processSessionEnd } from '@buddy-evolution/core'
import type { CompanionBones } from '@buddy-evolution/core'
import { loadEvolutionState, saveEvolutionState } from './evolution-store.js'
import { renderEvoStatus, renderEvoStats } from './display.js'
import { readFileSync, existsSync } from 'node:fs'
import { getSyncConfigPath } from './paths.js'

interface SyncConfig {
  userId: string
  apiToken: string
  platformUrl: string
  companionName: string
  customBones?: CompanionBones
}

function loadSyncConfig(): SyncConfig | null {
  const path = getSyncConfigPath()
  if (!existsSync(path)) return null
  try {
    return JSON.parse(readFileSync(path, 'utf-8'))
  } catch {
    return null
  }
}

function getBones(config: SyncConfig | null): CompanionBones {
  if (config?.customBones) return config.customBones
  return rollCompanionBones(config?.userId || 'default-user')
}

async function handleSync(): Promise<void> {
  const config = loadSyncConfig()
  if (!config || !config.apiToken) {
    console.log('  Not configured. Visit the platform to get your sync token.')
    console.log('  Then run: /evo sync <token>')
    return
  }

  const state = loadEvolutionState()
  const bones = getBones(config)

  try {
    const res = await fetch(`${config.platformUrl}/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiToken}`,
      },
      body: JSON.stringify({
        bones,
        evolution: state,
        companionName: config.companionName,
        githubUsername: config.userId,
      }),
    })

    if (res.ok) {
      console.log('  Synced to platform!')
      console.log(`  Profile: ${config.platformUrl}/u/${config.userId}`)
    } else {
      console.log(`  Sync failed: ${res.status} ${res.statusText}`)
    }
  } catch (err) {
    console.log(`  Sync failed: ${err instanceof Error ? err.message : 'network error'}`)
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const subcommand = args[0] || 'status'

  const config = loadSyncConfig()
  const companionName = config?.companionName || 'Buddy'
  const bones = getBones(config)
  const state = loadEvolutionState()

  switch (subcommand) {
    case 'status':
      console.log(renderEvoStatus(bones, state, companionName))
      break

    case 'stats':
      console.log(renderEvoStats(state))
      break

    case 'sync':
      await handleSync()
      break

    default:
      console.log('Usage: /evo [status|stats|sync]')
      break
  }
}

main().catch(console.error)
