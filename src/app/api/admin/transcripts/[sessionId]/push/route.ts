import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Client } from '@notionhq/client';
import { getRole } from '@/lib/roles';

export const dynamic = 'force-dynamic';

const TRANSCRIPTS_DIR = join(process.cwd(), 'logs', 'transcripts');

const notion = new Client({ auth: process.env.NOTION_API_KEY });

type Msg = { role: string; content: unknown };

function msgToText(m: Msg): string {
  if (typeof m.content === 'string') return m.content;
  if (Array.isArray(m.content)) {
    return m.content
      .map((c) => {
        if (typeof c === 'string') return c;
        if (c && typeof c === 'object' && 'text' in c) return String((c as { text: unknown }).text);
        return '';
      })
      .join('');
  }
  return '';
}

function buildTranscriptBlocks(
  messages: Msg[],
  meta: { msgCount: number; costUSD: number; finishReason: string },
) {
  const blocks: object[] = [
    {
      object: 'block',
      type: 'heading_2',
      heading_2: { rich_text: [{ type: 'text', text: { content: '💬 Transkrypcja rozmowy' } }] },
    },
    {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: `Wiadomości: ${meta.msgCount} · Koszt: $${meta.costUSD.toFixed(4)} · Status: ${meta.finishReason}`,
            },
            annotations: { italic: true, color: 'gray' },
          },
        ],
      },
    },
    { object: 'block', type: 'divider', divider: {} },
  ];

  for (const m of messages) {
    const text = msgToText(m).trim();
    if (!text) continue;
    const who = m.role === 'user' ? '👤 Kandydat' : m.role === 'assistant' ? '✨ Kaja' : `[${m.role}]`;

    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += 1900) chunks.push(text.slice(i, i + 1900));

    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ type: 'text', text: { content: who }, annotations: { bold: true } }],
      },
    });
    for (const chunk of chunks) {
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [{ type: 'text', text: { content: chunk } }] },
      });
    }
  }

  return blocks;
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sessionId } = await params;

  const transcriptPath = join(TRANSCRIPTS_DIR, `${sessionId}.json`);
  if (!existsSync(transcriptPath)) {
    return NextResponse.json({ error: 'Transcript not found' }, { status: 404 });
  }

  let transcript: {
    sessionId: string;
    role: string;
    ts: string;
    msgCount: number;
    costUSD: number;
    finishReason: string;
    messages: Msg[];
  };

  try {
    transcript = JSON.parse(readFileSync(transcriptPath, 'utf-8'));
  } catch {
    return NextResponse.json({ error: 'Failed to read transcript' }, { status: 500 });
  }

  const roleData = getRole(transcript.role);
  const notionRole = roleData?.notionRole ?? transcript.role ?? 'Nieznana rola';

  const dateStr = transcript.ts
    ? new Date(transcript.ts).toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'brak daty';

  const title = `Nieznany kandydat — ${notionRole} — ${dateStr}`;

  try {
    const created = await notion.pages.create({
      parent: { database_id: process.env.NOTION_DATABASE_ID! },
      properties: {
        'Imię i nazwisko': {
          title: [{ text: { content: title } }],
        },
        Rola: { select: { name: notionRole } },
        Status: { select: { name: 'Nowy' } },
        'Data aplikacji': {
          date: {
            start: transcript.ts
              ? new Date(transcript.ts).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0],
          },
        },
        'Notatki AI': {
          rich_text: [
            {
              text: {
                content: `Transkrypt zaimportowany ręcznie z panelu admina.\nSessionId: ${transcript.sessionId}\nLiczba wiadomości: ${transcript.msgCount}\nKoszt: $${transcript.costUSD?.toFixed(4) ?? '0.0000'}`,
              },
            },
          ],
        },
      },
    });

    const blocks = buildTranscriptBlocks(transcript.messages ?? [], {
      msgCount: transcript.msgCount,
      costUSD: transcript.costUSD,
      finishReason: transcript.finishReason,
    });

    for (let i = 0; i < blocks.length; i += 100) {
      await notion.blocks.children.append({
        block_id: created.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        children: blocks.slice(i, i + 100) as any,
      });
    }

    const notionUrl = `https://www.notion.so/${created.id.replace(/-/g, '')}`;
    return NextResponse.json({ success: true, notionUrl });
  } catch (err) {
    console.error('Notion push error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
