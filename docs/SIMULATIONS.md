# System symulacji rozmów kwalifikacyjnych

System pozwala testować prompty, jakość scoringu i różne modele AI **bez angażowania prawdziwych kandydatów**. Dwa Claude'y/GPT rozmawiają ze sobą: jeden gra Kaję, drugi kandydata.

## Architektura

```
┌─────────────────┐         ┌──────────────────┐
│  Kaja (LLM 1)   │ ←─────→ │ Kandydat (LLM 2) │
│  system = role  │         │ system = persona │
│  tools = tool   │         │                  │
└─────────────────┘         └──────────────────┘
         │
         │ complete_interview()
         ↓
   JSON + transkrypt
   → simulations/*.json
```

**Kluczowe**: jedna instancja modelu (z `rolePrompt` jako system) gra rekruterkę Kaję i ma dostęp do narzędzia `complete_interview`. Druga instancja (z `candidate.systemPrompt`) gra kandydata. Rozmowa trwa aż Kaja wywoła tool → wtedy przechwytujemy wynik + zapisujemy transkrypt.

## Pliki

| Plik | Opis |
|---|---|
| `simulate-interview.mjs` | Symulacja z **Anthropic Claude** (Haiku/Sonnet) |
| `simulate-interview-openai.mjs` | Symulacja z **OpenAI** (GPT-4o-mini / GPT-4o / GPT-5) |
| `candidates.mjs` | 10 person kandydatów (2 per rola: senior + junior) |
| `analyze-simulations.mjs` | Analiza wyników + raport `simulations/ANALIZA.md` |
| `compare-models.mjs` | Porównanie punktacji Claude vs OpenAI |

## Uruchamianie

### Pojedyncza symulacja

```bash
cd /Users/lukaszek/Projects/important/hr-chat
source ~/.claude/keys.env

# Claude (droższy, rate limits)
ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  node simulate-interview.mjs wordpress-dev senior

# OpenAI (tańszy, rekomendowany)
OPENAI_API_KEY=$OPENAI_API_KEY \
  node simulate-interview-openai.mjs wordpress-dev senior gpt-4o-mini
```

**Parametry:**
- `role`: `wordpress-dev | pm | grafik | ai-specialist | automatyzacje`
- `candidate-type`: `senior | junior`
- `model` (tylko OpenAI): `gpt-4o-mini | gpt-4o | gpt-5-mini`

### Wszystkie 10 kandydatów sekwencyjnie (OpenAI)

```bash
source ~/.claude/keys.env
for combo in \
  "wordpress-dev senior" "wordpress-dev junior" \
  "pm senior" "pm junior" \
  "grafik senior" "grafik junior" \
  "ai-specialist senior" "ai-specialist junior" \
  "automatyzacje senior" "automatyzacje junior"; do
  role=$(echo $combo | cut -d' ' -f1)
  type=$(echo $combo | cut -d' ' -f2)
  OPENAI_API_KEY=$OPENAI_API_KEY node simulate-interview-openai.mjs $role $type gpt-4o-mini
done
```

**Czas**: ~20 minut (2 min/symulację). **Koszt**: ~$0.13 całość.

### Analiza wyników

```bash
node analyze-simulations.mjs   # Raport per kandydat
node compare-models.mjs         # Porównanie modeli Claude vs OpenAI
```

## Output

### Struktura pliku JSON

```json
{
  "meta": {
    "roleId": "wordpress-dev",
    "candidateType": "senior",
    "candidateName": "Kamil Nowak",
    "simulatedAt": "2026-04-04T21:27:00.000Z",
    "turns": 13,
    "model": "gpt-4o-mini",
    "totalInputTokens": 71138,
    "totalOutputTokens": 2908,
    "costUSD": 0.0124
  },
  "result": {
    "imie_nazwisko": "Kamil Nowak",
    "email": "kamil.nowak@gmail.com",
    "wynik_techniczny": 20,
    "wynik_komunikacja": 25,
    "wynik_lacznie": 45,          // wyliczane automatycznie
    "decyzja": "Rozmowa",          // wyliczane automatycznie
    "notatki": "..."
  },
  "transcript": [
    { "role": "kaja", "text": "Cześć! Jestem Kaja..." },
    { "role": "candidate", "name": "Kamil Nowak", "text": "Cześć, jestem Kamil..." }
  ]
}
```

