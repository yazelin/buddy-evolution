import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { getSessionPath, getDataDir } from './paths.js';
const TEST_PATTERNS = [
    /\btest\b/i,
    /\bvitest\b/i,
    /\bjest\b/i,
    /\bpytest\b/i,
    /\bmocha\b/i,
    /\bcargo\s+test\b/i,
    /\bgo\s+test\b/i,
];
function ensureDataDir() {
    const dir = getDataDir();
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
}
export function initSession() {
    ensureDataDir();
    const state = {
        startTime: Date.now(),
        toolCalls: 0,
        fileEdits: 0,
        testRuns: 0,
        rejectedToolCalls: 0,
        forceSnips: 0,
        contextResets: 0,
    };
    writeFileSync(getSessionPath(), JSON.stringify(state), 'utf-8');
}
export function readSessionState() {
    const path = getSessionPath();
    if (!existsSync(path))
        return null;
    try {
        return JSON.parse(readFileSync(path, 'utf-8'));
    }
    catch {
        return null;
    }
}
function updateSession(updater) {
    const state = readSessionState();
    if (!state)
        return;
    updater(state);
    writeFileSync(getSessionPath(), JSON.stringify(state), 'utf-8');
}
function isTestCommand(command) {
    return TEST_PATTERNS.some(p => p.test(command));
}
export function recordToolUse(toolName, toolInput) {
    updateSession(state => {
        state.toolCalls++;
        if (toolName === 'Edit' || toolName === 'Write' || toolName === 'NotebookEdit') {
            state.fileEdits++;
        }
        if (toolName === 'Bash' && typeof toolInput.command === 'string') {
            if (isTestCommand(toolInput.command)) {
                state.testRuns++;
            }
        }
    });
}
export function recordToolFailure() {
    updateSession(state => {
        state.rejectedToolCalls++;
    });
}
export function recordCompact() {
    updateSession(state => {
        state.contextResets++;
    });
}
export function finalizeSession(outputTokens, inputTokens) {
    const state = readSessionState();
    if (!state)
        return null;
    const durationMs = Date.now() - state.startTime;
    const durationMinutes = Math.floor(durationMs / 60000);
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
    };
}
//# sourceMappingURL=accumulator.js.map