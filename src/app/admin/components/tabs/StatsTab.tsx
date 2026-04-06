'use client';

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
    </div>
  );
}