### Katalogi wyników

- `simulations/` — wyniki Claude (oryginalny skrypt)
- `simulations-openai/` — wyniki OpenAI

## Deterministyczne wyliczanie decyzji

**Wymagane pola** (zwracane przez LLM): `wynik_techniczny` (0-25), `wynik_komunikacja` (0-30)

**Wyliczane server-side** (nie LLM):
```js
wynik_lacznie = wynik_techniczny + wynik_komunikacja
decyzja =
  wynik_lacznie >= 45 ? 'Rozmowa' :
  wynik_lacznie >= 35 ? 'Zadanie techniczne' :
  wynik_lacznie >= 25 ? 'Do przemyślenia' : 'Odrzucony'
```

**Dlaczego**: wcześniej LLM sam wybierał `decyzja` → mięknął przy sympatycznych kandydatach. W 4 z 10 testów dawał "Zadanie techniczne" zamiast "Do przemyślenia" itp. Deterministyczne wyliczenie = 100% spójność.

## Safety check

Po rozmowie (>5 tur) model nie może zwrócić `wynik_techniczny=0 AND wynik_komunikacja=0`. Ten check jest w:
- `src/app/api/chat/route.ts` (produkcja)
- `simulate-interview-openai.mjs` (symulacje)

Gdy się wywala → prosimy model o retry z błędem.

**Dlaczego**: GPT-4o-mini raz na ~15 rozmów wpada w flaky state i zwraca zera mimo dobrych notatek. Safety check łapie 100% takich przypadków.

## Persony kandydatów

10 person (2 na rolę) zdefiniowanych w `candidates.mjs`:

| Rola | Senior | Junior |
|---|---|---|
| WordPress Dev | Kamil Nowak (6 lat, Bricks, pełny stack) | Bartek Kowalski (1.5r, bez portfolio) |
| Project Manager | Anna Wiśniewska (7 lat, ClickUp) | Piotr Zając (przebranżowienie) |
| Grafik | Marta Jabłońska (7 lat, Figma ekspert) | Tomek Wróbel (tylko Canva) |
| AI Specialist | Łukasz Krawczyk (MCP, RAG, Python) | Natalia Dąbrowska (tylko ChatGPT) |
| Automatyzacje | Michał Stępień (40 n8n workflow) | Kasia Malinowska (3 mies. n8n) |

Każda persona ma `systemPrompt` opisujący profil + styl komunikacji. LLM gra tę postać podczas rozmowy z Kają.

## Rozszerzanie systemu

### Nowa persona

Dodaj do `candidates.mjs`:
```js
'wordpress-dev': {
  senior: { ... },
  junior: { ... },
  // nowa persona:
  'senior-niche': {
    name: 'Tomasz Bąk',
    email: '...',
    city: '...',
    systemPrompt: `Jesteś Tomasz Bąk, 40 lat, WordPress dev specjalizujący się w...`
  }
}
```

Uruchom: `node simulate-interview-openai.mjs wordpress-dev senior-niche gpt-4o-mini`

### Zmiana promptów

Skrypty ładują prompty z `src/lib/prompts/*.ts` **runtime** (regex). Zmień tam → symulacja używa nowej wersji bez kopiowania.

## Znane ograniczenia

1. **GPT-5-mini niekompatybilny**: reasoning tokens pożerają `max_completion_tokens`, model nie produkuje odpowiedzi. Używaj `gpt-4o-mini`.

2. **Rate limits (Claude)**: 50 req/min + 50k tok/min na Haiku. 10 równoległych symulacji przekracza. Używaj sekwencyjnie.

3. **Koszty Claude × 6**: Haiku = $7.63/100 rozmów vs GPT-4o-mini = $1.27/100.

4. **Flaky GPT-4o-mini**: ~5-10% przypadków zwraca zera. Safety check to łapie.
