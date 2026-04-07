import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface LogEntry {
  ts?: string;
  role?: string;
  model?: string;
  msgCount?: number;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  costUSD?: number;
  finishReason?: string;
  durationMs?: number;
  [key: string]: unknown;
}

export function loadConversationLogs(): LogEntry[] {
  const filePath = join(process.cwd(), 'logs', 'conversations.jsonl');
  if (!existsSync(filePath)) return [];
  try {
    const content = readFileSync(filePath, 'utf-8').trim();
    if (!content) return [];
    return content
      .split('\n')
      .map((line) => {
        try { return JSON.parse(line); } catch { return null; }
      })
      .filter(Boolean)
      .reverse();
  } catch {
    return [];
  }
}
