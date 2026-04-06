# HR Chat — dokumentacja

Dokumentacja techniczna aplikacji rekrutacyjnej important.is.

## Dokumenty

| Plik | Opis |
|---|---|
| [SCORING-SYSTEM.md](SCORING-SYSTEM.md) | System scoringu, progi decyzji, CAP-y, kalibracja |
| [SIMULATIONS.md](SIMULATIONS.md) | System symulacji rozmów — testowanie promptów bez realnych kandydatów |
| [MODEL-COMPARISON.md](MODEL-COMPARISON.md) | Porównanie modeli AI (Claude vs OpenAI) — testy i koszty |

## Szybki start dewelopera

```bash
cd /Users/lukaszek/Projects/important/hr-chat

# 1. Env setup (pierwszy raz)
cp .env.local.example .env.local
# → uzupełnij ANTHROPIC_API_KEY i/lub OPENAI_API_KEY + NOTION_API_KEY

# 2. Dev server
npm run dev
# → http://localhost:3000?role=wordpress-dev

# 3. Testowanie zmian w promptach
source ~/.claude/keys.env
OPENAI_API_KEY=$OPENAI_API_KEY \
  node simulate-interview-openai.mjs wordpress-dev senior gpt-4o-mini
```

## Architektura

```
Kandydat (przeglądarka)
     │
     ↓ (streaming chat)
Next.js API (/api/chat/route.ts)
     │
     ├─→ OpenAI gpt-4o-mini (domyślnie) lub Anthropic Claude
     │         │
     │         ↓ tool call: complete_interview
     │
     ↓ (server-side compute decyzja)
Notion API → baza "Kandydaci"
```

**Kluczowe pliki:**
- `src/app/api/chat/route.ts` — backend, streaming, Notion save
- `src/lib/prompts/*.ts` — 5 promptów dla Kai (per rola)
- `src/lib/roles.ts` — definicje ról + mapowanie do Notion

## Provider AI

Produkcja używa **OpenAI GPT-4o-mini** domyślnie (tańszy). Przełączanie przez env:

```env
MODEL_PROVIDER=openai      # domyślnie, gpt-4o-mini
MODEL_PROVIDER=anthropic   # Claude Sonnet 4.6
```

Szczegóły: [MODEL-COMPARISON.md](MODEL-COMPARISON.md).

## Zmiana scoringu lub promptów

1. Edytuj `src/lib/prompts/<rola>.ts`
2. Testuj na personach: `node simulate-interview-openai.mjs <rola> senior gpt-4o-mini`
3. Weryfikuj: `node compare-models.mjs`
4. Deploy

Więcej: [SIMULATIONS.md](SIMULATIONS.md).
