# Buddy Evolution System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Claude Code plugin that tracks usage metrics to evolve the `/buddy` companion pet, plus a web platform for leaderboards and profiles.

**Architecture:** Monorepo with 3 packages — `core` (shared evolution engine, copied from PoC), `plugin` (Claude Code plugin with hooks + `/evo` skill), `web` (Next.js + Supabase platform). Hooks track tool calls/edits/test runs in real-time, SessionEnd hook parses transcript for token counts, computes XP and stat growth, persists to `$CLAUDE_PLUGIN_DATA`. The `/evo` skill renders evolved sprites in-terminal. Platform receives sync uploads and displays leaderboards/profiles.

**Tech Stack:** TypeScript, pnpm workspaces, Turborepo, Vitest, Node.js 20+, Next.js 15, Tailwind CSS 4, Supabase (Postgres + Auth), Vercel

**Reference:** PoC source at `/tmp/buddy-evolution/src/`, spec at `/home/ct/SDD/buddy-evolution/docs/2026-04-01-buddy-evolution-design.md`

---

## Phase 1: Plugin MVP

### Task 1: Monorepo scaffold

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Create: `.gitignore`
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/core/vitest.config.ts`
- Create: `packages/plugin/package.json`
- Create: `packages/plugin/tsconfig.json`

- [ ] **Step 1: Create root package.json**

```json
{
  "name": "buddy-evolution",
  "private": true,
  "packageManager": "pnpm@9.15.4",
  "scripts": {
    "build": "turbo build",
    "test": "turbo test",
    "typecheck": "turbo typecheck"
  },
  "devDependencies": {
    "turbo": "^2.4.0",
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 2: Create pnpm-workspace.yaml**

```yaml
packages:
  - "packages/*"
```

- [ ] **Step 3: Create turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

- [ ] **Step 4: Create .gitignore**

```
node_modules/
dist/
.turbo/
*.tsbuildinfo
```

- [ ] **Step 5: Create packages/core/package.json**

```json
{
  "name": "@buddy-evolution/core",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 6: Create packages/core/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "sourceMap": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["src/**/*.ts"]
}
```

- [ ] **Step 7: Create packages/core/vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['tests/**/*.test.ts'],
  },
})
```

- [ ] **Step 8: Create packages/plugin/package.json**

```json
{
  "name": "@buddy-evolution/plugin",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@buddy-evolution/core": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 9: Create packages/plugin/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "sourceMap": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["src/**/*.ts"]
}
```

- [ ] **Step 10: Install dependencies and verify**

Run: `cd /home/ct/SDD/buddy-evolution && pnpm install`
Expected: Dependencies installed, node_modules created

- [ ] **Step 11: Commit**

```bash
git add package.json pnpm-workspace.yaml turbo.json .gitignore packages/core/package.json packages/core/tsconfig.json packages/core/vitest.config.ts packages/plugin/package.json packages/plugin/tsconfig.json
git commit -m "chore: scaffold monorepo with core and plugin packages"
```

---

### Task 2: Copy PoC core engine into packages/core

**Files:**
- Create: `packages/core/src/types.ts` (from PoC)
- Create: `packages/core/src/evolution-types.ts` (from PoC)
- Create: `packages/core/src/xp.ts` (from PoC)
- Create: `packages/core/src/stats.ts` (from PoC)
- Create: `packages/core/src/evolution.ts` (from PoC)
- Create: `packages/core/src/companion.ts` (from PoC)
- Create: `packages/core/src/sprites.ts` (from PoC)
- Create: `packages/core/src/evolution-sprites.ts` (from PoC)
- Create: `packages/core/src/index.ts` (barrel export)
- Create: `packages/core/tests/xp.test.ts` (from PoC)
- Create: `packages/core/tests/stats.test.ts` (from PoC)
- Create: `packages/core/tests/evolution.test.ts` (from PoC)

- [ ] **Step 1: Copy source files from PoC**

Copy each file from `/tmp/buddy-evolution/src/` to `packages/core/src/`:
- `types.ts`
- `evolution-types.ts`
- `xp.ts`
- `stats.ts`
- `evolution.ts`
- `companion.ts`
- `sprites.ts`
- `evolution-sprites.ts`

All files are used verbatim — no modifications needed.

- [ ] **Step 2: Create barrel export**

Create `packages/core/src/index.ts`:

```typescript
export * from './types.js'
export * from './evolution-types.js'
export * from './xp.js'
export * from './stats.js'
export * from './evolution.js'
export * from './companion.js'
export * from './sprites.js'
export * from './evolution-sprites.js'
```

- [ ] **Step 3: Copy test files from PoC**

Copy from `/tmp/buddy-evolution/tests/` to `packages/core/tests/`:
- `xp.test.ts`
- `stats.test.ts`
- `evolution.test.ts`

Update import paths from `'../src/xp.js'` to `'../src/xp.js'` (same relative path — no change needed since directory structure matches).

- [ ] **Step 4: Run tests to verify**

Run: `cd /home/ct/SDD/buddy-evolution && pnpm --filter @buddy-evolution/core test`
Expected: All tests pass (same tests as PoC, 40+ passing)

- [ ] **Step 5: Build to verify compilation**

Run: `pnpm --filter @buddy-evolution/core build`
Expected: `packages/core/dist/` created with `.js` and `.d.ts` files

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/ packages/core/tests/
git commit -m "feat: add core evolution engine from PoC"
```

---

### Task 3: Transcript parser

**Files:**
- Create: `packages/plugin/src/transcript-parser.ts`
- Create: `packages/plugin/tests/transcript-parser.test.ts`
- Create: `packages/plugin/vitest.config.ts`

- [ ] **Step 1: Create vitest config for plugin**

Create `packages/plugin/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['tests/**/*.test.ts'],
  },
})
```

- [ ] **Step 2: Write the failing test**

Create `packages/plugin/tests/transcript-parser.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { parseTranscript } from '../src/transcript-parser.js'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const TEST_DIR = join(tmpdir(), 'buddy-evo-test-transcript')

function setup() {
  mkdirSync(TEST_DIR, { recursive: true })
}

function cleanup() {
  rmSync(TEST_DIR, { recursive: true, force: true })
}

function writeJsonl(filename: string, lines: unknown[]): string {
  const path = join(TEST_DIR, filename)
  writeFileSync(path, lines.map(l => JSON.stringify(l)).join('\n'), 'utf-8')
  return path
}

describe('parseTranscript', () => {
  beforeEach(setup)
  afterEach(cleanup)

  it('should extract token counts from usage fields', () => {
    const path = writeJsonl('t1.jsonl', [
      { type: 'assistant', message: { usage: { input_tokens: 1000, output_tokens: 500 } } },
      { type: 'assistant', message: { usage: { input_tokens: 2000, output_tokens: 800 } } },
    ])
    const result = parseTranscript(path)
    expect(result.inputTokens).toBe(3000)
    expect(result.outputTokens).toBe(1300)
  })

  it('should skip lines without usage', () => {
    const path = writeJsonl('t2.jsonl', [
      { type: 'user', message: { content: 'hello' } },
      { type: 'assistant', message: { usage: { input_tokens: 500, output_tokens: 200 } } },
      { type: 'tool_result', content: 'done' },
    ])
    const result = parseTranscript(path)
    expect(result.inputTokens).toBe(500)
    expect(result.outputTokens).toBe(200)
  })

  it('should return zeros for non-existent file', () => {
    const result = parseTranscript('/nonexistent/path.jsonl')
    expect(result.inputTokens).toBe(0)
    expect(result.outputTokens).toBe(0)
  })

  it('should return zeros for malformed JSONL', () => {
    const path = writeJsonl('t3.jsonl', [])
    writeFileSync(path, 'not json\nalso not json\n', 'utf-8')
    const result = parseTranscript(path)
    expect(result.inputTokens).toBe(0)
    expect(result.outputTokens).toBe(0)
  })

  it('should handle mixed valid and invalid lines', () => {
    const path = join(TEST_DIR, 't4.jsonl')
    const content = [
      'invalid line',
      JSON.stringify({ type: 'assistant', message: { usage: { input_tokens: 100, output_tokens: 50 } } }),
      'another bad line',
    ].join('\n')
    writeFileSync(path, content, 'utf-8')
    const result = parseTranscript(path)
    expect(result.inputTokens).toBe(100)
    expect(result.outputTokens).toBe(50)
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd /home/ct/SDD/buddy-evolution && pnpm --filter @buddy-evolution/plugin test`
Expected: FAIL — `parseTranscript` not found

