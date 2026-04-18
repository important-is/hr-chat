'use client';

import { useCallback, useEffect, useState } from 'react';

interface TranscriptEntry {
  sessionId: string;
  role: string;
  ts: string;
  msgCount: number;
  costUSD: number;
  finishReason: string;
}

type PushState = 'idle' | 'loading' | 'success' | 'error';

interface PushStatus {
  state: PushState;
  notionUrl?: string;
  error?: string;
}

export default function TranscriptsTab() {
  const [data, setData] = useState<TranscriptEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [pushStatuses, setPushStatuses] = useState<Record<string, PushStatus>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/transcripts');
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePush = async (sessionId: string) => {
    // Guard przed podwójnym kliknięciem — sprawdzamy aktualny stan
    setPushStatuses((prev) => {
      if (prev[sessionId]?.state === 'loading') return prev;
      return { ...prev, [sessionId]: { state: 'loading' } };
    });
    try {
      const res = await fetch(`/api/admin/transcripts/${sessionId}/push`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setPushStatuses((prev) => ({
          ...prev,
          [sessionId]: { state: 'success', notionUrl: json.notionUrl },
        }));
      } else {
        setPushStatuses((prev) => ({
          ...prev,
          [sessionId]: { state: 'error', error: json.error || 'Unknown error' },
        }));
      }
    } catch (err) {
      setPushStatuses((prev) => ({
        ...prev,
        [sessionId]: { state: 'error', error: String(err) },
      }));
    }
  };

  return (
    <div className="space-y-4">
      {/* Header info */}
      <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800">Transkrypty sesji</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Sesje bez wpisu w Notion — możesz ręcznie przesłać transkrypt rozmowy.
            </p>
          </div>
          <button
            onClick={fetchData}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400 animate-pulse">Ładowanie...</div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-400">Brak transkryptów.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Rola
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Wiad.
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Koszt
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Notion
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map((entry) => {
                  const pushStatus = pushStatuses[entry.sessionId];
                  const formatted = entry.ts
                    ? new Date(entry.ts).toLocaleString('pl-PL', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '-';

                  return (
                    <tr key={entry.sessionId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap text-xs">
                        {formatted}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {entry.role || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-600 text-center tabular-nums text-xs">
                        {entry.msgCount ?? '-'}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600 text-right tabular-nums text-xs">
                        {entry.costUSD != null ? `$${entry.costUSD.toFixed(4)}` : '-'}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-500">
                          {entry.finishReason || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {!pushStatus || pushStatus.state === 'idle' ? (
                          <button
                            onClick={() => handlePush(entry.sessionId)}
                            disabled={pushStatus?.state === 'loading'}
                            className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-gray-900 text-white hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Wyślij do Notion
                          </button>
                        ) : pushStatus.state === 'loading' ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-400 animate-pulse">
                            Wysylanie...
                          </span>
                        ) : pushStatus.state === 'success' ? (
                          <a
                            href={pushStatus.notionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                          >
                            Otworz w Notion ↗
                          </a>
                        ) : (
                          <span
                            title={pushStatus.error}
                            className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-600 cursor-help"
                          >
                            Blad
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
