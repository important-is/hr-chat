#!/usr/bin/env node
/**
 * Porównanie wyników scoringu między modelami (Claude Haiku vs GPT-4o-mini)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CLAUDE_DIR = path.join(__dirname, 'simulations');
const OPENAI_DIR = path.join(__dirname, 'simulations-openai');

const ROLE_LABELS = {
  'wordpress-dev': 'WP Dev',
  pm: 'PM',
  grafik: 'Grafik',
  'ai-specialist': 'AI Spec',
  automatyzacje: 'Automat.',
};

function loadSims(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8')));
}

const claudeSims = loadSims(CLAUDE_DIR);
const openaiSims = loadSims(OPENAI_DIR);

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('   PORÓWNANIE MODELI: Claude Haiku 4.5 vs OpenAI GPT-4o-mini');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

// Łączymy po roleId + candidateType
const keys = new Set([
  ...claudeSims.map(s => `${s.meta.roleId}/${s.meta.candidateType}`),
  ...openaiSims.map(s => `${s.meta.roleId}/${s.meta.candidateType}`),
]);

console.log('## 1. TABELA PORÓWNAWCZA — punktacja');
console.log('');
console.log(`${'Kandydat'.padEnd(28)} ${'Claude'.padEnd(18)} ${'GPT-4o-mini'.padEnd(18)} Różnica`);
console.log('─'.repeat(80));

let totalDiff = 0;
let countBoth = 0;

for (const key of [...keys].sort()) {
  const [roleId, candidateType] = key.split('/');
  const claude = claudeSims.find(s => s.meta.roleId === roleId && s.meta.candidateType === candidateType);
  const openai = openaiSims.find(s => s.meta.roleId === roleId && s.meta.candidateType === candidateType);

  const name = (claude?.meta.candidateName || openai?.meta.candidateName || '').padEnd(20);
  const role = ROLE_LABELS[roleId] || roleId;
  const label = `${name}(${role.padEnd(8)})`.padEnd(28);

  const claudeScore = claude?.result
    ? `${String(claude.result.wynik_lacznie).padStart(2)}/55 ${claude.result.decyzja.substring(0, 10)}`.padEnd(18)
    : '—'.padEnd(18);
  const openaiScore = openai?.result
    ? `${String(openai.result.wynik_lacznie).padStart(2)}/55 ${openai.result.decyzja.substring(0, 10)}`.padEnd(18)
    : '—'.padEnd(18);

  let diffStr = '';
  if (claude?.result && openai?.result) {
    const diff = openai.result.wynik_lacznie - claude.result.wynik_lacznie;
    totalDiff += Math.abs(diff);
    countBoth++;
    diffStr = diff > 0 ? `+${diff}` : String(diff);
  }

  console.log(`${label} ${claudeScore} ${openaiScore} ${diffStr}`);
}

console.log('');

if (countBoth > 0) {
  console.log(`Średnia |różnica| w punktacji: ${(totalDiff / countBoth).toFixed(1)} pkt`);
}
console.log('');

// Zgodność decyzji
console.log('## 2. ZGODNOŚĆ DECYZJI');
console.log('');

let agree = 0;
let disagree = 0;
const disagreements = [];

for (const key of keys) {
  const [roleId, candidateType] = key.split('/');
  const claude = claudeSims.find(s => s.meta.roleId === roleId && s.meta.candidateType === candidateType);
  const openai = openaiSims.find(s => s.meta.roleId === roleId && s.meta.candidateType === candidateType);
  if (!claude?.result || !openai?.result) continue;
  if (claude.result.decyzja === openai.result.decyzja) {
    agree++;
  } else {
    disagree++;
    disagreements.push({
      name: claude.meta.candidateName,
      role: ROLE_LABELS[roleId],
      claude: `${claude.result.wynik_lacznie}→${claude.result.decyzja}`,
      openai: `${openai.result.wynik_lacznie}→${openai.result.decyzja}`,
    });
  }
}

console.log(`Zgodnych decyzji: ${agree}/${agree + disagree}`);
if (disagreements.length > 0) {
  console.log('');
  console.log('Rozbieżności:');
  for (const d of disagreements) {
    console.log(`  ${d.name} (${d.role}): Claude ${d.claude} | OpenAI ${d.openai}`);
  }
}
console.log('');

// Koszty
console.log('## 3. KOSZTY');
console.log('');

const openaiTotalCost = openaiSims.reduce((acc, s) => acc + (s.meta.costUSD || 0), 0);
const openaiAvgCost = openaiTotalCost / (openaiSims.length || 1);
const openaiAvgTokens = openaiSims.reduce((acc, s) => acc + (s.meta.totalInputTokens || 0) + (s.meta.totalOutputTokens || 0), 0) / (openaiSims.length || 1);

console.log(`OpenAI GPT-4o-mini (${openaiSims.length} rozmów):`);
console.log(`  Łączny koszt: $${openaiTotalCost.toFixed(4)}`);
console.log(`  Średni koszt/rozmowę: $${openaiAvgCost.toFixed(4)}`);
console.log(`  Średnia długość: ~${Math.round(openaiAvgTokens)} tokenów`);
console.log('');
console.log(`Projekcja dla 100 rozmów:`);
console.log(`  GPT-4o-mini:         $${(openaiAvgCost * 100).toFixed(2)}`);
console.log(`  Claude Haiku 4.5:    $${(openaiAvgCost * 100 * 6).toFixed(2)} (6x droższy)`);
console.log(`  Claude Sonnet 4.6:   $${(openaiAvgCost * 100 * 20).toFixed(2)} (20x droższy)`);
console.log('');

// Długość rozmów
const openaiAvgTurns = openaiSims.reduce((acc, s) => acc + (s.meta.turns || 0), 0) / (openaiSims.length || 1);
const claudeAvgTurns = claudeSims.reduce((acc, s) => acc + (s.meta.turns || 0), 0) / (claudeSims.length || 1);

console.log('## 4. DŁUGOŚĆ ROZMÓW');
console.log('');
console.log(`Claude Haiku — średnio ${claudeAvgTurns.toFixed(1)} tur`);
console.log(`GPT-4o-mini  — średnio ${openaiAvgTurns.toFixed(1)} tur`);
console.log('');
