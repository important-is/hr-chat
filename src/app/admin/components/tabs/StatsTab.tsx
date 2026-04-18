'use client';

import { useEffect, useState } from 'react';

interface TrendsData {
  daily: Array<{
    date: string;
    pageViews: number;
    starts: number;
    completes: number;
    errors: number;
  }>;
  byRole: Array<{
    role: string;
    starts: number;
    completes: number;
    completionRate: number;
  }>;
  totals: {
    totalStarts: number;
    totalCompletes: number;
    overallCompletionRate: number;
  };
}

interface StatsData {
  stats: {
    date: string;
    pageViews: number;
    roleSelects: Record<string, number>;
    interviewStarts: Record<string, number>;
    interviewCompletes: Record<string, number>;
    errors: number;
    fallbacks: number;
    allTime: { totalInterviews: number; totalCompleted: number };
  };
  budget: {
    date: string;
    totalCost: number;
    remaining: number;
    interviewCount: number;
    maxInterviews: number;
    maxCostPerDay: number;
  };
  limits: {
    maxCostPerDay: number;
    maxCostPerInterview: number;
    maxInterviewsPerDay: number;
  };
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function RoleBreakdown({ label, data }: { label: string; data: Record<string, number> }) {
  const entries = Object.entries(data);
  if (entries.length === 0) return <p className="text-xs text-gray-400">No data yet</p>;
  return (
    <div>
      <p className="text-xs text-gray-500 mb-2">{label}</p>
      <div className="space-y-1.5">
        {entries.map(([role, count]) => (
          <div key={role} className="flex items-center justify-between">
            <span className="text-sm text-gray-700 truncate mr-2">{role}</span>
            <span className="text-sm font-medium text-gray-900 tabular-nums">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StatsTab({ data }: { data: StatsData | null }) {
  const [trends, setTrends] = useState<TrendsData | null>(null);
  const [trendsLoading, setTrendsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setTrendsLoading(true);
    fetch('/api/admin/trends', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!cancelled) setTrends(json);
      })
      .catch(() => {
        if (!cancelled) setTrends(null);
      })
      .finally(() => {
        if (!cancelled) setTrendsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) {
    return <div className="text-sm text-gray-400 animate-pulse">Loading statistics...</div>;
  }

  const { stats, budget } = data;
  const completionRate = stats.allTime.totalInterviews > 0
    ? ((stats.allTime.totalCompleted / stats.allTime.totalInterviews) * 100).toFixed(1)
    : '0.0';

  const budgetPct = budget.maxCostPerDay > 0
    ? ((budget.totalCost / budget.maxCostPerDay) * 100).toFixed(0)
    : '0';

  return (
    <div className="space-y-6">
      {/* Today's stats */}
      <Card title={`Today  ·  ${stats.date}`}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Stat label="Page views" value={stats.pageViews} />
          <Stat label="Interview starts" value={Object.values(stats.interviewStarts).reduce((a, b) => a + b, 0)} />
          <Stat label="Completed" value={Object.values(stats.interviewCompletes).reduce((a, b) => a + b, 0)} />
          <Stat label="Errors" value={stats.errors} />
          <Stat label="Fallbacks" value={stats.fallbacks} />
          <Stat label="Role selects" value={Object.values(stats.roleSelects).reduce((a, b) => a + b, 0)} />
        </div>
        <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <RoleBreakdown label="Role selects" data={stats.roleSelects} />
          <RoleBreakdown label="Interview starts" data={stats.interviewStarts} />
          <RoleBreakdown label="Completed" data={stats.interviewCompletes} />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* All-time */}
        <Card title="All time">
          <div className="grid grid-cols-3 gap-4">
            <Stat label="Total interviews" value={stats.allTime.totalInterviews} />
            <Stat label="Completed" value={stats.allTime.totalCompleted} />
            <Stat label="Completion rate" value={`${completionRate}%`} />
          </div>
        </Card>

        {/* Budget */}
        <Card title="Budget status">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Stat label="Cost today" value={`$${budget.totalCost.toFixed(2)}`} />
            <Stat label="Remaining" value={`$${budget.remaining.toFixed(2)}`} />
            <Stat label="Interviews today" value={`${budget.interviewCount} / ${budget.maxInterviews}`} />
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-[11px] text-gray-400 mb-1">
              <span>Budget used</span>
              <span>{budgetPct}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(parseFloat(budgetPct), 100)}%`,
                  backgroundColor: parseFloat(budgetPct) > 80 ? '#E63946' : '#22c55e',
                }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Trends (14 days) */}
      <Card title="Trendy (14 dni)">
        {trendsLoading && !trends ? (
          <p className="text-sm text-gray-400 animate-pulse">Loading trends...</p>
        ) : !trends ? (
          <p className="text-sm text-gray-400">No trends data</p>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <Stat label="Startów (14d)" value={trends.totals.totalStarts} />
              <Stat label="Ukończonych (14d)" value={trends.totals.totalCompletes} />
              <Stat
                label="Konwersja"
                value={`${(trends.totals.overallCompletionRate * 100).toFixed(1)}%`}
              />
            </div>

            {/* Bar chart */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Interview starts per day</p>
              {(() => {
                const maxStarts = Math.max(1, ...trends.daily.map((d) => d.starts));
                return (
                  <div className="flex items-end gap-1 h-40 border-b border-gray-200 pb-1">
                    {trends.daily.map((d) => {
                      const heightPct = (d.starts / maxStarts) * 100;
                      const dayLabel = d.date.slice(5); // MM-DD
                      return (
                        <div
                          key={d.date}
                          className="group flex-1 flex flex-col items-center justify-end h-full relative"
                        >
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full hidden group-hover:block bg-gray-900 text-white text-[11px] rounded px-2 py-1 whitespace-nowrap z-10">
                            <div className="font-medium">{d.date}</div>
                            <div>Starts: {d.starts}</div>
                            <div>Completes: {d.completes}</div>
                            <div>Views: {d.pageViews}</div>
                            <div>Errors: {d.errors}</div>
                          </div>
                          <div
                            className="w-full bg-gray-900 rounded-t transition-all hover:bg-gray-700"
                            style={{
                              height: `${heightPct}%`,
                              minHeight: d.starts > 0 ? '2px' : '0',
                            }}
                          />
                          <span className="text-[10px] text-gray-400 mt-1 tabular-nums">
                            {dayLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Role conversion table */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Konwersja per rola</p>
              {trends.byRole.length === 0 ? (
                <p className="text-xs text-gray-400">No data yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rola
                        </th>
                        <th className="text-right py-2 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Startów
                        </th>
                        <th className="text-right py-2 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ukończonych
                        </th>
                        <th className="text-right py-2 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Konwersja
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {trends.byRole.map((r) => (
                        <tr key={r.role} className="border-b border-gray-100 last:border-0">
                          <td className="py-2 px-2 text-gray-900">{r.role}</td>
                          <td className="py-2 px-2 text-right tabular-nums text-gray-700">
                            {r.starts}
                          </td>
                          <td className="py-2 px-2 text-right tabular-nums text-gray-700">
                            {r.completes}
                          </td>
                          <td className="py-2 px-2 text-right tabular-nums font-medium text-gray-900">
                            {(r.completionRate * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
