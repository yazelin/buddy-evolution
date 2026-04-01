import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { loadEvolutionState, saveEvolutionState } from '../src/evolution-store.js'
import { createDefaultEvolutionState } from '@buddy-evolution/core'
import { rmSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const TEST_DIR = join(tmpdir(), 'buddy-evo-test-store')

beforeEach(() => {
  mkdirSync(TEST_DIR, { recursive: true })
  process.env.CLAUDE_PLUGIN_DATA = TEST_DIR
})

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true })
  delete process.env.CLAUDE_PLUGIN_DATA
})

describe('loadEvolutionState', () => {
  it('should return default state when file does not exist', () => {
    const state = loadEvolutionState()
    expect(state.totalXP).toBe(0)
    expect(state.tier).toBe('hatchling')
  })

  it('should load saved state', () => {
    const state = createDefaultEvolutionState()
    state.totalXP = 150000
    state.tier = 'juvenile'
    saveEvolutionState(state)

    const loaded = loadEvolutionState()
    expect(loaded.totalXP).toBe(150000)
    expect(loaded.tier).toBe('juvenile')
  })
})

describe('saveEvolutionState', () => {
  it('should persist state to disk', () => {
    const state = createDefaultEvolutionState()
    state.totalXP = 42
    saveEvolutionState(state)

    const loaded = loadEvolutionState()
    expect(loaded.totalXP).toBe(42)
  })

  it('should overwrite existing state', () => {
    const state1 = createDefaultEvolutionState()
    state1.totalXP = 100
    saveEvolutionState(state1)

    const state2 = createDefaultEvolutionState()
    state2.totalXP = 200
    saveEvolutionState(state2)

    const loaded = loadEvolutionState()
    expect(loaded.totalXP).toBe(200)
  })
})
