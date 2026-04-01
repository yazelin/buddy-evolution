import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  initSession, recordToolUse, recordToolFailure, recordCompact,
  readSessionState, finalizeSession,
} from '../src/accumulator.js'
import { rmSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const TEST_DIR = join(tmpdir(), 'buddy-evo-test-accum')

beforeEach(() => {
  mkdirSync(TEST_DIR, { recursive: true })
  process.env.CLAUDE_PLUGIN_DATA = TEST_DIR
})

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true })
  delete process.env.CLAUDE_PLUGIN_DATA
})

describe('initSession', () => {
  it('should create current-session.json with start time', () => {
    initSession()
    const state = readSessionState()
    expect(state).not.toBeNull()
    expect(state!.startTime).toBeGreaterThan(0)
    expect(state!.toolCalls).toBe(0)
    expect(state!.fileEdits).toBe(0)
  })
})

describe('recordToolUse', () => {
  it('should increment toolCalls', () => {
    initSession()
    recordToolUse('Bash', { command: 'ls' })
    const state = readSessionState()
    expect(state!.toolCalls).toBe(1)
  })

  it('should increment fileEdits for Edit tool', () => {
    initSession()
    recordToolUse('Edit', { file_path: '/tmp/test.ts' })
    const state = readSessionState()
    expect(state!.toolCalls).toBe(1)
    expect(state!.fileEdits).toBe(1)
  })

  it('should increment fileEdits for Write tool', () => {
    initSession()
    recordToolUse('Write', { file_path: '/tmp/test.ts' })
    const state = readSessionState()
    expect(state!.fileEdits).toBe(1)
  })

  it('should increment testRuns for Bash with test command', () => {
    initSession()
    recordToolUse('Bash', { command: 'npm test' })
    const state = readSessionState()
    expect(state!.testRuns).toBe(1)
  })

  it('should detect vitest as test command', () => {
    initSession()
    recordToolUse('Bash', { command: 'npx vitest run' })
    const state = readSessionState()
    expect(state!.testRuns).toBe(1)
  })

  it('should detect pytest as test command', () => {
    initSession()
    recordToolUse('Bash', { command: 'python -m pytest tests/' })
    const state = readSessionState()
    expect(state!.testRuns).toBe(1)
  })

  it('should not count non-test bash commands as test runs', () => {
    initSession()
    recordToolUse('Bash', { command: 'ls -la' })
    const state = readSessionState()
    expect(state!.testRuns).toBe(0)
  })
})

describe('recordToolFailure', () => {
  it('should increment rejectedToolCalls', () => {
    initSession()
    recordToolFailure()
    recordToolFailure()
    const state = readSessionState()
    expect(state!.rejectedToolCalls).toBe(2)
  })
})

describe('recordCompact', () => {
  it('should increment contextResets', () => {
    initSession()
    recordCompact()
    const state = readSessionState()
    expect(state!.contextResets).toBe(1)
  })
})

describe('finalizeSession', () => {
  it('should produce SessionMetrics with duration', () => {
    initSession()
    recordToolUse('Edit', { file_path: '/tmp/x.ts' })
    recordToolUse('Bash', { command: 'npm test' })
    recordToolFailure()

    const metrics = finalizeSession(100, 50)
    expect(metrics).not.toBeNull()
    expect(metrics!.toolCalls).toBe(2)
    expect(metrics!.fileEdits).toBe(1)
    expect(metrics!.testRuns).toBe(1)
    expect(metrics!.rejectedToolCalls).toBe(1)
    expect(metrics!.outputTokens).toBe(100)
    expect(metrics!.inputTokens).toBe(50)
    expect(metrics!.sessionDurationMinutes).toBeGreaterThanOrEqual(0)
    expect(metrics!.sessionDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('should return null if no session exists', () => {
    const metrics = finalizeSession(0, 0)
    expect(metrics).toBeNull()
  })
})
