import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { Client } from '@notionhq/client';

export const dynamic = 'force-dynamic';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const DECYZJA_OPTIONS = ['Rozmowa', 'Zadanie techniczne', 'Do przemyślenia', 'Odrzucony', 'Oferta'] as const;

// Minimal shapes for Notion property values we read
type SelectValue = { select: { name: string } | null } | undefined;
type TitleValue = { title: Array<{ plain_text?: string }> } | undefined;
type EmailValue = { email: string | null } | undefined;
type NumberValue = { number: number | null } | undefined;
type DateValue = { date: { start: string } | null } | undefined;
type RichTextValue = { rich_text: Array<{ plain_text?: string }> } | undefined;

interface NotionPage {
  id: string;
  url: string;
  properties: Record<string, unknown>;
}

function getTitle(prop: unknown): string {
  const p = prop as TitleValue;
  if (!p?.title) return '';
  return p.title.map((t) => t.plain_text ?? '').join('').trim();
}

function getRichText(prop: unknown): string {
  const p = prop as RichTextValue;
  if (!p?.rich_text) return '';
  return p.rich_text.map((t) => t.plain_text ?? '').join('').trim();
}

function getSelect(prop: unknown): string {
  const p = prop as SelectValue;
  return p?.select?.name ?? '';
}

function getEmail(prop: unknown): string {
  const p = prop as EmailValue;
  return p?.email ?? '';
}

function getNumber(prop: unknown): number | null {
  const p = prop as NumberValue;
  return p?.number ?? null;
}

function getDate(prop: unknown): string {
  const p = prop as DateValue;
  return p?.date?.start ?? '';
}

export async function GET(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId) {
    return NextResponse.json({ error: 'NOTION_DATABASE_ID not configured' }, { status: 500 });
  }

  const url = new URL(req.url);
  const role = url.searchParams.get('role') || '';
  const decyzja = url.searchParams.get('decyzja') || '';
  const dateFrom = url.searchParams.get('dateFrom') || '';
  const dateTo = url.searchParams.get('dateTo') || '';
  const startCursor = url.searchParams.get('cursor') || undefined;
  const pageSize = Math.min(Math.max(parseInt(url.searchParams.get('per_page') || '50', 10), 10), 100);

  // Build Notion filter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filters: any[] = [];

  if (role) {
    filters.push({ property: 'Rola', select: { equals: role } });
  }

  if (decyzja) {
    if (decyzja === 'brak') {
      filters.push({ property: 'Decyzja', select: { is_empty: true } });
    } else {
      filters.push({ property: 'Decyzja', select: { equals: decyzja } });
    }
  }

  if (dateFrom) {
    filters.push({ property: 'Data aplikacji', date: { on_or_after: dateFrom } });
  }
  if (dateTo) {
    filters.push({ property: 'Data aplikacji', date: { on_or_before: dateTo } });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queryArgs: any = {
    database_id: databaseId,
    page_size: pageSize,
    sorts: [{ property: 'Data aplikacji', direction: 'descending' }],
  };
  if (filters.length === 1) queryArgs.filter = filters[0];
  else if (filters.length > 1) queryArgs.filter = { and: filters };
  if (startCursor) queryArgs.start_cursor = startCursor;

  try {
    const res = await notion.databases.query(queryArgs);

    const candidates = (res.results as unknown as NotionPage[]).map((page) => {
      const props = page.properties;
      const imie = getTitle(props['Imię i nazwisko']) || getRichText(props['Imię i nazwisko']);
      const email = getEmail(props['Email']);
      const rola = getSelect(props['Rola']);
      const decyzjaVal = getSelect(props['Decyzja']);
      const wynikLacznie = getNumber(props['Wynik łącznie']);
      const dataAplikacji = getDate(props['Data aplikacji']);

      return {
        id: page.id,
        imie,
        email,
        rola,
        decyzja: decyzjaVal,
        wynikLacznie,
        dataAplikacji,
        notionUrl: page.url || `https://www.notion.so/${page.id.replace(/-/g, '')}`,
      };
    });

    return NextResponse.json({
      candidates,
      hasMore: res.has_more,
      nextCursor: res.next_cursor ?? undefined,
      decyzjaOptions: [...DECYZJA_OPTIONS, 'brak'],
    });
  } catch (err) {
    console.error('Notion candidates query error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
