import { readFileSync } from 'node:fs'
import { recordToolUse } from '../accumulator.js'

try {
  const input = JSON.parse(readFileSync(0, 'utf-8'))
  recordToolUse(input.tool_name || '', input.tool_input || {})
} catch {
  // Silent failure
}
