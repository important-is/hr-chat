import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { getStats } from '@/lib/analytics';
import { getBudgetStatus, LIMITS } from '@/lib/budget';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stats = getStats();
  const budget = getBudgetStatus();

  return NextResponse.json({ stats, budget, limits: LIMITS });
}
