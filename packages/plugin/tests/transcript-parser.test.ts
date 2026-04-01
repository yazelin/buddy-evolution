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
