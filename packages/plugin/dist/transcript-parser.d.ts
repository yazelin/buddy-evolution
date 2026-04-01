export interface TranscriptTokens {
    inputTokens: number;
    outputTokens: number;
}
export declare function parseTranscript(filePath: string): TranscriptTokens;
