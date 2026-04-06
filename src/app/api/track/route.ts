import { trackEvent } from '@/lib/analytics';
import type { EventType } from '@/lib/analytics';

export async function POST(req: Request) {
  try {
    const { type, role, sessionId } = await req.json();

    const validTypes: EventType[] = ['page_view', 'role_select', 'interview_start'];
    if (!validTypes.includes(type)) {
      return new Response('Invalid event type', { status: 400 });
    }

    trackEvent(type, { role, sessionId });
    return new Response('ok');
  } catch {
    return new Response('Bad request', { status: 400 });
  }
}