- [ ] **Step 4: Write implementation**

Create `packages/plugin/src/transcript-parser.ts`:

```typescript
import { readFileSync, existsSync } from 'node:fs'

export interface TranscriptTokens {
  inputTokens: number
  outputTokens: number
}

export function parseTranscript(filePath: string): TranscriptTokens {
  if (!existsSync(filePath)) {
    return { inputTokens: 0, outputTokens: 0 }
  }

  let inputTokens = 0
  let outputTokens = 0

  try {
    const content = readFileSync(filePath, 'utf-8')
    const lines = content.split('\n').filter(l => l.trim())

    for (const line of lines) {
      try {
        const entry = JSON.parse(line)
        const usage = entry?.message?.usage
        if (usage) {
          inputTokens += Number(usage.input_tokens) || 0
          outputTokens += Number(usage.output_tokens) || 0
        }
      } catch {
        // Skip unparseable lines
      }
    }
  } catch {
    // File read error — return zeros
  }

  return { inputTokens, outputTokens }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm --filter @buddy-evolution/plugin test`
Expected: All 5 tests PASS

- [ ] **Step 6: Commit**

```bash
git add packages/plugin/src/transcript-parser.ts packages/plugin/tests/transcript-parser.test.ts packages/plugin/vitest.config.ts
git commit -m "feat(plugin): add transcript parser for token count extraction"
```

---

### Task 4: Session accumulator (file-based, for hooks)

**Files:**
- Create: `packages/plugin/src/paths.ts`
- Create: `packages/plugin/src/accumulator.ts`
- Create: `packages/plugin/tests/accumulator.test.ts`

- [ ] **Step 1: Write paths module**

Create `packages/plugin/src/paths.ts`:

```typescript
import { join } from 'node:path'

export function getDataDir(): string {
  const pluginData = process.env.CLAUDE_PLUGIN_DATA
  if (pluginData) return pluginData
  // Fallback for development/testing
  return join(process.env.HOME || '/tmp', '.buddy-evolution')
}

export function getSessionPath(): string {
  return join(getDataDir(), 'current-session.json')
}

export function getEvolutionStatePath(): string {
  return join(getDataDir(), 'evolution-state.json')
}

export function getSyncConfigPath(): string {
  return join(getDataDir(), 'sync-config.json')
}
```

- [ ] **Step 2: Write the failing test**

Create `packages/plugin/tests/accumulator.test.ts`:

```typescript
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

    const metrics = finalizeSession(100, 50) // token counts from transcript
    expect(metrics.toolCalls).toBe(2)
    expect(metrics.fileEdits).toBe(1)
    expect(metrics.testRuns).toBe(1)
    expect(metrics.rejectedToolCalls).toBe(1)
    expect(metrics.outputTokens).toBe(100)
    expect(metrics.inputTokens).toBe(50)
    expect(metrics.sessionDurationMinutes).toBeGreaterThanOrEqual(0)
    expect(metrics.sessionDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('should return null if no session exists', () => {
    const metrics = finalizeSession(0, 0)
    expect(metrics).toBeNull()
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm --filter @buddy-evolution/plugin test`
Expected: FAIL — accumulator module not found

- [ ] **Step 4: Write implementation**

Create `packages/plugin/src/accumulator.ts`:

```typescript
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { getSessionPath, getDataDir } from './paths.js'
import type { SessionMetrics } from '@buddy-evolution/core'

const TEST_PATTERNS = [
  /\btest\b/i,
  /\bvitest\b/i,
  /\bjest\b/i,
  /\bpytest\b/i,
  /\bmocha\b/i,
  /\bcargo\s+test\b/i,
  /\bgo\s+test\b/i,
]

export interface SessionState {
  startTime: number
  toolCalls: number
  fileEdits: number
  testRuns: number
  rejectedToolCalls: number
  forceSnips: number
  contextResets: number
}

function ensureDataDir(): void {
  const dir = getDataDir()
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

export function initSession(): void {
  ensureDataDir()
  const state: SessionState = {
    startTime: Date.now(),
    toolCalls: 0,
    fileEdits: 0,
    testRuns: 0,
    rejectedToolCalls: 0,
    forceSnips: 0,
    contextResets: 0,
  }
  writeFileSync(getSessionPath(), JSON.stringify(state), 'utf-8')
}

export function readSessionState(): SessionState | null {
  const path = getSessionPath()
  if (!existsSync(path)) return null
  try {
    return JSON.parse(readFileSync(path, 'utf-8'))
  } catch {
    return null
  }
}

function updateSession(updater: (state: SessionState) => void): void {
  const state = readSessionState()
  if (!state) return
  updater(state)
  writeFileSync(getSessionPath(), JSON.stringify(state), 'utf-8')
}

function isTestCommand(command: string): boolean {
  return TEST_PATTERNS.some(p => p.test(command))
}

export function recordToolUse(toolName: string, toolInput: Record<string, unknown>): void {
  updateSession(state => {
    state.toolCalls++

    if (toolName === 'Edit' || toolName === 'Write' || toolName === 'NotebookEdit') {
      state.fileEdits++
    }

    if (toolName === 'Bash' && typeof toolInput.command === 'string') {
      if (isTestCommand(toolInput.command)) {
        state.testRuns++
      }
    }
  })
}

export function recordToolFailure(): void {
  updateSession(state => {
    state.rejectedToolCalls++
  })
}

export function recordCompact(): void {
  updateSession(state => {
    state.contextResets++
  })
}

export function finalizeSession(
  outputTokens: number,
  inputTokens: number,
): SessionMetrics | null {
  const state = readSessionState()
  if (!state) return null

  const durationMs = Date.now() - state.startTime
  const durationMinutes = Math.floor(durationMs / 60000)

  return {
    outputTokens,
    inputTokens,
    toolCalls: state.toolCalls,
    rejectedToolCalls: state.rejectedToolCalls,
    sessionDurationMinutes: durationMinutes,
    fileEdits: state.fileEdits,
    testRuns: state.testRuns,
    forceSnips: state.forceSnips,
    contextResets: state.contextResets,
    sessionDate: new Date().toISOString().slice(0, 10),
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm --filter @buddy-evolution/plugin test`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add packages/plugin/src/paths.ts packages/plugin/src/accumulator.ts packages/plugin/tests/accumulator.test.ts
git commit -m "feat(plugin): add session accumulator for hook-based metric tracking"
```

---

### Task 5: Evolution store (plugin-specific persistence)

**Files:**
- Create: `packages/plugin/src/evolution-store.ts`
- Create: `packages/plugin/tests/evolution-store.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/plugin/tests/evolution-store.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @buddy-evolution/plugin test`
Expected: FAIL — module not found

- [ ] **Step 3: Write implementation**

Create `packages/plugin/src/evolution-store.ts`:

```typescript
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @buddy-evolution/plugin test`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add packages/plugin/src/evolution-store.ts packages/plugin/tests/evolution-store.test.ts
git commit -m "feat(plugin): add evolution state persistence layer"
```

