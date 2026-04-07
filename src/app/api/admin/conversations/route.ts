import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { loadConversationLogs } from '@/lib/log-reader';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10), 1);
  const perPage = Math.min(Math.max(parseInt(url.searchParams.get('per_page') || '50', 10), 10), 200);
  const roleFilter = url.searchParams.get('role') || '';
  const search = url.searchParams.get('q') || '';
  const dateFrom = url.searchParams.get('from') || '';
  const dateTo = url.searchParams.get('to') || '';
  const sortBy = url.searchParams.get('sort') || 'ts';
  const sortDir = url.searchParams.get('dir') === 'asc' ? 'asc' : 'desc';

  let entries = loadConversationLogs();

  // Filter by role
  if (roleFilter) {
    entries = entries.filter((e) => e.role === roleFilter);
  }

  // Filter by date range
  if (dateFrom) {
    entries = entries.filter((e) => (e.ts || '') >= dateFrom);
  }
  if (dateTo) {
    const toEnd = dateTo + 'T23:59:59';
    entries = entries.filter((e) => (e.ts || '') <= toEnd);
  }

  // Search in stringified entry
  if (search) {
    const q = search.toLowerCase();
    entries = entries.filter((e) => JSON.stringify(e).toLowerCase().includes(q));
  }

  // Sort
  if (sortDir === 'asc') entries.reverse();
  if (sortBy === 'cost') {
    entries.sort((a, b) => {
      const diff = (a.costUSD ?? 0) - (b.costUSD ?? 0);
      return sortDir === 'asc' ? diff : -diff;
    });
  } else if (sortBy === 'tokens') {
    entries.sort((a, b) => {
      const diff = (a.totalTokens ?? 0) - (b.totalTokens ?? 0);
      return sortDir === 'asc' ? diff : -diff;
    });
  } else if (sortBy === 'duration') {
    entries.sort((a, b) => {
      const diff = (a.durationMs ?? 0) - (b.durationMs ?? 0);
      return sortDir === 'asc' ? diff : -diff;
    });
  }

  const total = entries.length;
  const totalPages = Math.ceil(total / perPage);
  const offset = (page - 1) * perPage;
  const paged = entries.slice(offset, offset + perPage);

  // Unique roles for filter dropdown
  const allEntries = loadConversationLogs();
  const roles = [...new Set(allEntries.map((e) => e.role).filter(Boolean))];

  // Summary stats
  const totalCost = allEntries.reduce((sum, e) => sum + (e.costUSD ?? 0), 0);
  const totalTokens = allEntries.reduce((sum, e) => sum + (e.totalTokens ?? 0), 0);

  return NextResponse.json({
    conversations: paged,
    pagination: { page, perPage, total, totalPages },
    roles,
    summary: { totalCost, totalTokens, totalEntries: allEntries.length },
  });
}
