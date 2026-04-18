import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { streamText, generateText, tool } from 'ai';
import { z } from 'zod';
import { Client } from '@notionhq/client';
import { getRole } from '@/lib/roles';
import { mkdirSync, existsSync } from 'fs';
import { appendFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { canProceed, recordCost } from '@/lib/budget';
import { notifyNewCandidate, sendCandidateConfirmation } from '@/lib/mailer';
import { trackEvent } from '@/lib/analytics';
import { checkRateLimit, checkInterviewRate, recordInterviewStart } from '@/lib/rate-limit';
import { getRoleOverride, getGlobalPromptOverrides, getModelOverride, AVAILABLE_MODELS } from '@/lib/content';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Provider domyślny z env var: MODEL_PROVIDER=openai | anthropic (default: openai — tańszy)
// Override z panelu admina (content.json) ma priorytet nad env.
const ENV_PROVIDER = (process.env.MODEL_PROVIDER ?? 'openai') as 'openai' | 'anthropic';

// Domyślne modele + cennik per MTok (input, output) w USD — używane gdy brak override'u.
// Ceny dla override'ów z panelu admina są pobierane z AVAILABLE_MODELS (content.ts).
const MODELS = {
  openai: { id: 'gpt-4o-mini', priceIn: 0.15, priceOut: 0.60 },
  anthropic: { id: 'claude-sonnet-4-6', priceIn: 3, priceOut: 15 },
} as const;

/**
 * Rozwiązuje aktywną konfigurację modelu dla bieżącego requestu.
 * Kolejność: override z content.json > domyślne z env MODEL_PROVIDER.
 */
function resolveModelConfig(): { provider: 'openai' | 'anthropic'; modelId: string; priceIn: number; priceOut: number } {
  const override = getModelOverride();
  if (override) {
    const list = AVAILABLE_MODELS[override.provider];
    const m = list.find((x) => x.id === override.modelId);
    if (m) {
      return { provider: override.provider, modelId: m.id, priceIn: m.priceIn, priceOut: m.priceOut };
    }
  }
  const def = MODELS[ENV_PROVIDER];
  return { provider: ENV_PROVIDER, modelId: def.id, priceIn: def.priceIn, priceOut: def.priceOut };
}

function getModel() {
  const cfg = resolveModelConfig();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (cfg.provider === 'openai' ? openai(cfg.modelId) : anthropic(cfg.modelId)) as any;
}

// Log dir
const LOG_DIR = join(process.cwd(), 'logs');
if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true });
const LOG_FILE = join(LOG_DIR, 'conversations.jsonl');

// Transcripts dir — każda sesja to osobny plik nadpisywany przy każdym turze
const TRANSCRIPTS_DIR = join(LOG_DIR, 'transcripts');
if (!existsSync(TRANSCRIPTS_DIR)) mkdirSync(TRANSCRIPTS_DIR, { recursive: true });

// Sesje już zapisane do Notion — nie triggeruj auto-scoring drugi raz
const scoredSessions = new Set<string>();

type Msg = { role: string; content: unknown };

function calcCost(inTok: number, outTok: number, priceIn?: number, priceOut?: number) {
  // Gdy nie podano cen, wylicz na podstawie aktualnej konfiguracji (override lub env default).
  const cfg = priceIn == null || priceOut == null ? resolveModelConfig() : null;
  const pIn = priceIn ?? cfg!.priceIn;
  const pOut = priceOut ?? cfg!.priceOut;
  return (inTok * pIn + outTok * pOut) / 1_000_000;
}

/** Flatten AI SDK message content → plain text */
function msgToText(m: Msg): string {
  if (typeof m.content === 'string') return m.content;
  if (Array.isArray(m.content)) {
    return m.content
      .map((c) => {
        if (typeof c === 'string') return c;
        if (!c || typeof c !== 'object') return '';
        const part = c as Record<string, unknown>;
        if ('text' in part) return String(part.text);
        // Tool-call content part — pokaż jako placeholder w transkrypcie
        if (part.type === 'tool-call') return `[wywołano narzędzie: ${part.toolName ?? 'unknown'}]`;
        if (part.type === 'tool-result') return `[wynik narzędzia]`;
        return '';
      })
      .join('');
  }
  return '';
}

