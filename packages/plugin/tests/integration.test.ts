import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { initSession, recordToolUse, recordToolFailure, recordCompact, finalizeSession } from '../src/accumulator.js'
import { loadEvolutionState, saveEvolutionState } from '../src/evolution-store.js'
import { parseTranscript } from '../src/transcript-parser.js'
import { renderEvoStatus } from '../src/display.js'
import { processSessionEnd, createDefaultEvolutionState, rollCompanionBones } from '@buddy-evolution/core'

const TEST_DIR = join(tmpdir(), 'buddy-evo-test-e2e')

beforeEach(() => {
  mkdirSync(TEST_DIR, { recursive: true })
  process.env.CLAUDE_PLUGIN_DATA = TEST_DIR
})

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true })
  delete process.env.CLAUDE_PLUGIN_DATA
})

describe('full session lifecycle', () => {
  it('should track a session and evolve the buddy', () => {
    // 1. Start session
    initSession()

    // 2. Simulate tool usage during session
    recordToolUse('Edit', { file_path: '/tmp/app.ts' })
    recordToolUse('Edit', { file_path: '/tmp/test.ts' })
    recordToolUse('Bash', { command: 'npm test' })
    recordToolUse('Bash', { command: 'ls -la' })
    recordToolFailure()
    recordCompact()

    // 3. Create fake transcript
    const transcriptPath = join(TEST_DIR, 'transcript.jsonl')
    const transcriptLines = [
      { type: 'assistant', message: { usage: { input_tokens: 5000, output_tokens: 10000 } } },
      { type: 'assistant', message: { usage: { input_tokens: 3000, output_tokens: 8000 } } },
    ]
    writeFileSync(transcriptPath, transcriptLines.map(l => JSON.stringify(l)).join('\n'))

    // 4. Parse transcript
    const tokens = parseTranscript(transcriptPath)
    expect(tokens.inputTokens).toBe(8000)
    expect(tokens.outputTokens).toBe(18000)

    // 5. Finalize session
    const metrics = finalizeSession(tokens.outputTokens, tokens.inputTokens)
    expect(metrics).not.toBeNull()
    expect(metrics!.toolCalls).toBe(4)
    expect(metrics!.fileEdits).toBe(2)
    expect(metrics!.testRuns).toBe(1)
    expect(metrics!.rejectedToolCalls).toBe(1)
    expect(metrics!.contextResets).toBe(1)

    // 6. Process evolution
    const currentState = loadEvolutionState()
    const result = processSessionEnd(currentState, metrics!)
    saveEvolutionState(result.newState)

    // 7. Verify state
    const savedState = loadEvolutionState()
    expect(savedState.totalXP).toBeGreaterThan(0)
    expect(savedState.lifetimeStats.totalSessions).toBe(1)
    expect(savedState.lifetimeStats.totalToolCalls).toBe(4)
    expect(savedState.streak.currentDays).toBe(1)

    // 8. Verify display renders without error
    const bones = rollCompanionBones('test-user')
    const output = renderEvoStatus(bones, savedState, 'TestBuddy')
    expect(output).toContain('TestBuddy')
    expect(output.length).toBeGreaterThan(0)
  })

  it('should accumulate across multiple sessions', () => {
    // Session 1
    initSession()
    recordToolUse('Edit', { file_path: '/tmp/a.ts' })
    let metrics = finalizeSession(5000, 2000)!
    let state = loadEvolutionState()
    let result = processSessionEnd(state, metrics)
    saveEvolutionState(result.newState)

    const xpAfterFirst = result.newState.totalXP

    // Session 2
    initSession()
    recordToolUse('Bash', { command: 'npm test' })
    recordToolUse('Edit', { file_path: '/tmp/b.ts' })
    metrics = finalizeSession(8000, 3000)!
    state = loadEvolutionState()
    result = processSessionEnd(state, metrics)
    saveEvolutionState(result.newState)

    expect(result.newState.totalXP).toBeGreaterThan(xpAfterFirst)
    expect(result.newState.lifetimeStats.totalSessions).toBe(2)
  })
})
