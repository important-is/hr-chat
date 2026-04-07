'use client';

import { useCallback, useEffect, useState } from 'react';

interface ConversationEntry {
  ts?: string;
  role?: string;
  model?: string;
  msgCount?: number;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  costUSD?: number;
  finishReason?: string;
  durationMs?: number;
}

interface Pagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

interface Summary {
  totalCost: number;
  totalTokens: number;
  totalEntries: number;
}

type SortField = 'ts' | 'cost' | 'tokens' | 'duration';

export default function InterviewsTab() {
  const [data, setData] = useState<ConversationEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, perPage: 50, total: 0, totalPages: 0 });
  const [roles, setRoles] = useState<string[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalCost: 0, totalTokens: 0, totalEntries: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('ts');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('per_page', '50');
    if (roleFilter) params.set('role', roleFilter);
    if (search) params.set('q', search);
    if (dateFrom) params.set('from', dateFrom);
    if (dateTo) params.set('to', dateTo);
    params.set('sort', sortBy);
    params.set('dir', sortDir);

    try {
      const res = await fetch(`/api/admin/conversations?${params}`);
      const d = await res.json();
      setData(d.conversations || []);
      setPagination(d.pagination || { page: 1, perPage: 50, total: 0, totalPages: 0 });
      setRoles(d.roles || []);
      setSummary(d.summary || { totalCost: 0, totalTokens: 0, totalEntries: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, search, dateFrom, dateTo, sortBy, sortDir]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [roleFilter, search, dateFrom, dateTo, sortBy, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-accent ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
          <p className="text-xs text-gray-400">Total entries</p>
          <p className="text-lg font-semibold text-gray-800">{summary.totalEntries}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
          <p className="text-xs text-gray-400">Total cost</p>
          <p className="text-lg font-semibold text-gray-800">${summary.totalCost.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
          <p className="text-xs text-gray-400">Total tokens</p>
          <p className="text-lg font-semibold text-gray-800">{(summary.totalTokens / 1000).toFixed(0)}k</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[140px]">
            <label className="text-xs text-gray-400 block mb-1">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs..."
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-[#E63946]"
            />
          </div>
          <div className="min-w-[120px]">
            <label className="text-xs text-gray-400 block mb-1">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-[#E63946] bg-white"
            >
              <option value="">All roles</option>
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[130px]">
            <label className="text-xs text-gray-400 block mb-1">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-[#E63946]"
            />
          </div>
          <div className="min-w-[130px]">
            <label className="text-xs text-gray-400 block mb-1">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-[#E63946]"
            />
          </div>
          {(roleFilter || search || dateFrom || dateTo) && (
            <button
              onClick={() => { setRoleFilter(''); setSearch(''); setDateFrom(''); setDateTo(''); }}
              className="text-xs text-[#E63946] hover:underline py-1.5"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400 animate-pulse">Loading...</div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-400">No entries found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th
                      className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 select-none"
                      onClick={() => toggleSort('ts')}
                    >
                      Time<SortIcon field="ts" />
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Model</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Msgs</th>
                    <th
                      className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 select-none"
                      onClick={() => toggleSort('tokens')}
                    >
                      Tokens<SortIcon field="tokens" />
                    </th>
                    <th
                      className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 select-none"
                      onClick={() => toggleSort('cost')}
                    >
                      Cost<SortIcon field="cost" />
                    </th>
                    <th
                      className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 select-none"
                      onClick={() => toggleSort('duration')}
                    >
                      Duration<SortIcon field="duration" />
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.map((entry, i) => {
                    const time = entry.ts || '';
                    const formatted = time
                      ? new Date(time).toLocaleString('pl-PL', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                        })
                      : '-';
                    const isToolCall = entry.finishReason === 'tool_calls' || entry.finishReason === 'tool-calls';
                    const durationSec = entry.durationMs != null ? (entry.durationMs / 1000) : null;

                    return (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap text-xs">{formatted}</td>
                        <td className="px-4 py-2.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {entry.role || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-gray-500 font-mono text-xs">{entry.model || '-'}</td>
                        <td className="px-4 py-2.5 text-gray-600 text-center tabular-nums text-xs">{entry.msgCount ?? '-'}</td>
                        <td className="px-4 py-2.5 text-gray-600 text-right tabular-nums text-xs">
                          {entry.totalTokens != null ? entry.totalTokens.toLocaleString() : '-'}
                        </td>
                        <td className="px-4 py-2.5 text-gray-600 text-right tabular-nums text-xs">
                          {entry.costUSD != null ? `$${entry.costUSD.toFixed(4)}` : '-'}
                        </td>
                        <td className="px-4 py-2.5 text-gray-600 text-right tabular-nums text-xs">
                          {durationSec != null ? `${durationSec.toFixed(1)}s` : '-'}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {isToolCall ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                              completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-500">
                              {entry.finishReason || 'turn'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Showing {((pagination.page - 1) * pagination.perPage) + 1}–{Math.min(pagination.page * pagination.perPage, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>
                <span className="px-3 py-1 text-xs text-gray-500">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  className="px-3 py-1 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
