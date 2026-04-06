'use client';

import { useEffect, useState } from 'react';

interface ConversationEntry {
  ts?: string;
  timestamp?: string;
  role?: string;
  model?: string;
  tokens?: number;
  totalTokens?: number;
  cost?: number;
  duration?: number;
  sessionId?: string;
  [key: string]: unknown;
}

export default function InterviewsTab() {
  const [data, setData] = useState<ConversationEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/logs?limit=20')
      .then((r) => r.json())
      .then((d) => setData(d.conversations || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-sm text-gray-400 animate-pulse">Loading interviews...</div>;
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-sm text-gray-400">No interview logs found.</p>
        <p className="text-xs text-gray-300 mt-1">Logs appear in logs/conversations.jsonl</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Model</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Tokens</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Cost</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((entry, i) => {
              const time = entry.ts || entry.timestamp || '';
              const formatted = time ? new Date(time).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-';
              return (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatted}</td>
                  <td className="px-4 py-3 text-gray-800">{(entry.role as string) || '-'}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{(entry.model as string) || '-'}</td>
                  <td className="px-4 py-3 text-gray-600 text-right tabular-nums">
                    {entry.tokens ?? entry.totalTokens ?? '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-right tabular-nums">
                    {entry.cost != null ? `$${Number(entry.cost).toFixed(4)}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-right tabular-nums">
                    {entry.duration != null ? `${Number(entry.duration).toFixed(1)}s` : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
