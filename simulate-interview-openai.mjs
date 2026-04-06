#!/usr/bin/env node
/**
 * Symulacja rozmowy kwalifikacyjnej z OpenAI (GPT-4o-mini domyślnie)
 * Użycie: node simulate-interview-openai.mjs <role> <candidate-type> [model]
 * role: wordpress-dev | pm | grafik | ai-specialist | automatyzacje
 * candidate-type: senior | junior
 * model: gpt-4o-mini (default) | gpt-4o | gpt-5-mini | gpt-5
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ROLE_ID = process.argv[2] || 'wordpress-dev';
const CANDIDATE_TYPE = process.argv[3] || 'senior';
const MODEL = process.argv[4] || 'gpt-4o-mini';

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error('Brak OPENAI_API_KEY. Uruchom: OPENAI_API_KEY=sk-... node simulate-interview-openai.mjs ...');
  process.exit(1);
}

const client = new OpenAI({ apiKey: API_KEY });

/** Retry wrapper for rate-limit errors */
async function withRetry(fn, maxRetries = 6) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if ((err?.status === 429 || err?.status === 503) && attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 2000 + Math.random() * 1000;
        process.stderr.write(`\n[retry ${attempt + 1}] rate limit, waiting ${Math.round(delay / 1000)}s...\n`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
}

// ─── Tool definition (OpenAI function calling format) ─────────────────────────
const COMPLETE_INTERVIEW_TOOL = {
  type: 'function',
  function: {
    name: 'complete_interview',
    description: 'Zakończ rozmowę kwalifikacyjną i zapisz dane kandydata. Wywołaj po pełnej rozmowie.',
    parameters: {
      type: 'object',
      required: ['imie_nazwisko', 'email', 'uzywa_ai', 'wynik_techniczny', 'wynik_komunikacja', 'notatki'],
      properties: {
        imie_nazwisko: { type: 'string', description: 'Imię i nazwisko kandydata' },
        email: { type: 'string', description: 'Email kontaktowy' },
        miasto: { type: 'string', description: 'Miasto zamieszkania' },
        github: { type: 'string', description: 'URL profilu GitHub, Behance, Dribbble itp.' },
        stawka: { type: 'string', description: 'Oczekiwana stawka' },
        dostepnosc_h: { type: 'number', description: 'Dostępność h/tydzień' },
        uzywa_ai: { type: 'string', enum: ['Tak — aktywnie', 'Tak — powierzchownie', 'Nie'] },
        wynik_techniczny: { type: 'number', minimum: 0, maximum: 25, description: 'Ocena techniczna 0-25 — TWARDO wg kryteriów' },
        wynik_komunikacja: { type: 'number', minimum: 0, maximum: 30, description: 'Ocena komunikacji 0-30 — TWARDO wg kryteriów' },
        notatki: { type: 'string', description: 'Podsumowanie dla Łukasza (3-5 zdań)' },
      },
    },
  },
};

// Deterministyczna decyzja
function computeDecision(wynik_techniczny, wynik_komunikacja) {
  const wynik_lacznie = wynik_techniczny + wynik_komunikacja;
  const decyzja =
    wynik_lacznie >= 45 ? 'Rozmowa' :
    wynik_lacznie >= 35 ? 'Zadanie techniczne' :
    wynik_lacznie >= 25 ? 'Do przemyślenia' : 'Odrzucony';
  return { wynik_lacznie, decyzja };
}

// ─── Ładowanie promptów z plików .ts ───────────────────────────────────────
function loadPromptFromTs(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/export const \w+_PROMPT\s*=\s*`([\s\S]*?)`;/);
  if (!match) throw new Error(`Nie znaleziono promptu w ${filePath}`);
  return match[1];
}

const PROMPTS_DIR = path.join(__dirname, 'src/lib/prompts');
const ROLE_PROMPTS = {
  'wordpress-dev': loadPromptFromTs(path.join(PROMPTS_DIR, 'wordpress-dev.ts')),
  pm: loadPromptFromTs(path.join(PROMPTS_DIR, 'pm.ts')),
  grafik: loadPromptFromTs(path.join(PROMPTS_DIR, 'grafik.ts')),
  'ai-specialist': loadPromptFromTs(path.join(PROMPTS_DIR, 'ai-specialist.ts')),
  automatyzacje: loadPromptFromTs(path.join(PROMPTS_DIR, 'automatyzacje.ts')),
};

