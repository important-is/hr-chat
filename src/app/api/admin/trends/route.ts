import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { isAuthenticated } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const EVENTS_FILE = join(process.cwd(), 'data', 'events.jsonl');

type EventType =
  | 'page_view'
  | 'role_select'
  | 'interview_start'
  | 'interview_complete'
  | 'interview_error'
  | 'fallback_shown';

interface Event {
  ts: string;
  type: EventType;
  role?: string;
  sessionId?: string;
  meta?: Record<string, unknown>;
}

interface DailyBucket {
  date: string;
  pageViews: number;
  starts: number;
  completes: number;
  errors: number;
}

interface RoleBucket {
  role: string;
  starts: number;
  completes: number;
  completionRate: number;
}

function toDateKey(d: Date): string {
  return d.toISOString().split('T')[0];
}

function readEvents(): Event[] {
  if (!existsSync(EVENTS_FILE)) return [];
  try {
    const raw = readFileSync(EVENTS_FILE, 'utf-8');
    const lines = raw.split('\n').filter((l) => l.trim());
    const events: Event[] = [];
    for (const line of lines) {
      try {
        events.push(JSON.parse(line));
      } catch {
        // skip malformed line
      }
    }
    return events;
  } catch {
    return [];
  }
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - 13); // last 14 days inclusive
  cutoff.setUTCHours(0, 0, 0, 0);

  // Initialize 14 day buckets
  const daily: Record<string, DailyBucket> = {};
  for (let i = 0; i < 14; i++) {
    const d = new Date(cutoff);
    d.setUTCDate(cutoff.getUTCDate() + i);
    const key = toDateKey(d);
    daily[key] = {
      date: key,
      pageViews: 0,
      starts: 0,
      completes: 0,
      errors: 0,
    };
  }

  const roleMap: Record<string, { starts: number; completes: number }> = {};
  let totalStarts = 0;
  let totalCompletes = 0;

  const events = readEvents();
  for (const ev of events) {
    const ts = new Date(ev.ts);
    if (isNaN(ts.getTime())) continue;
    if (ts < cutoff) continue;

    const key = toDateKey(ts);
    const bucket = daily[key];

    switch (ev.type) {
      case 'page_view':
        if (bucket) bucket.pageViews++;
        break;
      case 'interview_start':
        if (bucket) bucket.starts++;
        totalStarts++;
        if (ev.role) {
          roleMap[ev.role] = roleMap[ev.role] ?? { starts: 0, completes: 0 };
          roleMap[ev.role].starts++;
        }
        break;
      case 'interview_complete':
        if (bucket) bucket.completes++;
        totalCompletes++;
        if (ev.role) {
          roleMap[ev.role] = roleMap[ev.role] ?? { starts: 0, completes: 0 };
          roleMap[ev.role].completes++;
        }
        break;
      case 'interview_error':
        if (bucket) bucket.errors++;
        break;
      default:
        break;
    }
  }

  const dailyArr = Object.values(daily).sort((a, b) => a.date.localeCompare(b.date));

  const byRole: RoleBucket[] = Object.entries(roleMap)
    .map(([role, v]) => ({
      role,
      starts: v.starts,
      completes: v.completes,
      completionRate: v.starts > 0 ? v.completes / v.starts : 0,
    }))
    .sort((a, b) => b.starts - a.starts);

  const overallCompletionRate = totalStarts > 0 ? totalCompletes / totalStarts : 0;

  return NextResponse.json({
    daily: dailyArr,
    byRole,
    totals: {
      totalStarts,
      totalCompletes,
      overallCompletionRate,
    },
  });
}
