import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const BUDGET_FILE = join(DATA_DIR, 'budget.json');

// Limity — łatwe do zmiany
export const LIMITS = {
  maxCostPerDay: 5.0, // USD — max koszt wszystkich rozmów w ciągu dnia
  maxCostPerInterview: 0.50, // USD — max koszt pojedynczej rozmowy
  maxInterviewsPerDay: 50, // max rozmów dziennie
};

interface BudgetData {
  date: string; // YYYY-MM-DD
  totalCost: number;
  interviewCount: number;
  interviews: Record<string, number>; // sessionId -> cost
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function load(): BudgetData {
  ensureDir();
  if (!existsSync(BUDGET_FILE)) {
    return { date: today(), totalCost: 0, interviewCount: 0, interviews: {} };
  }
  try {
    const data: BudgetData = JSON.parse(readFileSync(BUDGET_FILE, 'utf-8'));
    // Reset jeśli nowy dzień
    if (data.date !== today()) {
      return { date: today(), totalCost: 0, interviewCount: 0, interviews: {} };
    }
    return data;
  } catch {
    return { date: today(), totalCost: 0, interviewCount: 0, interviews: {} };
  }
}

function save(data: BudgetData) {
  ensureDir();
  writeFileSync(BUDGET_FILE, JSON.stringify(data, null, 2));
}

/** Check if we can start/continue an interview */
export function canProceed(sessionId?: string): { allowed: boolean; reason?: string } {
  const data = load();

  if (data.totalCost >= LIMITS.maxCostPerDay) {
    return { allowed: false, reason: 'daily_budget_exceeded' };
  }

  if (data.interviewCount >= LIMITS.maxInterviewsPerDay) {
    return { allowed: false, reason: 'daily_interview_limit' };
  }

  if (sessionId && (data.interviews[sessionId] ?? 0) >= LIMITS.maxCostPerInterview) {
    return { allowed: false, reason: 'interview_budget_exceeded' };
  }

  return { allowed: true };
}

/** Record cost for an interview turn */
export function recordCost(sessionId: string, costUSD: number) {
  const data = load();
  data.totalCost += costUSD;
  data.interviews[sessionId] = (data.interviews[sessionId] ?? 0) + costUSD;
  save(data);
}

/** Record a new interview start */
export function recordInterviewStart() {
  const data = load();
  data.interviewCount += 1;
  save(data);
}

/** Get current budget status */
export function getBudgetStatus() {
  const data = load();
  return {
    date: data.date,
    totalCost: data.totalCost,
    remaining: LIMITS.maxCostPerDay - data.totalCost,
    interviewCount: data.interviewCount,
    maxInterviews: LIMITS.maxInterviewsPerDay,
    maxCostPerDay: LIMITS.maxCostPerDay,
  };
}
