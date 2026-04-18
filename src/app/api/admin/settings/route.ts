import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import {
  AVAILABLE_MODELS,
  getModelOverride,
  setModelOverride,
  type AvailableProvider,
  type ModelOverride,
} from '@/lib/content';

export const dynamic = 'force-dynamic';

const ENV_CHECKS = [
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'NOTION_API_KEY',
  'NOTION_DATABASE_ID',
  'MODEL_PROVIDER',
  'TURNSTILE_SECRET_KEY',
  'ADMIN_USER',
  'ADMIN_PASS',
  'ADMIN_SECRET',
];

/** Domyślne modele dla env providera (musi być zsynchronizowane z chat/route.ts MODELS). */
const ENV_DEFAULT_MODELS: Record<'openai' | 'anthropic', string> = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-sonnet-4-6',
};

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const envStatus: Record<string, boolean> = {};
  for (const key of ENV_CHECKS) {
    envStatus[key] = !!process.env[key];
  }

  const envProvider = (process.env.MODEL_PROVIDER || 'openai') as 'openai' | 'anthropic';
  const envDefault = {
    provider: envProvider,
    modelId: ENV_DEFAULT_MODELS[envProvider] ?? 'gpt-4o-mini',
  };

  const override = getModelOverride();
  const active = override ?? envDefault;

  return NextResponse.json({
    modelProvider: envProvider,
    envDefault,
    modelOverride: override,
    activeModel: active,
    availableModels: AVAILABLE_MODELS,
    turnstileConfigured: !!process.env.TURNSTILE_SECRET_KEY,
    envStatus,
  });
}

/**
 * POST — ustaw override modelu lub zresetuj do env default.
 * Body: { provider, modelId } | null (reset)
 */
export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Reset do env default
  if (body === null) {
    setModelOverride(null);
    return NextResponse.json({ ok: true, modelOverride: null });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Expected { provider, modelId } or null' }, { status: 400 });
  }

  const { provider, modelId } = body as { provider?: unknown; modelId?: unknown };
  if (typeof provider !== 'string' || typeof modelId !== 'string') {
    return NextResponse.json({ error: 'provider and modelId must be strings' }, { status: 400 });
  }

  if (!(provider in AVAILABLE_MODELS)) {
    return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 });
  }

  const list = AVAILABLE_MODELS[provider as AvailableProvider];
  const model = list.find((m) => m.id === modelId);
  if (!model) {
    return NextResponse.json(
      { error: `Model ${modelId} not available for provider ${provider}` },
      { status: 400 },
    );
  }

  const override: ModelOverride = { provider: provider as AvailableProvider, modelId };
  setModelOverride(override);
  return NextResponse.json({ ok: true, modelOverride: override });
}