/** Build Notion blocks for transcript */
function buildTranscriptBlocks(messages: Msg[], totals: { tokIn: number; tokOut: number; cost: number; turns: number; modelId?: string }) {
  const modelLabel = totals.modelId ?? resolveModelConfig().modelId;
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
              content: `Model: ${modelLabel} · Tury: ${totals.turns} · Tokeny: ${totals.tokIn} in / ${totals.tokOut} out · Koszt: $${totals.cost.toFixed(4)}`,
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

/** Fallback: gdy model nie wywołał complete_interview, robimy osobny scoring pass */
async function autoScoreInterview(messages: Msg[], roleId: string, sessionId: string, roleTitle: string) {
  if (scoredSessions.has(sessionId)) return;
  scoredSessions.add(sessionId);

  try {
    const result = await generateText({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      model: getModel() as any,
      system: `Jesteś analitykiem rozmów rekrutacyjnych. Na podstawie poniższej rozmowy wywołaj narzędzie complete_interview z danymi kandydata.
Wyciągnij: imię i nazwisko, email (jeśli padł), miasto, stawkę, dostępność h/tydzień, użycie AI.
Oceń wynik_techniczny (0-25) i wynik_komunikacja (0-30) uczciwie na podstawie odpowiedzi.
Jeśli email nie padł — wpisz "brak@brak.pl". MUSISZ wywołać narzędzie complete_interview.`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: messages as any,
      maxSteps: 3,
      tools: {
        complete_interview: tool({
          description: 'Zapisz dane kandydata po analizie rozmowy.',
          parameters: z.object({
            imie_nazwisko: z.string(),
            email: z.string(),
            miasto: z.string().optional(),
            github: z.string().optional(),
            stawka: z.string().optional(),
            dostepnosc_h: z.number().optional(),
            uzywa_ai: z.enum(['Tak — aktywnie', 'Tak — powierzchownie', 'Nie']),
            wynik_techniczny: z.number().min(0).max(25),
            wynik_komunikacja: z.number().min(0).max(30),
            notatki: z.string(),
            wczesne_zakonczenie: z.boolean().optional(),
          }),
          execute: async (candidate) => {
            const wynik_lacznie = candidate.wynik_techniczny + candidate.wynik_komunikacja;
            const decyzja =
              wynik_lacznie >= 45 ? 'Rozmowa' :
              wynik_lacznie >= 35 ? 'Zadanie techniczne' :
              wynik_lacznie >= 25 ? 'Do przemyślenia' : 'Odrzucony';

            // Duplikaty — sprawdź czy email już jest w Notion
            const emailToCheck = candidate.email.includes('brak@') ? null : candidate.email;
            if (emailToCheck) {
              try {
                const existing = await notion.databases.query({
                  database_id: process.env.NOTION_DATABASE_ID!,
                  filter: { property: 'Email', email: { equals: emailToCheck } },
                  page_size: 1,
                });
                if (existing.results.length > 0) {
                  console.log(`[auto-score] Duplikat emaila ${emailToCheck} — pomijam`);
                  return { success: false, reason: 'duplicate' };
                }
              } catch { /* ignoruj błąd query */ }
            }

            const created = await notion.pages.create({
              parent: { database_id: process.env.NOTION_DATABASE_ID! },
              properties: {
                'Imię i nazwisko': { title: [{ text: { content: candidate.imie_nazwisko } }] },
                Email: { email: candidate.email.includes('brak@') ? '' : candidate.email },
                Miasto: { rich_text: [{ text: { content: candidate.miasto ?? '' } }] },
                ...(candidate.github ? { GitHub: { url: candidate.github } } : {}),
                'Stawka oczekiwana': { rich_text: [{ text: { content: candidate.stawka ?? '' } }] },
                ...(candidate.dostepnosc_h != null ? { 'Dostępność h/tydzień': { number: candidate.dostepnosc_h } } : {}),
                'Używa AI': { select: { name: candidate.uzywa_ai } },
                'Wynik techniczny': { number: candidate.wynik_techniczny },
                'Wynik komunikacja': { number: candidate.wynik_komunikacja },
                'Wynik łącznie': { number: wynik_lacznie },
                Status: { select: { name: 'Nowy' } },
                Rola: { select: { name: roleTitle } },
                Decyzja: { select: { name: decyzja } },
                'Data aplikacji': { date: { start: new Date().toISOString().split('T')[0] } },
                'Notatki AI': { rich_text: [{ text: { content: `[AUTO-SCORING]\n${candidate.notatki}` } }] },
              },
            });

            const blocks = buildTranscriptBlocks(messages, { tokIn: 0, tokOut: 0, cost: 0, turns: messages.filter(m => m.role === 'user').length });
            for (let i = 0; i < blocks.length; i += 100) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await notion.blocks.children.append({ block_id: created.id, children: blocks.slice(i, i + 100) as any });
            }

            trackEvent('interview_complete', { role: roleId, sessionId, meta: { wynik_lacznie, decyzja, auto: true } });

            try {
              await notifyNewCandidate({
                imie_nazwisko: candidate.imie_nazwisko,
                email: candidate.email,
                role: roleTitle,
                wynik_lacznie,
                decyzja,
                notatki: candidate.notatki,
                notionUrl: `https://www.notion.so/${created.id.replace(/-/g, '')}`,
                wczesneZakonczenie: candidate.wczesne_zakonczenie ?? false,
              });
              if (emailToCheck) await sendCandidateConfirmation({ imie_nazwisko: candidate.imie_nazwisko, email: candidate.email, role: roleTitle });
            } catch (mailErr) { console.error('Auto-score mail error:', mailErr); }

            return { success: true };
          },
        }),
      },
    });
    console.log(`[auto-score] sessionId=${sessionId} finishReason=${result.finishReason}`);
  } catch (err) {
    console.error('[auto-score] error:', err);
    scoredSessions.delete(sessionId);
  }
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

  // 2. Time gate — first message only. Client sends ms since page load. Bot clicks in <800ms
  if (messages.length <= 1 && _t != null) {
    const elapsed = Number(_t);
    if (elapsed < 800) {
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

  // 5. Spam / nonsense detection — ostatnia wiadomość użytkownika
  const lastUserMsg = [...messages].reverse().find((m: Msg) => m.role === 'user');
  const lastText = lastUserMsg ? msgToText(lastUserMsg as Msg).trim() : '';
  if (lastText.length > 0) {
    const alphaRatio = (lastText.match(/[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g) ?? []).length / lastText.length;
    const isRepeated = lastText.length > 4 && new Set(lastText.replace(/\s/g, '')).size <= 2;
    const isTooShort = lastText.length < 2;
    if ((alphaRatio < 0.25 && lastText.length > 5) || isRepeated || isTooShort) {
      console.log(`[spam] Nonsense message from ${clientIP}: "${lastText.slice(0, 50)}"`);
      // Nie blokujemy — pozwalamy Kai obsłużyć to zgodnie z promptem (ostrzeżenie → zakończenie)
      // Ale logujemy dla statystyk
      trackEvent('interview_error', { role: roleId, sessionId, meta: { reason: 'nonsense_message', ip: clientIP } });
    }
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

  // Zapisz aktywną konfigurację raz na request (override lub env default) — spójność w onFinish/logach
  const activeModel = resolveModelConfig();

  const result = streamText({
    model: getModel(),
    system: systemPrompt,
    messages,
    maxSteps: 5,
    onFinish: ({ usage, finishReason }) => {
      const inTok = usage?.promptTokens ?? 0;
      const outTok = usage?.completionTokens ?? 0;
      const cost = calcCost(inTok, outTok, activeModel.priceIn, activeModel.priceOut);

      // Record cost for budget tracking
      if (sessionId) {
        recordCost(sessionId, cost);
      }

      const logEntry = {
        ts: new Date().toISOString(),
        role: roleId,
        model: activeModel.modelId,
        provider: activeModel.provider,
        msgCount: messages.length,
        promptTokens: inTok,
        completionTokens: outTok,
        totalTokens: inTok + outTok,
        costUSD: Number(cost.toFixed(6)),
        finishReason,
        durationMs: Date.now() - requestStart,
      };
      // Non-blocking: fire-and-forget zapis metadanych
      appendFile(LOG_FILE, JSON.stringify(logEntry) + '\n').catch((err) => {
        console.error('Log write error:', err);
      });

      // Fallback auto-scoring — gdy model nie wywołał complete_interview a rozmowa była długa
      if (finishReason === 'stop' && messages.length >= 16 && sessionId && !scoredSessions.has(sessionId)) {
        // Detekcja pożegnania — wymagamy SPECYFICZNYCH fraz zamykających rozmowę
        // (nie samo "dziękuję" żeby uniknąć false positives typu "dziękuję za to pytanie")
        const lastAssistant = [...messages].reverse().find((m: Msg) => m.role === 'assistant');
        const lastText = lastAssistant ? msgToText(lastAssistant as Msg).toLowerCase() : '';
        const farewellPhrases = [
          'to wszystkie moje pytania',
          'to wszystkie pytania',
          'tyle z mojej strony',
          'wielkie dzięki za rozmow',
          'dzięki za rozmow',
          'życzę powodzenia',
          'miło było porozmawiać',
          'łukasz odezwie się',
          'łukasz się odezwie',
          'odezwiemy się do ciebie',
          'do usłyszenia',
        ];
        const isFarewell = farewellPhrases.some(p => lastText.includes(p));
        if (isFarewell) {
          console.log(`[auto-score] Wykryto pożegnanie, uruchamiam auto-scoring dla ${sessionId}`);
          autoScoreInterview(messages, roleId, sessionId, role.title).catch(console.error);
        }
      }

      // Zapis pełnego transkryptu — nadpisujemy plik sesji przy każdym turze
      // Non-blocking: nie opóźnia response dla kandydata
      if (sessionId && /^[a-zA-Z0-9_-]{8,64}$/.test(sessionId)) {
        const transcriptPath = join(TRANSCRIPTS_DIR, `${sessionId}.json`);
        writeFile(transcriptPath, JSON.stringify({
          sessionId,
          role: roleId,
          ts: new Date().toISOString(),
          msgCount: messages.length,
          costUSD: Number(cost.toFixed(6)),
          finishReason,
          messages,
        })).catch((err) => {
          console.error('Transcript write error:', err);
        });
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
          wczesne_zakonczenie: z
            .boolean()
            .optional()
            .describe('true jeśli kandydat zakończył rozmowę wcześniej niż planowano'),
        }),
        execute: async (candidate) => {
          // Deterministyczne wyliczenie sumy i decyzji — usuwa ryzyko "mięknięcia" LLM
          const wynik_lacznie = candidate.wynik_techniczny + candidate.wynik_komunikacja;
          const decyzja =
            wynik_lacznie >= 45 ? 'Rozmowa' :
            wynik_lacznie >= 35 ? 'Zadanie techniczne' :
            wynik_lacznie >= 25 ? 'Do przemyślenia' : 'Odrzucony';

          // ATOMIC: oznacz sesję jako ocenioną NATYCHMIAST (przed walidacją i async work)
          // Zapobiega race condition gdy fallback auto-scoring odpali się równolegle
          if (sessionId) {
            if (scoredSessions.has(sessionId)) {
              console.log(`[complete_interview] Sesja ${sessionId} już oceniona — pomijam`);
              return { success: false, reason: 'already_scored' };
            }
            scoredSessions.add(sessionId);
          }

          // SAFETY CHECK: oba wyniki = 0 po dłuższej rozmowie = bug modelu
          const turnsCount = messages.filter((m: Msg) => m.role === 'user').length;
          if (candidate.wynik_techniczny === 0 && candidate.wynik_komunikacja === 0 && turnsCount > 5) {
            console.error(`[complete_interview] SUSPICIOUS: oba wyniki=0 po ${turnsCount} turach — kandydat: ${candidate.imie_nazwisko}`);
            if (sessionId) scoredSessions.delete(sessionId); // pozwól spróbować ponownie
            return {
              success: false,
              error: 'Oba wyniki nie mogą być 0 po rozmowie. Proszę ponownie ocenić kandydata na podstawie rozmowy i wywołać narzędzie jeszcze raz z prawidłowymi wynikami (1-25 techniczny, 1-30 komunikacja).',
            };
          }

          // Duplikaty — sprawdź czy ten email już jest w Notion
          try {
            const existing = await notion.databases.query({
              database_id: process.env.NOTION_DATABASE_ID!,
              filter: { property: 'Email', email: { equals: candidate.email } },
              page_size: 1,
            });
            if (existing.results.length > 0) {
              console.log(`[complete_interview] Duplikat emaila ${candidate.email} — pomijam zapis do Notion`);
              return { success: false, reason: 'duplicate_email' };
            }
          } catch { /* ignoruj błąd query, zapisz normalnie */ }

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

            // Emaile — Łukasz + kandydat
            try {
              await notifyNewCandidate({
                imie_nazwisko: candidate.imie_nazwisko,
                email: candidate.email,
                role: role.title,
                wynik_lacznie,
                decyzja,
                notatki: candidate.notatki,
                notionUrl: `https://www.notion.so/${created.id.replace(/-/g, '')}`,
                wczesneZakonczenie: candidate.wczesne_zakonczenie ?? false,
              });
              // Email kandydata tylko jeśli mamy prawdziwy adres
              if (candidate.email && !candidate.email.includes('brak@') && candidate.email.includes('@')) {
                await sendCandidateConfirmation({
                  imie_nazwisko: candidate.imie_nazwisko,
                  email: candidate.email,
                  role: role.title,
                });
              }
            } catch (mailErr) {
              console.error('Email notify error:', mailErr);
            }

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
