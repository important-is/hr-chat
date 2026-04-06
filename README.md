# HR Chat — rekrutacja.important.is

AI-powered recruitment chatbot for important.is. Kaja (AI recruiter persona) conducts structured interviews for 5 roles, scores candidates, and saves results to Notion.

## Roles

- **WordPress Developer** — Bricks, Gutenberg, WooCommerce
- **Project Manager** — ClickUp, communication, clients
- **Grafik / Designer** — Figma, UI/UX, branding
- **AI Specialist** — LLM, prompting, AI integrations
- **Automatyzacje** — n8n, Zapier, Make, API

## Stack

- Next.js 15 (App Router, standalone output)
- Vercel AI SDK (OpenAI gpt-4o-mini / Anthropic Claude)
- Notion API (candidate storage + transcripts)
- Tailwind CSS
- Docker (node:20-alpine)

## Setup

```bash
cp .env.example .env.local
# Fill in: NOTION_API_KEY, NOTION_DATABASE_ID, OPENAI_API_KEY
npm install
npm run dev
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NOTION_API_KEY` | Yes | Notion integration token |
| `NOTION_DATABASE_ID` | Yes | Target database for candidates |
| `OPENAI_API_KEY` | Yes* | OpenAI key (if MODEL_PROVIDER=openai) |
| `ANTHROPIC_API_KEY` | Yes* | Anthropic key (if MODEL_PROVIDER=anthropic) |
| `MODEL_PROVIDER` | No | `openai` (default) or `anthropic` |

## Deploy

Dockerfile included. Deployed via Coolify on Hetzner at `rekrutacja.important.is`.

```bash
docker build -t hr-chat .
docker run -p 3000:3000 --env-file .env hr-chat
```
