'use client';

import { useEffect, useState } from 'react';

type LogType = 'conversations' | 'events';

export default function LogsTab() {
  const [logType, setLogType] = useState<LogType>('events');
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const endpoint = logType === 'conversations' ? '/api/admin/conversations?limit=50' : '/api/admin/events?limit=50';
    fetch(endpoint)
      .then((r) => r.json())
      .then((d) => setData(d.conversations || d.events || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [logType]);

  // Collect all unique keys from the data
  const allKeys = data.length > 0
    ? Array.from(new Set(data.flatMap((d) => Object.keys(d))))
    : [];

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setLogType('events')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            logType === 'events'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Events (data/events.jsonl)
        </button>
        <button
          onClick={() => setLogType('conversations')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            logType === 'conversations'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Conversations (logs/conversations.jsonl)
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-sm text-gray-400 animate-pulse">Loading logs...</div>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-400">No log entries found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {allKeys.map((key) => (
                    <th
                      key={key}
                      className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map((entry, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    {allKeys.map((key) => {
                      const val = entry[key];
                      let display: string;
                      if (val === null || val === undefined) {
                        display = '-';
                      } else if (typeof val === 'object') {
                        display = JSON.stringify(val);
                      } else {
                        display = String(val);
                      }
                      // Truncate long values
                      const truncated = display.length > 60 ? display.slice(0, 57) + '...' : display;
                      return (
                        <td
                          key={key}
                          className="px-4 py-2.5 text-gray-600 whitespace-nowrap font-mono text-xs"
                          title={display}
                        >
                          {truncated}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-gray-100 text-xs text-gray-400">
            Showing last {data.length} entries (newest first)
          </div>
        </div>
      )}
    </div>
  );
}
