import { NextResponse } from 'next/server';
import { validateCredentials, createSession, COOKIE_NAME } from '@/lib/admin-auth';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!validateCredentials(username, password)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const session = createSession();
    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
