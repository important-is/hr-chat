import { NextResponse } from 'next/server';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { checkRateLimit } from '@/lib/rate-limit';
import { trackEvent } from '@/lib/analytics';
import { notifyCvUploaded } from '@/lib/mailer';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DATA_DIR = join(process.cwd(), 'data');
const CV_DIR = join(DATA_DIR, 'cvs');
const SESSION_ID_REGEX = /^[a-zA-Z0-9_-]{8,64}$/;
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const PDF_HEADER = Buffer.from('%PDF-', 'utf-8');

function getClientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]?.trim() || 'unknown';
  return req.headers.get('x-real-ip') || 'unknown';
}

function ensureCvDir() {
  if (!existsSync(CV_DIR)) mkdirSync(CV_DIR, { recursive: true });
}

export async function POST(req: Request) {
  const ip = getClientIp(req);

  const rate = checkRateLimit(ip);
  if (!rate.allowed) {
    return NextResponse.json({ error: 'too_many_requests' }, { status: 429 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'invalid_form_data' }, { status: 400 });
  }

  const sessionId = String(formData.get('sessionId') ?? '');
  const file = formData.get('file');

  if (!SESSION_ID_REGEX.test(sessionId)) {
    return NextResponse.json({ error: 'invalid_session_id' }, { status: 400 });
  }

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'missing_file' }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'file_too_large' }, { status: 413 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: 'empty_file' }, { status: 400 });
  }

  const mimeType = (file as File).type || '';
  if (mimeType !== 'application/pdf') {
    return NextResponse.json({ error: 'invalid_mime_type' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Magic bytes check: PDF must start with "%PDF-"
  if (buffer.length < PDF_HEADER.length || !buffer.subarray(0, PDF_HEADER.length).equals(PDF_HEADER)) {
    return NextResponse.json({ error: 'invalid_pdf_header' }, { status: 400 });
  }

  try {
    ensureCvDir();
    const filepath = join(CV_DIR, `${sessionId}.pdf`);
    writeFileSync(filepath, buffer);

    trackEvent('cv_uploaded', {
      sessionId,
      meta: { size: buffer.length, ip },
    });

    // Powiadom Łukasza — CV mogło przyjść po complete_interview, więc nie trafiło do głównego maila
    const cvUrl = `https://rekrutacja.important.is/api/admin/cv/${sessionId}`;
    notifyCvUploaded({ sessionId, cvUrl, size: buffer.length }).catch((err) => {
      console.error('[cv-upload] notify error:', err);
    });

    return NextResponse.json({
      success: true,
      filename: `${sessionId}.pdf`,
      size: buffer.length,
    });
  } catch (err) {
    console.error('[cv-upload] write error:', err);
    return NextResponse.json({ error: 'write_failed' }, { status: 500 });
  }
}
