import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

function tailJsonl(filePath: string, n: number): unknown[] {
  if (!existsSync(filePath)) return [];
  try {
    const content = readFileSync(filePath, 'utf-8').trim();
    if (!content) return [];
    const lines = content.split('\n');
    const lastN = lines.slice(-n);
    return lastN
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .reverse();
  } catch {
    return [];
  }
}

export async function GET(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200);

  const eventsPath = join(process.cwd(), 'data', 'events.jsonl');
  const events = tailJsonl(eventsPath, limit);

  return NextResponse.json({ events });
}
