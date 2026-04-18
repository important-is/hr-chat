'use client';

import { useEffect, useState } from 'react';

interface StatsData {
  limits: {
    maxCostPerDay: number;
    maxCostPerInterview: number;
    maxInterviewsPerDay: number;
  };
}

interface ModelInfo {
  id: string;
  label: string;
  priceIn: number;
  priceOut: number;
}

interface ActiveModel {
  provider: 'openai' | 'anthropic';
  modelId: string;
}

interface SettingsInfo {
  modelProvider: string;
  envDefault: ActiveModel;
  modelOverride: ActiveModel | null;
  activeModel: ActiveModel;
  availableModels: Record<'openai' | 'anthropic', ModelInfo[]>;
  turnstileConfigured: boolean;
  envStatus: Record<string, boolean>;
}

function EnvCheck({ label, envKey, set }: { label: string; envKey: string; set: boolean | null }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm text-gray-700">{label}</p>
        <p className="text-xs text-gray-400 font-mono">{envKey}</p>
      </div>
      <span className="text-sm">
        {set === null ? (
          <span className="text-gray-300">--</span>
        ) : set ? (
          <span className="text-green-500">&#10003;</span>
        ) : (
          <span className="text-red-400">&#10007;</span>
        )}
      </span>
    </div>
  );
}

const ENV_VARS = [
  { key: 'OPENAI_API_KEY', label: 'OpenAI API Key' },
  { key: 'ANTHROPIC_API_KEY', label: 'Anthropic API Key' },
  { key: 'NOTION_API_KEY', label: 'Notion API Key' },
  { key: 'NOTION_DATABASE_ID', label: 'Notion Database ID' },
  { key: 'MODEL_PROVIDER', label: 'Model Provider' },
  { key: 'TURNSTILE_SECRET_KEY', label: 'Turnstile Secret Key' },
  { key: 'ADMIN_USER', label: 'Admin User' },
  { key: 'ADMIN_PASS', label: 'Admin Password' },
  { key: 'ADMIN_SECRET', label: 'Admin Secret' },
];

/**
 * Orientacyjny koszt 1000 rozmów.
 * Założenia: średnio ~2500 tokenów input + ~800 tokenów output / rozmowę
 * (kalibracja oparta o typową rozmowę rekrutacyjną 15-20 turn).
 */
function estimateCostPer1k(priceIn: number, priceOut: number): number {
  const avgIn = 2500;
  const avgOut = 800;
  const perConv = (avgIn * priceIn + avgOut * priceOut) / 1_000_000;
  return perConv * 1000;
}

export default function SettingsTab({ data }: { data: StatsData | null }) {
  const [settings, setSettings] = useState<SettingsInfo | null>(null);
  const [selected, setSelected] = useState<string>(''); // "provider:modelId"
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const loadSettings = () => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((s: SettingsInfo) => {
        setSettings(s);
        setSelected(`${s.activeModel.provider}:${s.activeModel.modelId}`);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!selected) return;
    const [provider, modelId] = selected.split(':');
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, modelId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      setMsg('Zapisano. Zmiana obowiązuje dla nowych rozmów.');
      loadSettings();
    } catch (e) {
      setMsg(`Błąd: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'null',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      setMsg('Zresetowano do wartości z env.');
      loadSettings();
    } catch (e) {
      setMsg(`Błąd: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSaving(false);
    }
  };

  // Znajdź ceny aktualnie wybranego w dropdownie modelu — do podglądu kosztu
  let selectedInfo: ModelInfo | null = null;
  if (settings && selected) {
    const [p, id] = selected.split(':') as ['openai' | 'anthropic', string];
    selectedInfo = settings.availableModels[p]?.find((m) => m.id === id) ?? null;
  }

  const isOverride = !!settings?.modelOverride;

  return (
    <div className="space-y-6">
      {/* Model AI — wybór */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Model AI</h3>
          {settings && (
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                isOverride
                  ? 'bg-blue-50 text-blue-600 border border-blue-100'
                  : 'bg-gray-50 text-gray-500 border border-gray-100'
              }`}
            >
              {isOverride ? 'Override z panelu' : 'Default z env'}
            </span>
          )}
        </div>

        {settings ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Aktywny model:</p>
              <p className="text-sm font-medium text-gray-900 font-mono">
                {settings.activeModel.provider} / {settings.activeModel.modelId}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Env default: {settings.envDefault.provider} / {settings.envDefault.modelId}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Wybierz model</label>
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                disabled={saving}
              >
                {(['openai', 'anthropic'] as const).map((prov) => (
                  <optgroup key={prov} label={prov}>
                    {settings.availableModels[prov].map((m) => (
                      <option key={`${prov}:${m.id}`} value={`${prov}:${m.id}`}>
                        {m.label} — ${m.priceIn}/${m.priceOut} per MTok
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {selectedInfo && (
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
                <p>
                  Cena input: <span className="font-mono">${selectedInfo.priceIn}</span> / MTok
                  {' · '}
                  output: <span className="font-mono">${selectedInfo.priceOut}</span> / MTok
                </p>
                <p className="mt-1">
                  Orientacyjny koszt per 1000 rozmów:{' '}
                  <span className="font-semibold text-gray-900">
                    ~${estimateCostPer1k(selectedInfo.priceIn, selectedInfo.priceOut).toFixed(2)}
                  </span>
                  <span className="text-gray-400"> (~2.5k in + 800 out / rozmowę)</span>
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !selected}
                className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Zapisywanie...' : 'Zapisz'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={saving || !isOverride}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset to env default
              </button>
              {msg && <span className="text-xs text-gray-500 ml-2">{msg}</span>}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Ładowanie...</p>
        )}
      </div>

      {/* Turnstile */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Turnstile (Bot Protection)</h3>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm">
            🛡️
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {settings === null
                ? '...'
                : settings.turnstileConfigured
                ? 'Configured'
                : 'Not configured'}
            </p>
            <p className="text-xs text-gray-400">
              {settings?.turnstileConfigured
                ? 'TURNSTILE_SECRET_KEY is set'
                : 'Set TURNSTILE_SECRET_KEY env var to enable'}
            </p>
          </div>
        </div>
      </div>

      {/* Budget limits */}
      {data && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Budget Limits</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-lg font-semibold text-gray-900">${data.limits.maxCostPerDay}</p>
              <p className="text-xs text-gray-500">Max cost per day</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-lg font-semibold text-gray-900">${data.limits.maxCostPerInterview}</p>
              <p className="text-xs text-gray-500">Max cost per interview</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-lg font-semibold text-gray-900">{data.limits.maxInterviewsPerDay}</p>
              <p className="text-xs text-gray-500">Max interviews per day</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Defined in src/lib/budget.ts LIMITS constant</p>
        </div>
      )}

      {/* Environment variables */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Environment Variables</h3>
        <div className="divide-y divide-gray-100">
          {ENV_VARS.map((v) => (
            <EnvCheck
              key={v.key}
              label={v.label}
              envKey={v.key}
              set={settings ? (settings.envStatus[v.key] ?? false) : null}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
