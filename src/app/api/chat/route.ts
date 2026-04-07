import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { Client } from '@notionhq/client';
import { getRole } from '@/lib/roles';
import { appendFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { canProceed, recordCost } from '@/lib/budget';
import { trackEvent } from '@/lib/analytics';
import { checkRateLimit, checkInterviewRate, recordInterviewStart } from '@/lib/rate-limit';
import { getRoleOverride, getGlobalPromptOverrides } from '@/lib/content';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Provider wybierany przez env var: MODEL_PROVIDER=openai | anthropic (default: openai — tańszy)
const PROVIDER = (process.env.MODEL_PROVIDER ?? 'openai') as 'openai' | 'anthropic';

// Modele + cennik per MTok (input, output) w USD
const MODELS = {
  openai: { id: 'gpt-4o-mini', priceIn: 0.15, priceOut: 0.60 },
  anthropic: { id: 'claude-sonnet-4-6', priceIn: 3, priceOut: 15 },
} as const;

const MODEL = MODELS[PROVIDER].id;
const PRICE_IN_PER_MTOK = MODELS[PROVIDER].priceIn;
const PRICE_OUT_PER_MTOK = MODELS[PROVIDER].priceOut;

function getModel() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (PROVIDER === 'openai' ? openai(MODEL) : anthropic(MODEL)) as any;
}

// Log dir
const LOG_DIR = join(process.cwd(), 'logs');
if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true });
const LOG_FILE = join(LOG_DIR, 'conversations.jsonl');

type Msg = { role: string; content: unknown };

function calcCost(inTok: number, outTok: number) {
  return (inTok * PRICE_IN_PER_MTOK + outTok * PRICE_OUT_PER_MTOK) / 1_000_000;
}

/** Flatten AI SDK message content → plain text */
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

