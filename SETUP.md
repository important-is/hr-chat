# Setup — HR Chat

## 1. Notion Integration Token

Aplikacja łączy się z Notion bezpośrednio (nie przez MCP). Potrzebujesz oddzielnego tokena.

### Kroki:
1. Wejdź na https://www.notion.so/my-integrations
2. Kliknij **"New integration"**
3. Nazwa: `hr-chat`, Workspace: `importantagency`
4. Capabilities: ✅ Read content, ✅ Update content, ✅ Insert content
5. Kliknij Submit → skopiuj **"Internal Integration Secret"** (zaczyna się od `secret_`)

### Udostępnij bazę Kandydaci integracji:
1. Otwórz bazę **Kandydaci** w Notion (jest w HRM)
2. Kliknij **"..."** → **"Connections"**
3. Dodaj `hr-chat`

---

## 2. Plik .env.local

Utwórz plik `.env.local` w katalogu `hr-chat/`:

```
# AI Provider — domyślnie OpenAI (tańszy, 6x mniej niż Claude Haiku)
MODEL_PROVIDER=openai
OPENAI_API_KEY=sk-proj-...           ← z ~/.claude/keys.env

# Alternatywnie Claude (gdy MODEL_PROVIDER=anthropic)
ANTHROPIC_API_KEY=sk-ant-api03-...   ← z ~/.claude/keys.env

# Notion
NOTION_API_KEY=secret_...             ← z kroku powyżej
NOTION_DATABASE_ID=575703dd883a4c4fac97c2a6d96964f1
```

**Który provider?** Szczegóły w `docs/MODEL-COMPARISON.md`. TL;DR:
- `openai` (gpt-4o-mini) — $1.27 za 100 rozmów, rekomendowane
- `anthropic` (claude-sonnet-4-6) — $25.43 za 100 rozmów, wyższa jakość

---

## 3. Lokalny dev

```bash
npm run dev
# → http://localhost:3000
```

---

## 4. Deploy na Coolify (Hetzner)

### Opcja A — przez GitHub
1. Wrzuć `hr-chat/` na GitHub (osobne repo lub subfolder)
2. W Coolify: New Resource → Dockerfile
3. Env variables: `MODEL_PROVIDER`, `OPENAI_API_KEY` (lub `ANTHROPIC_API_KEY`), `NOTION_API_KEY`, `NOTION_DATABASE_ID`
4. Domain: `rekrutacja.important.is`

### Opcja B — przez obraz Docker lokalnie
```bash
docker build -t hr-chat .
docker tag hr-chat registry.hetzner.io/hr-chat:latest
docker push registry.hetzner.io/hr-chat:latest
```
Następnie w Coolify: New Resource → Docker Image.

---

## Struktura

```
src/
  app/
    page.tsx          ← UI (start screen + chat + success screen)
    api/chat/route.ts ← OpenAI/Claude API + Notion save + safety checks
  lib/
    roles.ts          ← definicje 5 ról
    prompts/
      wordpress-dev.ts
      pm.ts
      grafik.ts
      ai-specialist.ts
      automatyzacje.ts

docs/                 ← dokumentacja techniczna
  SCORING-SYSTEM.md   ← system scoringu i progi
  SIMULATIONS.md      ← system testowania promptów
  MODEL-COMPARISON.md ← wyniki testów Claude vs OpenAI

# Symulacje (testowanie bez realnych kandydatów):
simulate-interview.mjs         ← Claude
simulate-interview-openai.mjs  ← OpenAI
candidates.mjs                 ← 10 person
compare-models.mjs             ← porównanie Claude vs OpenAI
```

## Zmiana promptów i scoringu

Edytuj `src/lib/prompts/<rola>.ts` — są tam pytania Kai, kryteria scoringu i CAP-y.

**Przed deploy: zawsze przetestuj na symulacjach**:
```bash
source ~/.claude/keys.env
OPENAI_API_KEY=$OPENAI_API_KEY \
  node simulate-interview-openai.mjs wordpress-dev senior gpt-4o-mini
```

Szczegóły: `docs/SIMULATIONS.md`.
