import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CV_DIR = join(process.cwd(), 'data', 'cvs');
const SESSION_ID_REGEX = /^[a-zA-Z0-9_-]{8,64}$/;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sessionId } = await params;
  if (!SESSION_ID_REGEX.test(sessionId)) {
    return NextResponse.json({ error: 'invalid_session_id' }, { status: 400 });
  }

  const filepath = join(CV_DIR, `${sessionId}.pdf`);
  if (!existsSync(filepath)) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  try {
    const buffer = readFileSync(filepath);
    // Convert Node Buffer to Uint8Array for Response
    const body = new Uint8Array(buffer);
    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${sessionId}.pdf"`,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (err) {
    console.error('[admin/cv] read error:', err);
    return NextResponse.json({ error: 'read_failed' }, { status: 500 });
  }
}
