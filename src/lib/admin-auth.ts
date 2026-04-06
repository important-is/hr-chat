import { cookies } from 'next/headers';
import { createHmac } from 'crypto';

const ADMIN_USER = process.env.ADMIN_USER || 'important';
const ADMIN_PASS = process.env.ADMIN_PASS || 'Adminimportant!1';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'hr-chat-admin-secret-2024';
const COOKIE_NAME = 'admin_session';

function sign(value: string): string {
  return createHmac('sha256', ADMIN_SECRET).update(value).digest('hex');
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
  return sign(payload) === signature;
}

export function validateCredentials(username: string, password: string): boolean {
  return username === ADMIN_USER && password === ADMIN_PASS;
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);
  if (!session) return false;
  return verifySession(session.value);
}

export { COOKIE_NAME };
