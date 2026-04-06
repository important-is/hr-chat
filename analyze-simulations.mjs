#!/usr/bin/env node
/**
 * Analiza wyników symulacji rozmów kwalifikacyjnych
 * Użycie: node analyze-simulations.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const simDir = path.join(__dirname, 'simulations');

const ROLE_LABELS = {
  'wordpress-dev': 'WordPress Developer',
  pm: 'Project Manager',
  grafik: 'Grafik / Designer',
  'ai-specialist': 'AI Specialist',
  automatyzacje: 'Automatyzacje',
};

function loadSimulations() {
  if (!fs.existsSync(simDir)) {
    console.error('Brak katalogu simulations/');
    process.exit(1);
  }
  const files = fs.readdirSync(simDir).filter(f => f.endsWith('.json'));
  return files.map(f => {
    const data = JSON.parse(fs.readFileSync(path.join(simDir, f), 'utf-8'));
    return { file: f, ...data };
  });
}

function renderDecisionBadge(decyzja) {
  const map = {
    Rozmowa: '✅ Rozmowa',
    'Zadanie techniczne': '🔧 Zadanie techniczne',
    'Do przemyślenia': '🤔 Do przemyślenia',
    Odrzucony: '❌ Odrzucony',
  };
  return map[decyzja] || decyzja || '—';
}

function renderBar(val, max, width = 20) {
  const filled = Math.round((val / max) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled) + ` ${val}/${max}`;
}

function analyzeTranscript(transcript) {
  const kajaTurns = transcript.filter(m => m.role === 'kaja').length;
  const candidateTurns = transcript.filter(m => m.role === 'candidate').length;
  const totalWords = transcript.reduce((acc, m) => acc + m.text.split(/\s+/).length, 0);
  const avgCandidateWordCount = Math.round(
    transcript
      .filter(m => m.role === 'candidate')
      .reduce((acc, m) => acc + m.text.split(/\s+/).length, 0) / (candidateTurns || 1)
  );

  return { kajaTurns, candidateTurns, totalWords, avgCandidateWordCount };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const simulations = loadSimulations();

if (simulations.length === 0) {
  console.error('Brak plików symulacji w simulations/');
  process.exit(1);
}

const lines = [];
const log = (...args) => {
  const line = args.join(' ');
  console.log(line);
  lines.push(line);
};

log('');
log('═══════════════════════════════════════════════════════════════');
log('   ANALIZA SYMULACJI ROZMÓW KWALIFIKACYJNYCH — important.is');
log(`   ${new Date().toLocaleDateString('pl-PL', { day: '2-digit', month: 'long', year: 'numeric' })}`);
log('═══════════════════════════════════════════════════════════════');
log('');

// ─── 1. Tabela wyników ────────────────────────────────────────────────────────
log('## 1. WYNIKI WSZYSTKICH KANDYDATÓW');
log('');
log(`${'Kandydat'.padEnd(22)} ${'Rola'.padEnd(22)} ${'Tech'.padEnd(6)} ${'Kom'.padEnd(5)} ${'Sum'.padEnd(5)} Decyzja`);
log('─'.repeat(90));

const sorted = [...simulations].sort((a, b) => (b.result?.wynik_lacznie ?? 0) - (a.result?.wynik_lacznie ?? 0));

for (const sim of sorted) {
  const r = sim.result;
  const name = sim.meta.candidateName.padEnd(22);
  const role = (ROLE_LABELS[sim.meta.roleId] || sim.meta.roleId).padEnd(22);
  const tech = String(r?.wynik_techniczny ?? '?').padEnd(6);
  const kom = String(r?.wynik_komunikacja ?? '?').padEnd(5);
  const sum = String(r?.wynik_lacznie ?? '?').padEnd(5);
  const dec = renderDecisionBadge(r?.decyzja);
  log(`${name} ${role} ${tech} ${kom} ${sum} ${dec}`);
}

log('');

// ─── 2. Szczegóły per kandydat ─────────────────────────────────────────────
log('## 2. SZCZEGÓŁOWE OCENY');
log('');

for (const sim of sorted) {
  const r = sim.result;
  const stats = analyzeTranscript(sim.transcript || []);
  const type = sim.meta.candidateType === 'senior' ? '⭐ Senior' : '🌱 Junior';

  log(`### ${sim.meta.candidateName} — ${ROLE_LABELS[sim.meta.roleId] || sim.meta.roleId} ${type}`);
  log(`   Email: ${sim.meta.candidateEmail} | Miasto: ${sim.meta.candidateCity}`);
  log(`   Rozmowa: ${sim.meta.turns} tur | ${stats.kajaTurns} pytań Kai | śr. ${stats.avgCandidateWordCount} słów/odpowiedź`);

  if (r) {
    log(`   Stawka: ${r.stawka || '—'} | Dostępność: ${r.dostepnosc_h ? r.dostepnosc_h + 'h/tyg' : '—'} | AI: ${r.uzywa_ai}`);
    log(`   Techniczny:   ${renderBar(r.wynik_techniczny, 25)}`);
    log(`   Komunikacja:  ${renderBar(r.wynik_komunikacja, 30)}`);
    log(`   ŁĄCZNIE:      ${renderBar(r.wynik_lacznie, 55)}`);
    log(`   Decyzja: ${renderDecisionBadge(r.decyzja)}`);
    log('');
    log(`   📝 Notatki AI:`);
    // Wrap notatki at ~80 chars
    const notatki = r.notatki || '';
    const words = notatki.split(' ');
    let currentLine = '   ';
    for (const word of words) {
      if ((currentLine + word).length > 82) {
        log(currentLine);
        currentLine = '   ' + word + ' ';
      } else {
        currentLine += word + ' ';
      }
    }
    if (currentLine.trim()) log(currentLine);
  } else {
    log('   ⚠️  Brak wyników (complete_interview nie wywołane)');
  }
  log('');
}

// ─── 3. Porównanie senior vs junior per rola ─────────────────────────────────
const roles = [...new Set(simulations.map(s => s.meta.roleId))];
const hasComparisons = roles.some(r =>
  simulations.some(s => s.meta.roleId === r && s.meta.candidateType === 'senior') &&
  simulations.some(s => s.meta.roleId === r && s.meta.candidateType === 'junior')
);

if (hasComparisons) {
  log('## 3. SENIOR vs JUNIOR — RÓŻNICA W SCORINGU');
  log('');
  for (const roleId of roles) {
    const seniorSim = simulations.find(s => s.meta.roleId === roleId && s.meta.candidateType === 'senior');
    const juniorSim = simulations.find(s => s.meta.roleId === roleId && s.meta.candidateType === 'junior');
    if (!seniorSim || !juniorSim) continue;

    const sr = seniorSim.result;
    const jr = juniorSim.result;
    if (!sr || !jr) continue;

    const diff = (sr.wynik_lacznie ?? 0) - (jr.wynik_lacznie ?? 0);
    log(`${ROLE_LABELS[roleId] || roleId}`);
    log(`  Senior  (${seniorSim.meta.candidateName}): ${sr.wynik_lacznie}/55 → ${renderDecisionBadge(sr.decyzja)}`);
    log(`  Junior  (${juniorSim.meta.candidateName}): ${jr.wynik_lacznie}/55 → ${renderDecisionBadge(jr.decyzja)}`);
    log(`  Różnica: +${diff} pkt na korzyść seniora`);
    log('');
  }
}

// ─── 4. Obserwacje jakości promptów ──────────────────────────────────────────
log('## 4. OBSERWACJE DOTYCZĄCE PROCESU REKRUTACJI');
log('');

// Sprawdź czy scoring jest spójny (senior > junior?)
const inconsistencies = [];
for (const roleId of roles) {
  const s = simulations.find(x => x.meta.roleId === roleId && x.meta.candidateType === 'senior');
  const j = simulations.find(x => x.meta.roleId === roleId && x.meta.candidateType === 'junior');
  if (s?.result && j?.result) {
    if (s.result.wynik_lacznie <= j.result.wynik_lacznie) {
      inconsistencies.push(`⚠️  ${ROLE_LABELS[roleId]}: Senior (${s.result.wynik_lacznie}) <= Junior (${j.result.wynik_lacznie}) — sprawdź scoring!`);
    }
  }
}

if (inconsistencies.length) {
  log('### Niespójności scoringu:');
  inconsistencies.forEach(x => log(`  ${x}`));
  log('');
}

// Sprawdź czy decyzje mają sens
const decisionCheck = [];
for (const sim of simulations) {
  if (!sim.result) continue;
  const { wynik_lacznie, decyzja } = sim.result;
  const expected =
    wynik_lacznie >= 45 ? 'Rozmowa' :
    wynik_lacznie >= 35 ? 'Zadanie techniczne' :
    wynik_lacznie >= 25 ? 'Do przemyślenia' : 'Odrzucony';
  if (expected !== decyzja) {
    decisionCheck.push(`⚠️  ${sim.meta.candidateName}: wynik ${wynik_lacznie} → oczekiwano "${expected}", dostałem "${decyzja}"`);
  }
}

if (decisionCheck.length) {
  log('### Niespójności decyzji:');
  decisionCheck.forEach(x => log(`  ${x}`));
  log('');
} else {
  log('✅ Wszystkie decyzje zgodne ze skalą scoringu (45+ → Rozmowa, 35-44 → Zadanie, 25-34 → Przemyślenie, <25 → Odrzucony)');
  log('');
}

// Statystyki długości rozmów
const avgTurns = Math.round(simulations.reduce((acc, s) => acc + (s.meta.turns || 0), 0) / simulations.length);
log(`### Statystyki rozmów:`);
log(`  Średnia liczba tur: ${avgTurns}`);
log(`  Min tur: ${Math.min(...simulations.map(s => s.meta.turns || 0))}`);
log(`  Max tur: ${Math.max(...simulations.map(s => s.meta.turns || 0))}`);
log('');

// ─── Zapis do pliku ────────────────────────────────────────────────────────
const reportPath = path.join(simDir, 'ANALIZA.md');
fs.writeFileSync(reportPath, lines.join('\n'));
console.log(`\n📄 Raport zapisany do: ${reportPath}`);