---

### Task 6: Display renderer (terminal output)

**Files:**
- Create: `packages/plugin/src/display.ts`
- Create: `packages/plugin/tests/display.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/plugin/tests/display.test.ts`:

```typescript
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
    expect(output).toContain('68')
    expect(output).toContain('+23')
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @buddy-evolution/plugin test`
Expected: FAIL — module not found

- [ ] **Step 3: Write implementation**

Create `packages/plugin/src/display.ts`:

```typescript
import {
  type CompanionBones, type EvolutionState, type StatName,
  STAT_NAMES, TIER_THRESHOLDS, EVOLUTION_TIERS,
  renderEvolvedSprite, getEffectiveStat, getStreakMultiplier,
} from '@buddy-evolution/core'

export function formatXP(xp: number): string {
  return xp.toLocaleString('en-US')
}

export function renderProgressBar(current: number, max: number, width: number): string {
  const ratio = Math.min(1, Math.max(0, current / max))
  const filled = Math.round(ratio * width)
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

export function renderStatBar(stat: StatName, base: number, growth: number): string {
  const effective = getEffectiveStat(base, growth)
  const bar = renderProgressBar(effective, 200, 20)
  const growthStr = growth >= 0.5 ? ` (+${Math.round(growth)})` : ''
  return `  ${stat.padEnd(10)} ${bar} ${effective}${growthStr}`
}

function getNextTier(currentTier: string): { tier: string; threshold: number } | null {
  const idx = EVOLUTION_TIERS.indexOf(currentTier as any)
  if (idx < 0 || idx >= EVOLUTION_TIERS.length - 1) return null
  const next = EVOLUTION_TIERS[idx + 1]
  return { tier: next, threshold: TIER_THRESHOLDS[next] }
}

const TIER_ICONS: Record<string, string> = {
  hatchling: '🥚',
  juvenile: '⚡',
  adult: '🌟',
  elder: '👑',
  ascended: '✨',
}

const SPECIES_ICONS: Record<string, string> = {
  duck: '🦆', goose: '🪿', blob: '🫧', cat: '🐱', dragon: '🐉',
  octopus: '🐙', owl: '🦉', penguin: '🐧', turtle: '🐢', snail: '🐌',
  ghost: '👻', axolotl: '🦎', capybara: '🦫', cactus: '🌵', robot: '🤖',
  rabbit: '🐰', mushroom: '🍄', chonk: '🐈',
}

export function renderEvoStatus(
  bones: CompanionBones,
  state: EvolutionState,
  companionName: string,
): string {
  const sprite = renderEvolvedSprite(bones, state, 0)
  const speciesIcon = SPECIES_ICONS[bones.species] || '🐾'
  const tierIcon = TIER_ICONS[state.tier] || ''
  const tierName = state.tier.charAt(0).toUpperCase() + state.tier.slice(1)

  const next = getNextTier(state.tier)
  const nextThreshold = next ? next.threshold : state.totalXP
  const currentThreshold = TIER_THRESHOLDS[state.tier]
  const progressInTier = state.totalXP - currentThreshold
  const tierRange = nextThreshold - currentThreshold

  const progressBar = renderProgressBar(progressInTier, tierRange, 16)
  const progressPct = tierRange > 0
    ? ((progressInTier / tierRange) * 100).toFixed(1)
    : '100.0'

  const streakMult = getStreakMultiplier(state.streak.currentDays)
  const streakStr = state.streak.currentDays > 0
    ? `🔥 ${state.streak.currentDays} days (${streakMult.toFixed(1)}x)`
    : 'None'

  // Build right panel
  const info = [
    `${speciesIcon} ${companionName || 'Unknown'} the ${bones.species.charAt(0).toUpperCase() + bones.species.slice(1)}`,
    '══════════════════════',
    `Tier: ${tierName} ${tierIcon}`,
    `XP: ${formatXP(state.totalXP)} / ${formatXP(nextThreshold)}`,
    `${progressBar} ${progressPct}%`,
    ``,
    `Rarity: ${bones.rarity.charAt(0).toUpperCase() + bones.rarity.slice(1)}   Streak: ${streakStr}`,
  ]

  // Merge sprite (left) with info (right)
  const lines: string[] = []
  const maxLines = Math.max(sprite.length, info.length)
  for (let i = 0; i < maxLines; i++) {
    const left = (sprite[i] || '').padEnd(28)
    const right = info[i] || ''
    lines.push(`${left}${right}`)
  }

  // Stat bars
  lines.push('')
  for (const stat of STAT_NAMES) {
    lines.push(renderStatBar(stat, bones.stats[stat], state.statGrowth[stat]))
  }

  // Next evolution hint
  if (next) {
    const remaining = nextThreshold - state.totalXP
    lines.push('')
    lines.push(`  Next evolution at ${formatXP(nextThreshold)} XP — ${formatXP(remaining)} to go!`)
  } else {
    lines.push('')
    lines.push('  Max evolution reached!')
  }

  return lines.join('\n')
}

export function renderEvoStats(state: EvolutionState): string {
  const s = state.lifetimeStats
  const lines = [
    '  Lifetime Stats',
    '  ─────────────────────',
    `  Sessions: ${s.totalSessions} (${s.totalSessionMinutes} min total)`,
    `  Tool Calls: ${s.totalToolCalls} (${s.rejectedToolCalls} rejected)`,
    `  File Edits: ${s.fileEdits}`,
    `  Test Runs: ${s.testRuns}`,
    `  Tokens: ${formatXP(s.totalOutputTokens)} output / ${formatXP(s.totalInputTokens)} input`,
    `  Context Resets: ${s.contextResets}`,
    `  Force Snips: ${s.forceSnips}`,
  ]
  return lines.join('\n')
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @buddy-evolution/plugin test`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add packages/plugin/src/display.ts packages/plugin/tests/display.test.ts
git commit -m "feat(plugin): add terminal display renderer for /evo output"
```

---

### Task 7: CLI entry point

**Files:**
- Create: `packages/plugin/src/cli.ts`

- [ ] **Step 1: Write CLI entry point**

Create `packages/plugin/src/cli.ts`:

```typescript
#!/usr/bin/env node

import { rollCompanionBones, processSessionEnd } from '@buddy-evolution/core'
import { loadEvolutionState, saveEvolutionState } from './evolution-store.js'
import { renderEvoStatus, renderEvoStats } from './display.js'
import { readFileSync, existsSync } from 'node:fs'
import { getSyncConfigPath } from './paths.js'

