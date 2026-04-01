import { join } from 'node:path'

export function getDataDir(): string {
  const pluginData = process.env.CLAUDE_PLUGIN_DATA
  if (pluginData) return pluginData
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