// ─── Ładowanie person kandydatów (z oryginalnego skryptu) ─────────────────
const { CANDIDATES } = await import('./candidates.mjs');

// ─── Simulation ────────────────────────────────────────────────────────────
async function simulateInterview(roleId, candidateType) {
  const rolePrompt = ROLE_PROMPTS[roleId];
  if (!rolePrompt) throw new Error(`Unknown role: ${roleId}`);

  const roleData = CANDIDATES[roleId];
  if (!roleData) throw new Error(`No candidates for role: ${roleId}`);

  const candidate = roleData[candidateType];
  if (!candidate) throw new Error(`No candidate type ${candidateType} for role ${roleId}`);

  console.log(`[${roleId}/${candidateType}] Starting: ${candidate.name} (model: ${MODEL})`);

  const transcript = [];

  // OpenAI używa pojedynczej tablicy messages z rolami system/user/assistant
  // Kaja ma system=rolePrompt, assistant=Kaja, user=kandydat
  const kajaMessages = [
    { role: 'system', content: rolePrompt },
    { role: 'user', content: 'Cześć, chciałbym przystąpić do rozmowy kwalifikacyjnej.' },
  ];

  const candidateMessages = [
    { role: 'system', content: candidate.systemPrompt },
    { role: 'assistant', content: 'Cześć, chciałbym przystąpić do rozmowy kwalifikacyjnej.' },
  ];

  let interviewResult = null;
  let turns = 0;
  const MAX_TURNS = 50;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  while (turns < MAX_TURNS) {
    turns++;

    // ── Kaja's turn ──────────────────────────────────────────────
    const kajaResponse = await withRetry(() => client.chat.completions.create({
      model: MODEL,
      messages: kajaMessages,
      tools: [COMPLETE_INTERVIEW_TOOL],
      ...(MODEL.startsWith('gpt-5') ? { max_completion_tokens: 1024 } : { max_tokens: 1024 }),
    }));

    totalInputTokens += kajaResponse.usage?.prompt_tokens ?? 0;
    totalOutputTokens += kajaResponse.usage?.completion_tokens ?? 0;

    const kajaMsg = kajaResponse.choices[0].message;

    // Check for tool call
    if (kajaMsg.tool_calls && kajaMsg.tool_calls.length > 0) {
      const toolCall = kajaMsg.tool_calls.find(tc => tc.function.name === 'complete_interview');
      if (toolCall) {
        console.log(`[${roleId}/${candidateType}] complete_interview called at turn ${turns}`);
        const args = JSON.parse(toolCall.function.arguments);

        // SAFETY CHECK: oba wyniki=0 po dłuższej rozmowie = bug modelu → retry
        if (args.wynik_techniczny === 0 && args.wynik_komunikacja === 0 && turns > 5) {
          console.warn(`\n[${roleId}/${candidateType}] FLAKY: oba wyniki=0, prośba o retry`);
          kajaMessages.push(kajaMsg);
          kajaMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify({
              success: false,
              error: 'Oba wyniki nie mogą być 0 po rozmowie. Oceń ponownie na podstawie rozmowy i wywołaj tool z wynikami 1-25 techniczny i 1-30 komunikacja.',
            }),
          });
          continue; // back to loop, let model retry
        }

        const { wynik_lacznie, decyzja } = computeDecision(args.wynik_techniczny, args.wynik_komunikacja);
        interviewResult = { ...args, wynik_lacznie, decyzja };

        // Kaja's farewell text (if any, before the tool call)
        if (kajaMsg.content) {
          transcript.push({ role: 'kaja', text: kajaMsg.content });
        }

        // Send tool result back
        kajaMessages.push(kajaMsg);
        kajaMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify({ success: true }),
        });

        // Get final farewell
        const farewellResponse = await withRetry(() => client.chat.completions.create({
          model: MODEL,
          messages: kajaMessages,
          tools: [COMPLETE_INTERVIEW_TOOL],
          ...(MODEL.startsWith('gpt-5') ? { max_completion_tokens: 512 } : { max_tokens: 512 }),
        }));
        totalInputTokens += farewellResponse.usage?.prompt_tokens ?? 0;
        totalOutputTokens += farewellResponse.usage?.completion_tokens ?? 0;

        const farewellText = farewellResponse.choices[0].message.content;
        if (farewellText) transcript.push({ role: 'kaja', text: farewellText });

        break;
      }
    }

    const kajaText = kajaMsg.content || '';
    if (!kajaText.trim()) {
      console.warn(`[${roleId}/${candidateType}] Empty Kaja response at turn ${turns}`);
      break;
    }

    transcript.push({ role: 'kaja', text: kajaText });
    kajaMessages.push({ role: 'assistant', content: kajaText });
    candidateMessages.push({ role: 'user', content: kajaText });

    // ── Candidate's turn ──────────────────────────────────────────
    const candidateResponse = await withRetry(() => client.chat.completions.create({
      model: MODEL,
      messages: candidateMessages,
      ...(MODEL.startsWith('gpt-5') ? { max_completion_tokens: 512 } : { max_tokens: 512 }),
    }));

    totalInputTokens += candidateResponse.usage?.prompt_tokens ?? 0;
    totalOutputTokens += candidateResponse.usage?.completion_tokens ?? 0;

    const candidateText = candidateResponse.choices[0].message.content || '';
    transcript.push({ role: 'candidate', name: candidate.name, text: candidateText });
    candidateMessages.push({ role: 'assistant', content: candidateText });
    kajaMessages.push({ role: 'user', content: candidateText });

    process.stdout.write('.');
  }

  // Koszt w USD (ceny GPT-4o-mini: $0.15/MTok input, $0.60/MTok output)
  const prices = {
    'gpt-4o-mini': { in: 0.15, out: 0.60 },
    'gpt-4o': { in: 2.50, out: 10.00 },
    'gpt-5-mini': { in: 0.25, out: 2.00 },
    'gpt-5': { in: 1.25, out: 10.00 },
  };
  const p = prices[MODEL] || prices['gpt-4o-mini'];
  const cost = (totalInputTokens * p.in + totalOutputTokens * p.out) / 1_000_000;

  console.log(`\n[${roleId}/${candidateType}] Done. Turns: ${turns} | Tokens: ${totalInputTokens}in+${totalOutputTokens}out | Koszt: $${cost.toFixed(4)}`);

  return {
    meta: {
      roleId,
      candidateType,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      candidateCity: candidate.city,
      simulatedAt: new Date().toISOString(),
      turns,
      model: MODEL,
      provider: 'openai',
      totalInputTokens,
      totalOutputTokens,
      costUSD: Number(cost.toFixed(6)),
    },
    result: interviewResult,
    transcript,
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const simDir = path.join(__dirname, 'simulations-openai');
if (!fs.existsSync(simDir)) fs.mkdirSync(simDir, { recursive: true });

const simulation = await simulateInterview(ROLE_ID, CANDIDATE_TYPE);

const outFile = path.join(simDir, `${ROLE_ID}-${CANDIDATE_TYPE}.json`);
fs.writeFileSync(outFile, JSON.stringify(simulation, null, 2));

console.log(`\n✅ Saved to ${outFile}`);
console.log(`\n📊 WYNIK: ${simulation.meta.candidateName} (${MODEL})`);
if (simulation.result) {
  console.log(`   Techniczny: ${simulation.result.wynik_techniczny}/25`);
  console.log(`   Komunikacja: ${simulation.result.wynik_komunikacja}/30`);
  console.log(`   Łącznie: ${simulation.result.wynik_lacznie}/55`);
  console.log(`   Decyzja: ${simulation.result.decyzja}`);
  console.log(`   Koszt rozmowy: $${simulation.meta.costUSD.toFixed(4)}`);
}