interface SyncConfig {
  userId: string
  apiToken: string
  platformUrl: string
  companionName: string
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

async function handleSync(): Promise<void> {
  const config = loadSyncConfig()
  if (!config || !config.apiToken) {
    console.log('  Not configured. Visit the platform to get your sync token.')
    console.log('  Then run: /evo sync <token>')
    return
  }

  const state = loadEvolutionState()
  const bones = rollCompanionBones(config.userId)

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
  const userId = config?.userId || 'default-user'
  const companionName = config?.companionName || 'Buddy'
  const bones = rollCompanionBones(userId)
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
```

- [ ] **Step 2: Build and verify**

Run: `pnpm --filter @buddy-evolution/core build && pnpm --filter @buddy-evolution/plugin build`
Expected: Both packages compile without errors

- [ ] **Step 3: Commit**

```bash
git add packages/plugin/src/cli.ts
git commit -m "feat(plugin): add CLI entry point for /evo slash command"
```

---

### Task 8: Hook scripts

**Files:**
- Create: `packages/plugin/hooks/on-session-start.sh`
- Create: `packages/plugin/hooks/on-tool-use.sh`
- Create: `packages/plugin/hooks/on-tool-fail.sh`
- Create: `packages/plugin/hooks/on-compact.sh`
- Create: `packages/plugin/hooks/on-session-end.sh`
- Create: `packages/plugin/hooks/hooks.json`

- [ ] **Step 1: Create session-end processor**

This is the main Node.js script that hooks call for the heavy work. Create `packages/plugin/src/process-session-end.ts`:

```typescript
#!/usr/bin/env node

import { processSessionEnd } from '@buddy-evolution/core'
import { parseTranscript } from './transcript-parser.js'
import { finalizeSession } from './accumulator.js'
import { loadEvolutionState, saveEvolutionState } from './evolution-store.js'
import { readFileSync, existsSync, unlinkSync } from 'node:fs'
import { getSessionPath, getSyncConfigPath } from './paths.js'
import { rollCompanionBones } from '@buddy-evolution/core'

async function main(): Promise<void> {
  // Read hook input from stdin
  let hookInput: { transcript_path?: string } = {}
  try {
    const stdin = readFileSync(0, 'utf-8')
    hookInput = JSON.parse(stdin)
  } catch {
    // No stdin or invalid JSON — proceed without transcript
  }

  // 1. Parse transcript for token counts
  const transcriptPath = hookInput.transcript_path || ''
  const tokens = parseTranscript(transcriptPath)

  // 2. Finalize session metrics
  const metrics = finalizeSession(tokens.outputTokens, tokens.inputTokens)
  if (!metrics) return // No active session

  // 3. Load current evolution state
  const currentState = loadEvolutionState()

  // 4. Process session end
  const result = processSessionEnd(currentState, metrics)

  // 5. Save updated state
  saveEvolutionState(result.newState)

  // 6. Clean up session file
  const sessionPath = getSessionPath()
  if (existsSync(sessionPath)) {
    unlinkSync(sessionPath)
  }

  // 7. Auto-sync (silent failure)
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
        }).catch(() => {}) // Swallow network errors
      }
    }
  } catch {
    // Silent failure — sync is optional
  }

  // 8. Log tier change if it happened
  if (result.tierChanged) {
    const tier = result.newState.tier
    console.error(`[buddy-evo] Evolved to ${tier}! (+${result.xpGained} XP)`)
  }
}

main().catch(() => {})
```

- [ ] **Step 2: Create hook scripts**

Create `packages/plugin/hooks/on-session-start.sh`:

```bash
#!/bin/bash
node "$CLAUDE_PLUGIN_ROOT/dist/hooks/init-session.js" 2>/dev/null
exit 0
```

Create `packages/plugin/src/hooks/init-session.ts`:

```typescript
import { initSession } from '../accumulator.js'
initSession()
```

Create `packages/plugin/hooks/on-tool-use.sh`:

```bash
#!/bin/bash
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf-8'));console.log(d.tool_name||'')" 2>/dev/null)
TOOL_INPUT=$(echo "$INPUT" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf-8'));console.log(JSON.stringify(d.tool_input||{}))" 2>/dev/null)
node -e "
import { recordToolUse } from '$CLAUDE_PLUGIN_ROOT/dist/accumulator.js';
recordToolUse('$TOOL_NAME', $TOOL_INPUT);
" 2>/dev/null
exit 0
```

Actually, shell scripts calling Node inline is fragile. Better approach — create thin Node.js scripts that read stdin:

Create `packages/plugin/src/hooks/on-tool-use.ts`:

```typescript
import { readFileSync } from 'node:fs'
import { recordToolUse } from '../accumulator.js'

try {
  const input = JSON.parse(readFileSync(0, 'utf-8'))
  recordToolUse(input.tool_name || '', input.tool_input || {})
} catch {
  // Silent failure
}
```

Create `packages/plugin/src/hooks/on-tool-fail.ts`:

```typescript
import { recordToolFailure } from '../accumulator.js'
recordToolFailure()
```

Create `packages/plugin/src/hooks/on-compact.ts`:

```typescript
import { recordCompact } from '../accumulator.js'
recordCompact()
```

Create `packages/plugin/src/hooks/on-session-end.ts`:

```typescript
import '../process-session-end.js'
```

- [ ] **Step 3: Update hook shell scripts to use compiled Node**

Create `packages/plugin/hooks/on-session-start.sh`:

```bash
#!/bin/bash
node "$CLAUDE_PLUGIN_ROOT/dist/hooks/init-session.js" 2>/dev/null
exit 0
```

Create `packages/plugin/hooks/on-tool-use.sh`:

```bash
#!/bin/bash
node "$CLAUDE_PLUGIN_ROOT/dist/hooks/on-tool-use.js" 2>/dev/null
exit 0
```

Create `packages/plugin/hooks/on-tool-fail.sh`:

```bash
#!/bin/bash
node "$CLAUDE_PLUGIN_ROOT/dist/hooks/on-tool-fail.js" 2>/dev/null
exit 0
```

Create `packages/plugin/hooks/on-compact.sh`:

```bash
#!/bin/bash
node "$CLAUDE_PLUGIN_ROOT/dist/hooks/on-compact.js" 2>/dev/null
exit 0
```

Create `packages/plugin/hooks/on-session-end.sh`:

```bash
#!/bin/bash
node "$CLAUDE_PLUGIN_ROOT/dist/hooks/on-session-end.js" 2>/dev/null
exit 0
```

- [ ] **Step 4: Create hooks.json**

Create `packages/plugin/hooks/hooks.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PLUGIN_ROOT/hooks/on-session-start.sh\"",
            "timeout": 5
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash|Edit|Write|NotebookEdit",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PLUGIN_ROOT/hooks/on-tool-use.sh\"",
            "timeout": 3,
            "async": true
          }
        ]
      }
    ],
    "PostToolUseFailure": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PLUGIN_ROOT/hooks/on-tool-fail.sh\"",
            "timeout": 3,
            "async": true
          }
        ]
      }
    ],
    "PostCompact": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PLUGIN_ROOT/hooks/on-compact.sh\"",
            "timeout": 3,
            "async": true
          }
        ]
      }
    ],
    "SessionEnd": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PLUGIN_ROOT/hooks/on-session-end.sh\"",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

- [ ] **Step 5: Make shell scripts executable**

Run: `chmod +x packages/plugin/hooks/*.sh`

- [ ] **Step 6: Update tsconfig to include hooks directory**

Edit `packages/plugin/tsconfig.json` — update `rootDir` and `include`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "sourceMap": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["src/**/*.ts"]
}
```

- [ ] **Step 7: Build and verify**

Run: `pnpm --filter @buddy-evolution/core build && pnpm --filter @buddy-evolution/plugin build`
Expected: `packages/plugin/dist/` contains compiled hooks and CLI

- [ ] **Step 8: Commit**

```bash
git add packages/plugin/hooks/ packages/plugin/src/hooks/ packages/plugin/src/process-session-end.ts
git commit -m "feat(plugin): add hook scripts for session tracking"
```

---

### Task 9: Plugin manifest and skill definition

**Files:**
- Create: `packages/plugin/plugin.json`
- Create: `packages/plugin/skills/evo/skill.md`

- [ ] **Step 1: Create plugin.json**

Create `packages/plugin/plugin.json`:

```json
{
  "name": "buddy-evolution",
  "version": "0.1.0",
  "description": "RPG evolution system for /buddy — pets grow from actual usage",
  "skills": ["skills/evo"],
  "hooks": "hooks/hooks.json"
}
```

- [ ] **Step 2: Create skill.md**

Create `packages/plugin/skills/evo/skill.md`:

```markdown
---
name: evo
description: Show your buddy's evolution status, sync to platform, or view detailed stats
argument: "[sync|stats]"
---

