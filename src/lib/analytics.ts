import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const EVENTS_FILE = join(DATA_DIR, 'events.jsonl');
const STATS_FILE = join(DATA_DIR, 'stats.json');

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

export type EventType =
  | 'page_view' // ktoś otworzył stronę
  | 'role_select' // kliknął w rolę
  | 'interview_start' // kliknął "Zacznij rozmowę"
  | 'interview_complete' // Kaja wywołała complete_interview
  | 'interview_error' // błąd podczas rozmowy
  | 'fallback_shown' // wyświetlono "Kaja niedostępna"
  | 'cv_uploaded'; // kandydat dodał CV po rozmowie

interface Event {
  ts: string;
  type: EventType;
  role?: string;
  sessionId?: string;
  meta?: Record<string, unknown>;
}

/** Log an event (append to JSONL) */
export function trackEvent(type: EventType, data?: Omit<Event, 'ts' | 'type'>) {
  ensureDir();
  const event: Event = {
    ts: new Date().toISOString(),
    type,
    ...data,
  };
  try {
    appendFileSync(EVENTS_FILE, JSON.stringify(event) + '\n');
    updateStats(type, data?.role);
  } catch (err) {
    console.error('Analytics write error:', err);
  }
}

/** Aggregated stats (updated on each event) */
interface Stats {
  date: string;
  pageViews: number;
  roleSelects: Record<string, number>;
  interviewStarts: Record<string, number>;
  interviewCompletes: Record<string, number>;
  errors: number;
  fallbacks: number;
  // All-time totals
  allTime: {
    totalInterviews: number;
    totalCompleted: number;
  };
}

function loadStats(): Stats {
  ensureDir();
  const today = new Date().toISOString().split('T')[0];
  if (!existsSync(STATS_FILE)) {
    return {
      date: today,
      pageViews: 0,
      roleSelects: {},
      interviewStarts: {},
      interviewCompletes: {},
      errors: 0,
      fallbacks: 0,
      allTime: { totalInterviews: 0, totalCompleted: 0 },
    };
  }
  try {
    const data: Stats = JSON.parse(readFileSync(STATS_FILE, 'utf-8'));
    if (data.date !== today) {
      // New day — reset daily, keep allTime
      return {
        date: today,
        pageViews: 0,
        roleSelects: {},
        interviewStarts: {},
        interviewCompletes: {},
        errors: 0,
        fallbacks: 0,
        allTime: data.allTime ?? { totalInterviews: 0, totalCompleted: 0 },
      };
    }
    return data;
  } catch {
    return {
      date: today,
      pageViews: 0,
      roleSelects: {},
      interviewStarts: {},
      interviewCompletes: {},
      errors: 0,
      fallbacks: 0,
      allTime: { totalInterviews: 0, totalCompleted: 0 },
    };
  }
}

function saveStats(stats: Stats) {
  writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
}

function updateStats(type: EventType, role?: string) {
  const stats = loadStats();
  switch (type) {
    case 'page_view':
      stats.pageViews++;
      break;
    case 'role_select':
      if (role) stats.roleSelects[role] = (stats.roleSelects[role] ?? 0) + 1;
      break;
    case 'interview_start':
      if (role) stats.interviewStarts[role] = (stats.interviewStarts[role] ?? 0) + 1;
      stats.allTime.totalInterviews++;
      break;
    case 'interview_complete':
      if (role) stats.interviewCompletes[role] = (stats.interviewCompletes[role] ?? 0) + 1;
      stats.allTime.totalCompleted++;
      break;
    case 'interview_error':
      stats.errors++;
      break;
    case 'fallback_shown':
      stats.fallbacks++;
      break;
  }
  saveStats(stats);
}

/** Get stats for admin dashboard */
export function getStats(): Stats {
  return loadStats();
}
