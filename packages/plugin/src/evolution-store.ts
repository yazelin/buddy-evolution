import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { getEvolutionStatePath, getDataDir } from './paths.js'
import { createDefaultEvolutionState } from '@buddy-evolution/core'
import type { EvolutionState } from '@buddy-evolution/core'

export function loadEvolutionState(): EvolutionState {
  const filePath = getEvolutionStatePath()
  if (!existsSync(filePath)) {
    return createDefaultEvolutionState()
  }

  try {
    const raw = readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as EvolutionState
  } catch {
    return createDefaultEvolutionState()
  }
}

export function saveEvolutionState(state: EvolutionState): void {
  const dir = getDataDir()
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  writeFileSync(getEvolutionStatePath(), JSON.stringify(state, null, 2), 'utf-8')
}
