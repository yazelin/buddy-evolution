import type { SessionMetrics } from '@buddy-evolution/core';
export interface SessionState {
    startTime: number;
    toolCalls: number;
    fileEdits: number;
    testRuns: number;
    rejectedToolCalls: number;
    forceSnips: number;
    contextResets: number;
}
export declare function initSession(): void;
export declare function readSessionState(): SessionState | null;
export declare function recordToolUse(toolName: string, toolInput: Record<string, unknown>): void;
export declare function recordToolFailure(): void;
export declare function recordCompact(): void;
export declare function finalizeSession(outputTokens: number, inputTokens: number): SessionMetrics | null;
