import { cookies } from 'next/headers';
import { createHmac } from 'crypto';

const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;
const ADMIN_SECRET = process.env.ADMIN_SECRET;
const COOKIE_NAME = 'admin_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 godzin

if (!ADMIN_USER || !ADMIN_PASS || !ADMIN_SECRET) {
  console.error('[admin-auth] Missing required env vars: ADMIN_USER, ADMIN_PASS, ADMIN_SECRET');
}

function sign(value: string): string {
  return createHmac('sha256', ADMIN_SECRET ?? '').update(value).digest('hex');
}

export function createSession(): string {
  const payload = `${ADMIN_USER}:${Date.now()}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifySession(cookie: string): boolean {
  const lastDot = cookie.lastIndexOf('.');
  if (lastDot === -1) return false;
  const payload = cookie.slice(0, lastDot);
  const signature = cookie.slice(lastDot + 1);
  if (sign(payload) !== signature) return false;

  // Sprawdź TTL
  const parts = payload.split(':');
  const timestamp = Number(parts[parts.length - 1]);
  if (!Number.isFinite(timestamp)) return false;
  return Date.now() - timestamp < SESSION_TTL_MS;
}

export function validateCredentials(username: string, password: string): boolean {
  if (!ADMIN_USER || !ADMIN_PASS) return false;
  return username === ADMIN_USER && password === ADMIN_PASS;
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);
  if (!session) return false;
  return verifySession(session.value);
}

export { COOKIE_NAME };
