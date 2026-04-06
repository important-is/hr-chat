import { getStats } from '@/lib/analytics';
import { getBudgetStatus } from '@/lib/budget';

export async function GET(req: Request) {
  // Simple auth — check for admin key in header
  const adminKey = process.env.ADMIN_API_KEY;
  const authHeader = req.headers.get('x-admin-key');

  if (adminKey && authHeader !== adminKey) {
    return new Response('Unauthorized', { status: 401 });
  }

  const stats = getStats();
  const budget = getBudgetStatus();

  return Response.json({ stats, budget });
}