/** Build Notion blocks for transcript */
function buildTranscriptBlocks(messages: Msg[], totals: { tokIn: number; tokOut: number; cost: number; turns: number }) {
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
              content: `Model: ${MODEL} · Tury: ${totals.turns} · Tokeny: ${totals.tokIn} in / ${totals.tokOut} out · Koszt: $${totals.cost.toFixed(4)}`,
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

    // Notion limit: 2000 chars per rich_text. Chunk if needed.
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

export async function POST(req: Request) {
  const { messages, role: roleId = 'wordpress-dev', sessionId, _hp, _t } = await req.json();
  const role = getRole(roleId);

  if (!role) {
    return new Response('Unknown role', { status: 400 });
  }

  // Apply prompt override from CMS (if any)
  const override = getRoleOverride(roleId);
  const globalOverrides = getGlobalPromptOverrides();

  // Build system prompt: role prompt + global CMS overrides appended (if set)
  const basePrompt = override.prompt || role.prompt;
  const globalParts: string[] = [];
  if (globalOverrides.companyKnowledge) {
    globalParts.push(`## Wiedza o firmie (nadpisanie z panelu admina)\n${globalOverrides.companyKnowledge}`);
  }
  if (globalOverrides.interviewRules) {
    globalParts.push(`## Zasady rozmowy (nadpisanie z panelu admina)\n${globalOverrides.interviewRules}`);
  }
  const systemPrompt = globalParts.length > 0
    ? `${basePrompt}\n\n## DODATKOWE WYTYCZNE — mają priorytet nad powyższymi\n\n${globalParts.join('\n\n')}`
    : basePrompt;

  // Bot protection (invisible — no friction for users)
  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown';

  // 1. Honeypot — if filled, it's a bot
  if (_hp) {
    console.log(`[bot] Honeypot filled by ${clientIP}`);
    trackEvent('interview_error', { role: roleId, meta: { reason: 'honeypot', ip: clientIP } });
    return new Response(JSON.stringify({ error: 'bot_detected' }), {
      status: 403, headers: { 'Content-Type': 'application/json' },
    });
  }

  // 2. Time gate — first message only. Human needs >2s to read and click
  if (messages.length <= 1 && _t) {
    const elapsed = Date.now() - Number(_t);
    if (elapsed < 2000) {
      console.log(`[bot] Time gate: ${elapsed}ms from ${clientIP}`);
      trackEvent('interview_error', { role: roleId, meta: { reason: 'time_gate', elapsed, ip: clientIP } });
      return new Response(JSON.stringify({ error: 'bot_detected' }), {
        status: 403, headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // 3. Rate limiting
  const rateCheck = checkRateLimit(clientIP);
  if (!rateCheck.allowed) {
    console.log(`[bot] Rate limit: ${rateCheck.reason} from ${clientIP}`);
    return new Response(JSON.stringify({ error: 'rate_limited', reason: rateCheck.reason }), {
      status: 429, headers: { 'Content-Type': 'application/json' },
    });
  }

  // 4. Interview rate — first message only
  if (messages.length <= 1) {
    const interviewRate = checkInterviewRate(clientIP);
    if (!interviewRate.allowed) {
      console.log(`[bot] Interview rate limit from ${clientIP}`);
      trackEvent('fallback_shown', { role: roleId, meta: { reason: 'interview_rate', ip: clientIP } });
      return new Response(JSON.stringify({ error: 'budget_exceeded', reason: 'too_many_interviews' }), {
        status: 429, headers: { 'Content-Type': 'application/json' },
      });
    }
    recordInterviewStart(clientIP);
  }

  // Budget check
  const budget = canProceed(sessionId);
  if (!budget.allowed) {
    trackEvent('fallback_shown', { role: roleId, meta: { reason: budget.reason } });
    return new Response(JSON.stringify({ error: 'budget_exceeded', reason: budget.reason }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Track interview start (first message)
  if (messages.length <= 1) {
    trackEvent('interview_start', { role: roleId, sessionId });
  }

  const requestStart = Date.now();

  const result = streamText({
    model: getModel(),
    system: systemPrompt,
    messages,
    maxSteps: 5,
    onFinish: ({ usage, finishReason }) => {
      const inTok = usage?.promptTokens ?? 0;
      const outTok = usage?.completionTokens ?? 0;
      const cost = calcCost(inTok, outTok);

      // Record cost for budget tracking
      if (sessionId) {
        recordCost(sessionId, cost);
      }

      const logEntry = {
        ts: new Date().toISOString(),
        role: roleId,
        model: MODEL,
        msgCount: messages.length,
        promptTokens: inTok,
        completionTokens: outTok,
        totalTokens: inTok + outTok,
        costUSD: Number(cost.toFixed(6)),
        finishReason,
        durationMs: Date.now() - requestStart,
      };
      try {
        appendFileSync(LOG_FILE, JSON.stringify(logEntry) + '\n');
      } catch (err) {
        console.error('Log write error:', err);
      }
      console.log(
        `[chat] role=${roleId} tokens=${inTok}+${outTok} cost=$${cost.toFixed(4)} finish=${finishReason}`,
      );
    },
    tools: {
      complete_interview: tool({
        description:
          'Zakończ rozmowę kwalifikacyjną i zapisz dane kandydata do Notion. Wywołaj po pełnej rozmowie.',
        parameters: z.object({
          imie_nazwisko: z.string().describe('Imię i nazwisko kandydata'),
          email: z.string().describe('Email kontaktowy'),
          miasto: z.string().optional().describe('Miasto zamieszkania'),
          github: z.string().optional().describe('URL profilu GitHub, Behance, Dribbble itp.'),
          stawka: z.string().optional().describe('Oczekiwana stawka'),
          dostepnosc_h: z.number().optional().describe('Dostępność h/tydzień'),
          uzywa_ai: z
            .enum(['Tak — aktywnie', 'Tak — powierzchownie', 'Nie'])
            .describe('Czy i jak kandydat używa AI'),
          wynik_techniczny: z.number().min(0).max(25).describe('Ocena techniczna/kompetencyjna 0-25 — oceniaj twardo wg kryteriów, nie zawyżaj za sympatyczność'),
          wynik_komunikacja: z.number().min(0).max(30).describe('Ocena komunikacji i dopasowania 0-30 — oceniaj twardo wg kryteriów'),
          notatki: z
            .string()
            .describe('Podsumowanie rozmowy dla Łukasza (3-5 zdań): mocne strony, wątpliwości, powód decyzji'),
        }),
        execute: async (candidate) => {
          // Deterministyczne wyliczenie sumy i decyzji — usuwa ryzyko "mięknięcia" LLM
          const wynik_lacznie = candidate.wynik_techniczny + candidate.wynik_komunikacja;
          const decyzja =
            wynik_lacznie >= 45 ? 'Rozmowa' :
            wynik_lacznie >= 35 ? 'Zadanie techniczne' :
            wynik_lacznie >= 25 ? 'Do przemyślenia' : 'Odrzucony';

          // SAFETY CHECK: oba wyniki = 0 po dłuższej rozmowie = bug modelu
          // (obserwowane sporadycznie przy GPT-4o-mini). Zwracamy błąd żeby model spróbował ponownie.
          const turnsCount = messages.filter((m: Msg) => m.role === 'user').length;
          if (candidate.wynik_techniczny === 0 && candidate.wynik_komunikacja === 0 && turnsCount > 5) {
            console.error(`[complete_interview] SUSPICIOUS: oba wyniki=0 po ${turnsCount} turach — kandydat: ${candidate.imie_nazwisko}`);
            return {
              success: false,
              error: 'Oba wyniki nie mogą być 0 po rozmowie. Proszę ponownie ocenić kandydata na podstawie rozmowy i wywołać narzędzie jeszcze raz z prawidłowymi wynikami (1-25 techniczny, 1-30 komunikacja).',
            };
          }

          try {
            // Sum tokens for this interview from JSONL for this session (best-effort)
            // Since we don't have a sessionId, we use the current messages to count turns only.
            // Totals saved in transcript come from last read of log for this role in current window.
            const turns = messages.filter((m: Msg) => m.role === 'user').length;
            // We'll read tail of log for rough accumulated usage matching this role+recent window
            let tokIn = 0, tokOut = 0;
            try {
              const { readFileSync } = await import('fs');
              const lines = readFileSync(LOG_FILE, 'utf-8').trim().split('\n').slice(-50);
              const cutoff = Date.now() - 60 * 60 * 1000; // last hour
              for (const line of lines) {
                try {
                  const e = JSON.parse(line);
                  if (e.role === roleId && new Date(e.ts).getTime() > cutoff) {
                    tokIn += e.promptTokens ?? 0;
                    tokOut += e.completionTokens ?? 0;
                  }
                } catch { /* skip */ }
              }
            } catch { /* no log yet */ }
            const cost = calcCost(tokIn, tokOut);

            const created = await notion.pages.create({
              parent: { database_id: process.env.NOTION_DATABASE_ID! },
              properties: {
                'Imię i nazwisko': {
                  title: [{ text: { content: candidate.imie_nazwisko } }],
                },
                Email: { email: candidate.email },
                Miasto: {
                  rich_text: [{ text: { content: candidate.miasto ?? '' } }],
                },
                ...(candidate.github ? { GitHub: { url: candidate.github } } : {}),
                'Stawka oczekiwana': {
                  rich_text: [{ text: { content: candidate.stawka ?? '' } }],
                },
                ...(candidate.dostepnosc_h != null
                  ? { 'Dostępność h/tydzień': { number: candidate.dostepnosc_h } }
                  : {}),
                'Używa AI': { select: { name: candidate.uzywa_ai } },
                'Wynik techniczny': { number: candidate.wynik_techniczny },
                'Wynik komunikacja': { number: candidate.wynik_komunikacja },
                'Wynik łącznie': { number: wynik_lacznie },
                Status: { select: { name: 'Nowy' } },
                Rola: { select: { name: role.notionRole } },
                Decyzja: { select: { name: decyzja } },
                'Data aplikacji': {
                  date: { start: new Date().toISOString().split('T')[0] },
                },
                'Notatki AI': {
                  rich_text: [
                    {
                      text: {
                        content: `${candidate.notatki}\n\n---\nKoszt rozmowy: $${cost.toFixed(4)} (${tokIn}+${tokOut} tok, ${turns} tur)`,
                      },
                    },
                  ],
                },
              },
            });

            // Append transcript blocks (Notion limit: 100 blocks per call — chunk if needed)
            const blocks = buildTranscriptBlocks(messages, { tokIn, tokOut, cost, turns });
            for (let i = 0; i < blocks.length; i += 100) {
              await notion.blocks.children.append({
                block_id: created.id,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                children: blocks.slice(i, i + 100) as any,
              });
            }

            trackEvent('interview_complete', {
              role: roleId,
              sessionId,
              meta: { wynik_lacznie, decyzja, cost },
            });

            return { success: true };
          } catch (err) {
            console.error('Notion save error:', err);
            trackEvent('interview_error', { role: roleId, sessionId, meta: { error: String(err) } });
            return { success: false, error: String(err) };
          }
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
