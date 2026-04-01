#!/usr/bin/env node

import { rollCompanionBones } from '@buddy-evolution/core'
import type { CompanionBones } from '@buddy-evolution/core'
import { loadEvolutionState } from './evolution-store.js'
import { renderEvoStatus, renderEvoStats } from './display.js'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { getSyncConfigPath, getDataDir } from './paths.js'

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

function saveSyncConfig(config: SyncConfig): void {
  const dir = getDataDir()
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  writeFileSync(getSyncConfigPath(), JSON.stringify(config, null, 2), 'utf-8')
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

function handleSetup(jsonArg: string): void {
  if (!jsonArg) {
    console.log('  Usage: /evo setup \'<JSON>\'')
    console.log('  Example: /evo setup \'{"species":"blob","rarity":"epic","eye":"✦","hat":"none","shiny":false,"stats":{"DEBUGGING":27,"PATIENCE":72,"CHAOS":49,"WISDOM":100,"SNARK":70},"name":"Zephyrost"}\'')
    return
  }

  let data: any
  try {
    data = JSON.parse(jsonArg)
  } catch {
    console.log('  Error: Invalid JSON')
    return
  }

  const { species, rarity, eye, hat, shiny, stats, name } = data

  if (!species || !rarity || !eye || !stats) {
    console.log('  Error: Missing required fields (species, rarity, eye, stats)')
    return
  }

  const customBones: CompanionBones = {
    species,
    rarity,
    eye,
    hat: hat || 'none',
    shiny: shiny || false,
    stats: {
      DEBUGGING: stats.DEBUGGING || 0,
      PATIENCE: stats.PATIENCE || 0,
      CHAOS: stats.CHAOS || 0,
      WISDOM: stats.WISDOM || 0,
      SNARK: stats.SNARK || 0,
    },
    inspirationSeed: 0,
  }

  const config: SyncConfig = loadSyncConfig() || {
    userId: '',
    apiToken: '',
    platformUrl: 'https://buddy-evolution-web.vercel.app',
    companionName: name || 'Buddy',
  }

  config.customBones = customBones
  if (name) config.companionName = name
  saveSyncConfig(config)

  console.log(`  Buddy imported: ${name || species} the ${species.charAt(0).toUpperCase() + species.slice(1)}`)
  console.log(`  Rarity: ${rarity}, Eye: ${eye}, Shiny: ${shiny || false}`)
  console.log(`  Stats: DEBUG=${stats.DEBUGGING} PAT=${stats.PATIENCE} CHAOS=${stats.CHAOS} WIS=${stats.WISDOM} SNARK=${stats.SNARK}`)
  console.log('')
  console.log('  Run /evo to see your buddy!')
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

    case 'setup':
      handleSetup(args.slice(1).join(' '))
      break

    default:
      console.log('Usage: /evo [status|stats|sync|setup]')
      break
  }
}

main().catch(console.error)
