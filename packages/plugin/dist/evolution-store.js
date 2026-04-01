import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { getEvolutionStatePath, getDataDir } from './paths.js';
import { createDefaultEvolutionState } from '@buddy-evolution/core';
export function loadEvolutionState() {
    const filePath = getEvolutionStatePath();
    if (!existsSync(filePath)) {
        return createDefaultEvolutionState();
    }
    try {
        const raw = readFileSync(filePath, 'utf-8');
        return JSON.parse(raw);
    }
    catch {
        return createDefaultEvolutionState();
    }
}
export function saveEvolutionState(state) {
    const dir = getDataDir();
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
    writeFileSync(getEvolutionStatePath(), JSON.stringify(state, null, 2), 'utf-8');
}
//# sourceMappingURL=evolution-store.js.map