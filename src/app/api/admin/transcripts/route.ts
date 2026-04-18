import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

const TRANSCRIPTS_DIR = join(process.cwd(), 'logs', 'transcripts');

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!existsSync(TRANSCRIPTS_DIR)) {
    return NextResponse.json([]);
  }

  let files: string[];
  try {
    files = readdirSync(TRANSCRIPTS_DIR).filter((f) => f.endsWith('.json'));
  } catch {
    return NextResponse.json([]);
  }

  const entries: {
    sessionId: string;
    role: string;
    ts: string;
    msgCount: number;
    costUSD: number;
    finishReason: string;
  }[] = [];

  for (const file of files) {
    try {
      const raw = readFileSync(join(TRANSCRIPTS_DIR, file), 'utf-8');
      const data = JSON.parse(raw);
      entries.push({
        sessionId: data.sessionId ?? file.replace('.json', ''),
        role: data.role ?? '',
        ts: data.ts ?? '',
        msgCount: data.msgCount ?? 0,
        costUSD: data.costUSD ?? 0,
        finishReason: data.finishReason ?? '',
      });
    } catch {
      // skip malformed files
    }
  }

  // Sort newest first
  entries.sort((a, b) => {
    if (a.ts > b.ts) return -1;
    if (a.ts < b.ts) return 1;
    return 0;
  });

  return NextResponse.json(entries.slice(0, 100));
}
