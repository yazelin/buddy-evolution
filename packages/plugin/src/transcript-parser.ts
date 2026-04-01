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