You are the buddy evolution viewer. Run the appropriate command based on the user's request.

When the user runs `/evo` (no arguments or "status"), run:
```
node "$CLAUDE_PLUGIN_ROOT/dist/cli.js" status
```

When the user runs `/evo stats`, run:
```
node "$CLAUDE_PLUGIN_ROOT/dist/cli.js" stats
```

When the user runs `/evo sync`, run:
```
node "$CLAUDE_PLUGIN_ROOT/dist/cli.js" sync
```

Display the output to the user exactly as printed. Do not modify or interpret the output.
```

- [ ] **Step 3: Commit**

```bash
git add packages/plugin/plugin.json packages/plugin/skills/
git commit -m "feat(plugin): add plugin manifest and /evo skill definition"
```

---

### Task 10: End-to-end integration test

**Files:**
- Create: `packages/plugin/tests/integration.test.ts`

- [ ] **Step 1: Write integration test**

Create `packages/plugin/tests/integration.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run integration tests**

Run: `pnpm --filter @buddy-evolution/plugin test`
Expected: All tests PASS including integration

- [ ] **Step 3: Run all tests across monorepo**

Run: `pnpm test`
Expected: All tests across core and plugin pass

- [ ] **Step 4: Commit**

```bash
git add packages/plugin/tests/integration.test.ts
git commit -m "test(plugin): add end-to-end integration tests for session lifecycle"
```

---

## Phase 2: Platform MVP

### Task 11: Next.js app scaffold

**Files:**
- Create: `packages/web/` (via create-next-app)
- Modify: `packages/web/package.json`

- [ ] **Step 1: Create Next.js app**

Run:
```bash
cd /home/ct/SDD/buddy-evolution/packages && pnpm create next-app@latest web --typescript --tailwind --app --eslint --no-src-dir --import-alias "@/*" --no-turbopack
```

- [ ] **Step 2: Add core dependency**

Edit `packages/web/package.json` to add:
```json
{
  "dependencies": {
    "@buddy-evolution/core": "workspace:*"
  }
}
```

Run: `cd /home/ct/SDD/buddy-evolution && pnpm install`

- [ ] **Step 3: Verify it builds**

Run: `pnpm --filter @buddy-evolution/web build`
Expected: Next.js builds successfully

- [ ] **Step 4: Commit**

```bash
git add packages/web/
git commit -m "feat(web): scaffold Next.js app with Tailwind"
```

---

### Task 12: Supabase setup and DB schema

**Files:**
- Create: `packages/web/lib/supabase.ts`
- Create: `packages/web/supabase/schema.sql`
- Create: `packages/web/.env.local.example`

- [ ] **Step 1: Create schema SQL**

Create `packages/web/supabase/schema.sql`:

```sql
-- Buddy evolution state (one per user, upserted on sync)
create table if not exists buddies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  github_username text not null,

  -- Companion bones (deterministic, for display)
  species text not null,
  rarity text not null,
  eye text not null,
  hat text not null,
  shiny boolean default false,
  base_stats jsonb not null default '{}',
  companion_name text default 'Buddy',

  -- Evolution state
  total_xp bigint default 0,
  tier text default 'hatchling',
  stat_growth jsonb default '{}',
  streak_days int default 0,

  -- Lifetime stats
  lifetime_stats jsonb default '{}',

  -- Timestamps
  evolved_at jsonb default '{}',
  last_synced_at timestamptz default now(),
  created_at timestamptz default now(),

  unique(user_id)
);

-- Achievements earned by buddies
create table if not exists achievements (
  id uuid primary key default gen_random_uuid(),
  buddy_id uuid references buddies(id) on delete cascade not null,
  achievement_key text not null,
  unlocked_at timestamptz default now(),
  unique(buddy_id, achievement_key)
);

-- Plugin auth tokens (one per user)
create table if not exists plugin_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  token text not null unique,
  created_at timestamptz default now(),
  unique(user_id)
);

-- RLS policies
alter table buddies enable row level security;
alter table achievements enable row level security;
alter table plugin_tokens enable row level security;

-- Buddies: anyone can read, only owner can write
create policy "buddies_select" on buddies for select using (true);
create policy "buddies_insert" on buddies for insert with check (auth.uid() = user_id);
create policy "buddies_update" on buddies for update using (auth.uid() = user_id);

-- Achievements: anyone can read
create policy "achievements_select" on achievements for select using (true);

-- Plugin tokens: only owner
create policy "plugin_tokens_all" on plugin_tokens for all using (auth.uid() = user_id);

-- Leaderboard view
create or replace view leaderboard as
  select
    github_username,
    species,
    rarity,
    shiny,
    total_xp,
    tier,
    companion_name,
    streak_days
  from buddies
  order by total_xp desc;
```

- [ ] **Step 2: Create Supabase client helper**

Create `packages/web/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

export function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export function createSupabaseServerClient(serviceRoleKey: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
  )
}
```

- [ ] **Step 3: Create .env.local.example**

Create `packages/web/.env.local.example`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

- [ ] **Step 4: Install supabase dependency**

Run: `cd /home/ct/SDD/buddy-evolution && pnpm --filter @buddy-evolution/web add @supabase/supabase-js @supabase/ssr`

- [ ] **Step 5: Commit**

```bash
git add packages/web/supabase/ packages/web/lib/supabase.ts packages/web/.env.local.example
git commit -m "feat(web): add Supabase schema and client setup"
```

---

### Task 13: Sync API route

**Files:**
- Create: `packages/web/app/api/sync/route.ts`

- [ ] **Step 1: Write sync API**

Create `packages/web/app/api/sync/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 })
  }

  const token = authHeader.slice(7)

  const supabase = createSupabaseClient()

  // Look up user by plugin token
  const { data: tokenRow, error: tokenErr } = await supabase
    .from('plugin_tokens')
    .select('user_id')
    .eq('token', token)
    .single()

  if (tokenErr || !tokenRow) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const userId = tokenRow.user_id

  // Get GitHub username from auth.users
  const { data: { user }, error: userErr } = await supabase.auth.admin.getUserById(userId)
  if (userErr || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const githubUsername = user.user_metadata?.user_name || user.email || 'unknown'

  // Parse body
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { bones, evolution, companionName } = body
  if (!bones || !evolution) {
    return NextResponse.json({ error: 'Missing bones or evolution' }, { status: 400 })
  }

  // Upsert buddy
  const { error: upsertErr } = await supabase
    .from('buddies')
    .upsert({
      user_id: userId,
      github_username: githubUsername,
      species: bones.species,
      rarity: bones.rarity,
      eye: bones.eye,
      hat: bones.hat,
      shiny: bones.shiny || false,
      base_stats: bones.stats,
      companion_name: companionName || 'Buddy',
      total_xp: evolution.totalXP,
      tier: evolution.tier,
      stat_growth: evolution.statGrowth,
      streak_days: evolution.streak?.currentDays || 0,
      lifetime_stats: evolution.lifetimeStats,
      evolved_at: evolution.evolvedAt,
      last_synced_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

  if (upsertErr) {
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, username: githubUsername })
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/web/app/api/sync/route.ts
git commit -m "feat(web): add sync API route for plugin uploads"
```

---

### Task 14: Leaderboard API and page

**Files:**
- Create: `packages/web/app/api/leaderboard/route.ts`
- Modify: `packages/web/app/page.tsx`

- [ ] **Step 1: Create leaderboard API**

Create `packages/web/app/api/leaderboard/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100)
  const offset = (page - 1) * limit

  const supabase = createSupabaseClient()
  const { data, error, count } = await supabase
    .from('buddies')
    .select('github_username, species, rarity, shiny, total_xp, tier, companion_name, streak_days', { count: 'exact' })
    .order('total_xp', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }

  return NextResponse.json({ data, total: count, page, limit })
}
```

