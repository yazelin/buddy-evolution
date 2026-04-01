import { describe, it, expect } from 'vitest'
import { renderProgressBar, renderStatBar, formatXP, renderEvoStatus, renderEvoStats } from '../src/display.js'
import { createDefaultEvolutionState } from '@buddy-evolution/core'
import type { CompanionBones, EvolutionState } from '@buddy-evolution/core'

const MOCK_BONES: CompanionBones = {
  species: 'duck',
  rarity: 'uncommon',
  eye: '·',
  hat: 'crown',
  shiny: false,
  stats: { DEBUGGING: 45, PATIENCE: 30, CHAOS: 20, WISDOM: 35, SNARK: 15 },
  inspirationSeed: 12345,
}

describe('renderProgressBar', () => {
  it('should render 0% correctly', () => {
    const bar = renderProgressBar(0, 100000, 16)
    expect(bar).toContain('░')
    expect(bar).not.toContain('█')
  })

  it('should render 50% correctly', () => {
    const bar = renderProgressBar(50000, 100000, 16)
    const filled = (bar.match(/█/g) || []).length
    expect(filled).toBe(8)
  })

  it('should render 100% as all filled', () => {
    const bar = renderProgressBar(100000, 100000, 16)
    const filled = (bar.match(/█/g) || []).length
    expect(filled).toBe(16)
  })
})

describe('formatXP', () => {
  it('should format small numbers as-is', () => {
    expect(formatXP(999)).toBe('999')
  })

  it('should format thousands with comma', () => {
    expect(formatXP(1000)).toBe('1,000')
  })

  it('should format millions', () => {
    expect(formatXP(1234567)).toBe('1,234,567')
  })
})

describe('renderStatBar', () => {
  it('should render stat with base and growth', () => {
    const output = renderStatBar('DEBUGGING', 45, 23.5)
    expect(output).toContain('DEBUGGING')
    // getEffectiveStat(45, 23.5) = Math.round(68.5) = 69 in JS
    expect(output).toContain('69')
    expect(output).toContain('+24')
  })
})

describe('renderEvoStatus', () => {
  it('should return multi-line string with sprite and info', () => {
    const state = createDefaultEvolutionState()
    state.totalXP = 50000
    const output = renderEvoStatus(MOCK_BONES, state, 'Quackers')
    expect(output).toContain('Quackers')
    expect(output).toContain('Hatchling')
    expect(output).toContain('50,000')
  })
})

describe('renderEvoStats', () => {
  it('should render lifetime stats', () => {
    const state = createDefaultEvolutionState()
    state.lifetimeStats.totalSessions = 15
    state.lifetimeStats.totalToolCalls = 420
    state.lifetimeStats.fileEdits = 210
    const output = renderEvoStats(state)
    expect(output).toContain('15')
    expect(output).toContain('420')
    expect(output).toContain('210')
  })
})
