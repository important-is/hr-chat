'use client';

import { useEffect, useState } from 'react';

interface StatsData {
  limits: {
    maxCostPerDay: number;
    maxCostPerInterview: number;
    maxInterviewsPerDay: number;
  };
}

interface SettingsInfo {
  modelProvider: string;
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

export default function SettingsTab({ data }: { data: StatsData | null }) {
  const [settings, setSettings] = useState<SettingsInfo | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then(setSettings)
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      {/* Model provider */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Model Provider</h3>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm">
            🤖
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {settings ? settings.modelProvider : '...'}
            </p>
            <p className="text-xs text-gray-400">Changing requires env var update + restart</p>
          </div>
        </div>
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