- [ ] **Step 2: Create landing page with leaderboard**

Replace `packages/web/app/page.tsx`:

```typescript
import { createSupabaseClient } from '@/lib/supabase'

const TIER_ICONS: Record<string, string> = {
  hatchling: '🥚', juvenile: '⚡', adult: '🌟', elder: '👑', ascended: '✨',
}

const SPECIES_ICONS: Record<string, string> = {
  duck: '🦆', goose: '🪿', blob: '🫧', cat: '🐱', dragon: '🐉',
  octopus: '🐙', owl: '🦉', penguin: '🐧', turtle: '🐢', snail: '🐌',
  ghost: '👻', axolotl: '🦎', capybara: '🦫', cactus: '🌵', robot: '🤖',
  rabbit: '🐰', mushroom: '🍄', chonk: '🐈',
}

function formatXP(xp: number): string {
  if (xp >= 1_000_000) return `${(xp / 1_000_000).toFixed(1)}M`
  if (xp >= 1_000) return `${(xp / 1_000).toFixed(1)}K`
  return String(xp)
}

interface BuddyRow {
  github_username: string
  species: string
  rarity: string
  shiny: boolean
  total_xp: number
  tier: string
  companion_name: string
  streak_days: number
}

export default async function Home() {
  const supabase = createSupabaseClient()
  const { data: buddies } = await supabase
    .from('buddies')
    .select('github_username, species, rarity, shiny, total_xp, tier, companion_name, streak_days')
    .order('total_xp', { ascending: false })
    .limit(20)

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 font-mono">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <pre className="text-green-400 text-sm mb-4">{`
   .----.
  ( ·  · )   buddy evolution
  (      )   ═══════════════
   \`----´    your pet grows with you
          `}</pre>
          <p className="text-gray-400 mt-4">
            Install the plugin. Use Claude Code. Watch your buddy evolve.
          </p>
        </header>

        <section>
          <h2 className="text-xl font-bold mb-6 text-center">Leaderboard</h2>
          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-sm">#</th>
                  <th className="px-4 py-3 text-left text-sm">Buddy</th>
                  <th className="px-4 py-3 text-left text-sm">Tier</th>
                  <th className="px-4 py-3 text-right text-sm">XP</th>
                  <th className="px-4 py-3 text-right text-sm">Streak</th>
                </tr>
              </thead>
              <tbody>
                {(buddies as BuddyRow[] || []).map((b, i) => (
                  <tr key={b.github_username} className="border-t border-gray-800 hover:bg-gray-900/50">
                    <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3">
                      <a href={`/u/${b.github_username}`} className="hover:text-green-400">
                        {SPECIES_ICONS[b.species] || '🐾'}{' '}
                        <span className="font-bold">{b.companion_name}</span>{' '}
                        <span className="text-gray-500">@{b.github_username}</span>
                        {b.shiny && <span className="ml-1 text-yellow-400">✦</span>}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      {TIER_ICONS[b.tier] || ''} {b.tier}
                    </td>
                    <td className="px-4 py-3 text-right text-green-400">{formatXP(b.total_xp)}</td>
                    <td className="px-4 py-3 text-right">
                      {b.streak_days > 0 ? `🔥${b.streak_days}d` : '-'}
                    </td>
                  </tr>
                ))}
                {(!buddies || buddies.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-600">
                      No buddies yet. Be the first to sync!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/web/app/api/leaderboard/route.ts packages/web/app/page.tsx
git commit -m "feat(web): add leaderboard API and landing page"
```

---

### Task 15: Profile page

**Files:**
- Create: `packages/web/app/u/[username]/page.tsx`
- Create: `packages/web/components/stat-radar.tsx`
- Create: `packages/web/components/xp-progress.tsx`

- [ ] **Step 1: Create XP progress component**

Create `packages/web/components/xp-progress.tsx`:

```typescript
'use client'

const TIER_THRESHOLDS: Record<string, number> = {
  hatchling: 0, juvenile: 100_000, adult: 1_000_000,
  elder: 10_000_000, ascended: 100_000_000,
}

const TIER_ORDER = ['hatchling', 'juvenile', 'adult', 'elder', 'ascended']

function formatXP(xp: number): string {
  if (xp >= 1_000_000) return `${(xp / 1_000_000).toFixed(1)}M`
  if (xp >= 1_000) return `${(xp / 1_000).toFixed(1)}K`
  return String(xp)
}

export function XPProgress({ totalXP, tier }: { totalXP: number; tier: string }) {
  const idx = TIER_ORDER.indexOf(tier)
  const currentThreshold = TIER_THRESHOLDS[tier] || 0
  const nextTier = idx < TIER_ORDER.length - 1 ? TIER_ORDER[idx + 1] : null
  const nextThreshold = nextTier ? TIER_THRESHOLDS[nextTier] : totalXP

  const progress = nextTier
    ? ((totalXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100
    : 100

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-400 mb-1">
        <span>{formatXP(totalXP)} XP</span>
        <span>{nextTier ? `${formatXP(nextThreshold)} to ${nextTier}` : 'MAX'}</span>
      </div>
      <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full transition-all"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create stat radar component**

Create `packages/web/components/stat-radar.tsx`:

```typescript
'use client'

const STAT_NAMES = ['DEBUGGING', 'PATIENCE', 'CHAOS', 'WISDOM', 'SNARK'] as const

function getEffective(base: number, growth: number): number {
  return Math.min(200, Math.max(1, Math.round(base + growth)))
}

export function StatRadar({
  baseStats,
  statGrowth,
}: {
  baseStats: Record<string, number>
  statGrowth: Record<string, number>
}) {
  const size = 200
  const center = size / 2
  const radius = 80
  const angleStep = (2 * Math.PI) / STAT_NAMES.length
  const startAngle = -Math.PI / 2

  function getPoint(i: number, value: number, maxVal: number) {
    const angle = startAngle + i * angleStep
    const r = (value / maxVal) * radius
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) }
  }

  const basePoints = STAT_NAMES.map((s, i) => getPoint(i, baseStats[s] || 0, 200))
  const effectivePoints = STAT_NAMES.map((s, i) =>
    getPoint(i, getEffective(baseStats[s] || 0, statGrowth[s] || 0), 200),
  )

  const basePath = basePoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z'
  const effectivePath = effectivePoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z'

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[250px] mx-auto">
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map(scale => (
        <polygon
          key={scale}
          points={STAT_NAMES.map((_, i) => {
            const p = getPoint(i, scale * 200, 200)
            return `${p.x},${p.y}`
          }).join(' ')}
          fill="none"
          stroke="#374151"
          strokeWidth="0.5"
        />
      ))}
      {/* Axes */}
      {STAT_NAMES.map((_, i) => {
        const p = getPoint(i, 200, 200)
        return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#374151" strokeWidth="0.5" />
      })}
      {/* Base stats */}
      <path d={basePath} fill="rgba(59,130,246,0.2)" stroke="#3b82f6" strokeWidth="1" />
      {/* Effective stats */}
      <path d={effectivePath} fill="rgba(34,197,94,0.2)" stroke="#22c55e" strokeWidth="1.5" />
      {/* Labels */}
      {STAT_NAMES.map((name, i) => {
        const p = getPoint(i, 240, 200)
        return (
          <text key={name} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
            className="fill-gray-400 text-[8px]">
            {name}
          </text>
        )
      })}
    </svg>
  )
}
```

- [ ] **Step 3: Create profile page**

Create `packages/web/app/u/[username]/page.tsx`:

```typescript
import { createSupabaseClient } from '@/lib/supabase'
import { XPProgress } from '@/components/xp-progress'
import { StatRadar } from '@/components/stat-radar'
import { notFound } from 'next/navigation'

const TIER_ICONS: Record<string, string> = {
  hatchling: '🥚', juvenile: '⚡', adult: '🌟', elder: '👑', ascended: '✨',
}

const SPECIES_ICONS: Record<string, string> = {
  duck: '🦆', goose: '🪿', blob: '🫧', cat: '🐱', dragon: '🐉',
  octopus: '🐙', owl: '🦉', penguin: '🐧', turtle: '🐢', snail: '🐌',
  ghost: '👻', axolotl: '🦎', capybara: '🦫', cactus: '🌵', robot: '🤖',
  rabbit: '🐰', mushroom: '🍄', chonk: '🐈',
}

function formatXP(xp: number): string {
  return xp.toLocaleString('en-US')
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = createSupabaseClient()

  const { data: buddy, error } = await supabase
    .from('buddies')
    .select('*')
    .eq('github_username', username)
    .single()

  if (error || !buddy) {
    notFound()
  }

  const stats = buddy.lifetime_stats as Record<string, number> || {}

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 font-mono">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <a href="/" className="text-gray-500 hover:text-gray-300 mb-8 block">&larr; Back</a>

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">
            {SPECIES_ICONS[buddy.species] || '🐾'}
            {buddy.shiny && <span className="text-yellow-400"> ✦</span>}
          </div>
          <h1 className="text-2xl font-bold">
            {buddy.companion_name}
            <span className="text-gray-500 font-normal ml-2">@{buddy.github_username}</span>
          </h1>
          <div className="mt-2 text-lg">
            {TIER_ICONS[buddy.tier]} {buddy.tier.charAt(0).toUpperCase() + buddy.tier.slice(1)}
            <span className="text-gray-500 ml-3">{buddy.rarity}</span>
          </div>
        </div>

        <div className="mb-8">
          <XPProgress totalXP={buddy.total_xp} tier={buddy.tier} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-lg font-bold mb-4">Stats</h2>
            <StatRadar
              baseStats={buddy.base_stats as Record<string, number>}
              statGrowth={buddy.stat_growth as Record<string, number>}
            />
            <div className="text-center text-xs text-gray-500 mt-2">
              <span className="text-blue-400">■</span> Base
              <span className="text-green-400 ml-3">■</span> With Growth
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-4">Lifetime</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Sessions</span><span>{stats.totalSessions || 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Tool Calls</span><span>{stats.totalToolCalls || 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">File Edits</span><span>{stats.fileEdits || 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Test Runs</span><span>{stats.testRuns || 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Output Tokens</span><span>{formatXP(stats.totalOutputTokens || 0)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Streak</span><span>{buddy.streak_days > 0 ? `🔥 ${buddy.streak_days}d` : '-'}</span></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/web/app/u/ packages/web/components/
git commit -m "feat(web): add profile page with stat radar and XP progress"
```

---

### Task 16: Auth flow (GitHub OAuth + plugin token)

**Files:**
- Create: `packages/web/app/login/page.tsx`
- Create: `packages/web/app/auth/callback/route.ts`
- Create: `packages/web/app/settings/page.tsx`
- Create: `packages/web/app/api/auth/token/route.ts`

- [ ] **Step 1: Create login page**

Create `packages/web/app/login/page.tsx`:

```typescript
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
```

- [ ] **Step 2: Create auth callback**

Create `packages/web/app/auth/callback/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createSupabaseClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL('/settings', req.url))
}
```

- [ ] **Step 3: Create token generation API**

Create `packages/web/app/api/auth/token/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'
import { randomBytes } from 'node:crypto'

export async function POST(req: NextRequest) {
  const supabase = createSupabaseClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const token = randomBytes(32).toString('hex')

  // Upsert plugin token
  const { error } = await supabase
    .from('plugin_tokens')
    .upsert({
      user_id: user.id,
      token,
    }, { onConflict: 'user_id' })

  if (error) {
    return NextResponse.json({ error: 'Failed to create token' }, { status: 500 })
  }

  return NextResponse.json({
    token,
    userId: user.user_metadata?.user_name || user.id,
  })
}
```

- [ ] **Step 4: Create settings page**

Create `packages/web/app/settings/page.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'

export default function SettingsPage() {
  const [token, setToken] = useState<string | null>(null)
  const [userId, setUserId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function generateToken() {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/token', { method: 'POST' })
      const data = await res.json()
      if (data.token) {
        setToken(data.token)
        setUserId(data.userId)
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
```

- [ ] **Step 5: Commit**

```bash
git add packages/web/app/login/ packages/web/app/auth/ packages/web/app/api/auth/ packages/web/app/settings/
git commit -m "feat(web): add GitHub OAuth login and plugin token generation"
```

---

## Phase 3: Polish

### Task 17: Compare page

**Files:**
- Create: `packages/web/app/compare/page.tsx`

- [ ] **Step 1: Create compare page**

Create `packages/web/app/compare/page.tsx`:

```typescript
import { createSupabaseClient } from '@/lib/supabase'
import { StatRadar } from '@/components/stat-radar'
import { XPProgress } from '@/components/xp-progress'

const SPECIES_ICONS: Record<string, string> = {
  duck: '🦆', goose: '🪿', blob: '🫧', cat: '🐱', dragon: '🐉',
  octopus: '🐙', owl: '🦉', penguin: '🐧', turtle: '🐢', snail: '🐌',
  ghost: '👻', axolotl: '🦎', capybara: '🦫', cactus: '🌵', robot: '🤖',
  rabbit: '🐰', mushroom: '🍄', chonk: '🐈',
}

const TIER_ICONS: Record<string, string> = {
  hatchling: '🥚', juvenile: '⚡', adult: '🌟', elder: '👑', ascended: '✨',
}

function BuddyCard({ buddy }: { buddy: any }) {
  return (
    <div className="flex-1 text-center">
      <div className="text-5xl mb-2">{SPECIES_ICONS[buddy.species] || '🐾'}</div>
      <h2 className="text-lg font-bold">{buddy.companion_name}</h2>
      <p className="text-gray-500">@{buddy.github_username}</p>
      <p className="mt-1">
        {TIER_ICONS[buddy.tier]} {buddy.tier} — {buddy.rarity}
      </p>
      <div className="mt-4 px-4">
        <XPProgress totalXP={buddy.total_xp} tier={buddy.tier} />
      </div>
      <div className="mt-4">
        <StatRadar
          baseStats={buddy.base_stats as Record<string, number>}
          statGrowth={buddy.stat_growth as Record<string, number>}
        />
      </div>
    </div>
  )
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>
}) {
  const { a, b } = await searchParams

  if (!a || !b) {
    return (
      <main className="min-h-screen bg-gray-950 text-gray-100 font-mono flex items-center justify-center">
        <p className="text-gray-400">Usage: /compare?a=username1&b=username2</p>
      </main>
    )
  }

  const supabase = createSupabaseClient()
  const [{ data: buddyA }, { data: buddyB }] = await Promise.all([
    supabase.from('buddies').select('*').eq('github_username', a).single(),
    supabase.from('buddies').select('*').eq('github_username', b).single(),
  ])

  if (!buddyA || !buddyB) {
    return (
      <main className="min-h-screen bg-gray-950 text-gray-100 font-mono flex items-center justify-center">
        <p className="text-gray-400">One or both buddies not found.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 font-mono">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <a href="/" className="text-gray-500 hover:text-gray-300 mb-8 block">&larr; Back</a>
        <h1 className="text-2xl font-bold text-center mb-8">Compare</h1>
        <div className="flex gap-8">
          <BuddyCard buddy={buddyA} />
          <div className="flex items-center text-4xl text-gray-600">VS</div>
          <BuddyCard buddy={buddyB} />
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/web/app/compare/
git commit -m "feat(web): add buddy comparison page"
```

---

### Task 18: Achievement system

**Files:**
- Create: `packages/web/lib/achievements.ts`
- Create: `packages/web/app/api/achievements/route.ts`
- Create: `packages/web/app/achievements/page.tsx`

- [ ] **Step 1: Create achievement definitions**

Create `packages/web/lib/achievements.ts`:

```typescript
export interface AchievementDef {
  key: string
  name: string
  description: string
  icon: string
  category: 'milestone' | 'streak' | 'usage' | 'rare'
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { key: 'first_session', name: 'First Steps', description: 'Complete your first session', icon: '👣', category: 'milestone' },
  { key: 'juvenile', name: 'Growing Up', description: 'Reach Juvenile tier', icon: '⚡', category: 'milestone' },
  { key: 'adult', name: 'Coming of Age', description: 'Reach Adult tier', icon: '🌟', category: 'milestone' },
  { key: 'elder', name: 'Ancient Power', description: 'Reach Elder tier', icon: '👑', category: 'milestone' },
  { key: 'ascended', name: 'Transcendence', description: 'Reach Ascended tier', icon: '✨', category: 'milestone' },
  { key: 'streak_7', name: 'Week Warrior', description: '7-day streak', icon: '🔥', category: 'streak' },
  { key: 'streak_30', name: 'Monthly Devotion', description: '30-day streak', icon: '💎', category: 'streak' },
  { key: 'tool_1000', name: 'Tool Master', description: '1,000 tool calls', icon: '🔧', category: 'usage' },
  { key: 'debug_100', name: 'Bug Hunter', description: 'DEBUGGING stat reaches 100', icon: '🐛', category: 'usage' },
  { key: 'shiny', name: 'Lucky Star', description: 'Own a shiny buddy', icon: '⭐', category: 'rare' },
  { key: 'legendary', name: 'One in a Hundred', description: 'Legendary rarity buddy', icon: '🏆', category: 'rare' },
  { key: 'million_tokens', name: 'Token Millionaire', description: '1M output tokens', icon: '💰', category: 'usage' },
]

export function checkAchievements(buddy: {
  tier: string
  shiny: boolean
  rarity: string
  streak_days: number
  lifetime_stats: Record<string, number>
  stat_growth: Record<string, number>
  base_stats: Record<string, number>
}): string[] {
  const earned: string[] = []
  const stats = buddy.lifetime_stats

  if ((stats.totalSessions || 0) >= 1) earned.push('first_session')
  if (['juvenile', 'adult', 'elder', 'ascended'].includes(buddy.tier)) earned.push('juvenile')
  if (['adult', 'elder', 'ascended'].includes(buddy.tier)) earned.push('adult')
  if (['elder', 'ascended'].includes(buddy.tier)) earned.push('elder')
  if (buddy.tier === 'ascended') earned.push('ascended')
  if (buddy.streak_days >= 7) earned.push('streak_7')
  if (buddy.streak_days >= 30) earned.push('streak_30')
  if ((stats.totalToolCalls || 0) >= 1000) earned.push('tool_1000')
  if (Math.round((buddy.base_stats?.DEBUGGING || 0) + (buddy.stat_growth?.DEBUGGING || 0)) >= 100) earned.push('debug_100')
  if (buddy.shiny) earned.push('shiny')
  if (buddy.rarity === 'legendary') earned.push('legendary')
  if ((stats.totalOutputTokens || 0) >= 1_000_000) earned.push('million_tokens')

  return earned
}
```

- [ ] **Step 2: Create achievements API**

Create `packages/web/app/api/achievements/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { ACHIEVEMENTS } from '@/lib/achievements'

export async function GET() {
  return NextResponse.json(ACHIEVEMENTS)
}
```

- [ ] **Step 3: Create achievements page**

Create `packages/web/app/achievements/page.tsx`:

```typescript
import { ACHIEVEMENTS } from '@/lib/achievements'

export default function AchievementsPage() {
  const categories = ['milestone', 'streak', 'usage', 'rare'] as const
  const categoryNames = { milestone: 'Milestones', streak: 'Streaks', usage: 'Usage', rare: 'Rare' }

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 font-mono">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <a href="/" className="text-gray-500 hover:text-gray-300 mb-8 block">&larr; Back</a>
        <h1 className="text-2xl font-bold mb-8">Achievements</h1>

        {categories.map(cat => (
          <div key={cat} className="mb-8">
            <h2 className="text-lg font-bold mb-4 text-gray-400">{categoryNames[cat]}</h2>
            <div className="grid grid-cols-1 gap-3">
              {ACHIEVEMENTS.filter(a => a.category === cat).map(a => (
                <div key={a.key} className="flex items-center gap-4 bg-gray-900 rounded-lg px-4 py-3">
                  <span className="text-2xl">{a.icon}</span>
                  <div>
                    <div className="font-bold">{a.name}</div>
                    <div className="text-sm text-gray-400">{a.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Add achievement badges to profile page**

Edit `packages/web/app/u/[username]/page.tsx` — add after the stats section:

```typescript
// Import at top
import { checkAchievements, ACHIEVEMENTS } from '@/lib/achievements'

// Add inside the page component, after the grid:
const earnedKeys = checkAchievements({
  tier: buddy.tier,
  shiny: buddy.shiny,
  rarity: buddy.rarity,
  streak_days: buddy.streak_days,
  lifetime_stats: buddy.lifetime_stats as Record<string, number>,
  stat_growth: buddy.stat_growth as Record<string, number>,
  base_stats: buddy.base_stats as Record<string, number>,
})

const earnedAchievements = ACHIEVEMENTS.filter(a => earnedKeys.includes(a.key))

// Add this JSX after the grid div:
{earnedAchievements.length > 0 && (
  <div className="mb-8">
    <h2 className="text-lg font-bold mb-4">Achievements</h2>
    <div className="flex flex-wrap gap-2">
      {earnedAchievements.map(a => (
        <div key={a.key} className="bg-gray-900 rounded-full px-3 py-1 text-sm flex items-center gap-1" title={a.description}>
          <span>{a.icon}</span>
          <span>{a.name}</span>
        </div>
      ))}
    </div>
  </div>
)}
```

- [ ] **Step 5: Commit**

```bash
git add packages/web/lib/achievements.ts packages/web/app/api/achievements/ packages/web/app/achievements/ packages/web/app/u/
git commit -m "feat(web): add achievement system with definitions and profile badges"
```

---

### Task 19: Final build and verify

**Files:** (none new)

- [ ] **Step 1: Build entire monorepo**

Run: `cd /home/ct/SDD/buddy-evolution && pnpm build`
Expected: All 3 packages build successfully

- [ ] **Step 2: Run all tests**

Run: `pnpm test`
Expected: All tests pass across core and plugin

- [ ] **Step 3: Type-check**

Run: `pnpm typecheck`
Expected: No type errors

- [ ] **Step 4: Commit any remaining changes**

```bash
git add -A
git commit -m "chore: final build verification"
```

---

## Summary

| Phase | Tasks | What's built |
|-------|-------|-------------|
| 1: Plugin MVP | 1-10 | Monorepo, core engine, hooks, transcript parser, accumulator, store, display, CLI, skill |
| 2: Platform MVP | 11-16 | Next.js app, Supabase schema, sync API, leaderboard, profile, auth |
| 3: Polish | 17-19 | Compare page, achievements, final verification |

**Total: 19 tasks**, each independently committable and testable.
