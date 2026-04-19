'use client';

import { useCallback, useEffect, useState } from 'react';

interface Candidate {
  id: string;
  imie: string;
  email: string;
  rola: string;
  decyzja: string;
  wynikLacznie: number | null;
  dataAplikacji: string;
  notionUrl: string;
}

const ROLE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'WordPress Developer', label: 'WordPress Developer' },
  { value: 'Project Manager', label: 'Project Manager' },
  { value: 'Grafik', label: 'Grafik' },
  { value: 'AI Specialist', label: 'AI Specialist' },
  { value: 'Automatyzacje', label: 'Automatyzacje' },
  { value: 'SEO Specialist', label: 'SEO Specialist' },
  { value: 'Ads Specialist', label: 'Ads Specialist' },
];

const DECYZJA_OPTIONS: Array<{ value: string; label: string; className: string }> = [
  { value: 'Rozmowa', label: 'Rozmowa', className: 'bg-blue-50 text-blue-700' },
  { value: 'Zadanie techniczne', label: 'Zadanie techniczne', className: 'bg-purple-50 text-purple-700' },
  { value: 'Do przemyślenia', label: 'Do przemyślenia', className: 'bg-yellow-50 text-yellow-700' },
  { value: 'Odrzucony', label: 'Odrzucony', className: 'bg-red-50 text-red-700' },
  { value: 'Oferta', label: 'Oferta', className: 'bg-green-50 text-green-700' },
  { value: 'brak', label: 'Brak decyzji', className: 'bg-gray-50 text-gray-500' },
];

function badgeForDecyzja(decyzja: string) {
  const found = DECYZJA_OPTIONS.find((o) => o.value === decyzja);
  if (!found) {
    return { label: decyzja || 'brak', className: 'bg-gray-50 text-gray-500' };
  }
  return { label: found.label, className: found.className };
}

export default function CandidatesTab() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [cursors, setCursors] = useState<string[]>([]); // cursor stack for pagination
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(undefined);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);

  // Filters
  const [roleFilter, setRoleFilter] = useState('');
  const [decyzjaFilter, setDecyzjaFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchData = useCallback(
    async (cursor?: string) => {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (roleFilter) params.set('role', roleFilter);
      if (decyzjaFilter) params.set('decyzja', decyzjaFilter);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      if (cursor) params.set('cursor', cursor);
      params.set('per_page', '50');

      try {
        const res = await fetch(`/api/admin/candidates?${params}`);
        const d = await res.json();
        if (!res.ok) {
          setError(d.error || 'Błąd pobierania danych');
          setCandidates([]);
          setHasMore(false);
          setNextCursor(undefined);
          return;
        }
        setCandidates(d.candidates || []);
        setHasMore(Boolean(d.hasMore));
        setNextCursor(d.nextCursor);
      } catch (err) {
        setError(String(err));
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    },
    [roleFilter, decyzjaFilter, dateFrom, dateTo],
  );

  // Refetch from first page when filters change
  useEffect(() => {
    setCursors([]);
    setCurrentCursor(undefined);
    fetchData(undefined);
  }, [fetchData]);

  const handleNext = () => {
    if (!nextCursor) return;
    setCursors((s) => [...s, currentCursor ?? '']);
    setCurrentCursor(nextCursor);
    fetchData(nextCursor);
  };

  const handlePrev = () => {
    if (cursors.length === 0) return;
    const newStack = [...cursors];
    const prev = newStack.pop();
    setCursors(newStack);
    const prevCursor = prev === '' ? undefined : prev;
    setCurrentCursor(prevCursor);
    fetchData(prevCursor);
  };

  const resetFilters = () => {
    setRoleFilter('');
    setDecyzjaFilter('');
    setDateFrom('');
    setDateTo('');
  };

  const hasAnyFilter = roleFilter || decyzjaFilter || dateFrom || dateTo;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="min-w-[160px]">
            <label className="text-xs text-gray-400 block mb-1">Rola</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-[#E63946] bg-white"
            >
              <option value="">Wszystkie role</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[180px]">
            <label className="text-xs text-gray-400 block mb-1">Decyzja</label>
            <select
              value={decyzjaFilter}
              onChange={(e) => setDecyzjaFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-[#E63946] bg-white"
            >
              <option value="">Wszystkie decyzje</option>
              {DECYZJA_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[140px]">
            <label className="text-xs text-gray-400 block mb-1">Data od</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-[#E63946]"
            />
          </div>
          <div className="min-w-[140px]">
            <label className="text-xs text-gray-400 block mb-1">Data do</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-[#E63946]"
            />
          </div>
          {hasAnyFilter && (
            <button
              onClick={resetFilters}
              className="text-xs text-[#E63946] hover:underline py-1.5"
            >
              Reset filtrów
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400 animate-pulse">Ładowanie kandydatów...</div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-500">Błąd: {error}</p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-400">Brak kandydatów spełniających kryteria.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Imię</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Rola</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Decyzja</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Wynik</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Data</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Notion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {candidates.map((c) => {
                    const badge = badgeForDecyzja(c.decyzja);
                    const dataFormatted = c.dataAplikacji
                      ? new Date(c.dataAplikacji).toLocaleDateString('pl-PL', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })
                      : '-';
                    return (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2.5 text-gray-800 text-xs whitespace-nowrap">{c.imie || '-'}</td>
                        <td className="px-4 py-2.5 text-gray-500 text-xs font-mono">{c.email || '-'}</td>
                        <td className="px-4 py-2.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {c.rola || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-gray-700 text-right tabular-nums text-xs">
                          {c.wynikLacznie != null ? c.wynikLacznie : '-'}
                        </td>
                        <td className="px-4 py-2.5 text-gray-500 text-xs whitespace-nowrap">{dataFormatted}</td>
                        <td className="px-4 py-2.5 text-xs">
                          <a
                            href={c.notionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#E63946] hover:underline"
                          >
                            Otwórz →
                          </a>
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
                {candidates.length} rekord{candidates.length === 1 ? '' : 'ów'} na stronie
              </p>
              <div className="flex gap-1">
                <button
                  onClick={handlePrev}
                  disabled={cursors.length === 0}
                  className="px-3 py-1 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Poprzednia
                </button>
                <button
                  onClick={handleNext}
                  disabled={!hasMore}
                  className="px-3 py-1 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Następna →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
