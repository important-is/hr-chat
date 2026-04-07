import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const ENV_CHECKS = [
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'NOTION_API_KEY',
  'NOTION_DATABASE_ID',
  'MODEL_PROVIDER',
  'TURNSTILE_SECRET_KEY',
  'ADMIN_USER',
  'ADMIN_PASS',
  'ADMIN_SECRET',
];

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const envStatus: Record<string, boolean> = {};
  for (const key of ENV_CHECKS) {
    envStatus[key] = !!process.env[key];
  }

  return NextResponse.json({
    modelProvider: process.env.MODEL_PROVIDER || 'openai',
    turnstileConfigured: !!process.env.TURNSTILE_SECRET_KEY,
    envStatus,
  });
}
