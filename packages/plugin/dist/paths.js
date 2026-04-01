import { join } from 'node:path';
export function getDataDir() {
    const pluginData = process.env.CLAUDE_PLUGIN_DATA;
    if (pluginData)
        return pluginData;
    return join(process.env.HOME || '/tmp', '.buddy-evolution');
}
export function getSessionPath() {
    return join(getDataDir(), 'current-session.json');
}
export function getEvolutionStatePath() {
    return join(getDataDir(), 'evolution-state.json');
}
export function getSyncConfigPath() {
    return join(getDataDir(), 'sync-config.json');
}
//# sourceMappingURL=paths.js.map