import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const RATE_FILE = join(DATA_DIR, 'rate-limits.json');

const MAX_INTERVIEWS_PER_IP_PER_HOUR = 5;
const MAX_REQUESTS_PER_IP_PER_MINUTE = 30;

interface RateData {
  interviews: Record<string, number[]>; // IP -> timestamps
  requests: Record<string, number[]>;   // IP -> timestamps
}

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function load(): RateData {
  ensureDir();
  if (!existsSync(RATE_FILE)) return { interviews: {}, requests: {} };
  try {
    return JSON.parse(readFileSync(RATE_FILE, 'utf-8'));
  } catch {
    return { interviews: {}, requests: {} };
  }
}

function save(data: RateData) {
  writeFileSync(RATE_FILE, JSON.stringify(data));
}

function cleanOld(timestamps: number[], windowMs: number): number[] {
  const cutoff = Date.now() - windowMs;
  return timestamps.filter(t => t > cutoff);
}

export function checkRateLimit(ip: string): { allowed: boolean; reason?: string } {
  const data = load();
  const now = Date.now();

  // Clean and check request rate (per minute)
  data.requests[ip] = cleanOld(data.requests[ip] || [], 60_000);
  if (data.requests[ip].length >= MAX_REQUESTS_PER_IP_PER_MINUTE) {
    save(data);
    return { allowed: false, reason: 'too_many_requests' };
  }
  data.requests[ip].push(now);

  save(data);
  return { allowed: true };
}

export function checkInterviewRate(ip: string): { allowed: boolean; reason?: string } {
  const data = load();
  const now = Date.now();

  // Clean and check interview starts (per hour)
  data.interviews[ip] = cleanOld(data.interviews[ip] || [], 3600_000);
  if (data.interviews[ip].length >= MAX_INTERVIEWS_PER_IP_PER_HOUR) {
    return { allowed: false, reason: 'too_many_interviews' };
  }

  return { allowed: true };
}

export function recordInterviewStart(ip: string) {
  const data = load();
  data.interviews[ip] = cleanOld(data.interviews[ip] || [], 3600_000);
  data.interviews[ip].push(Date.now());
  save(data);
}
