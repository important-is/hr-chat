'use client';

import { useCallback, useEffect, useState } from 'react';
import StatsTab from './tabs/StatsTab';
import InterviewsTab from './tabs/InterviewsTab';
import SettingsTab from './tabs/SettingsTab';
import LogsTab from './tabs/LogsTab';
import ContentTab from './tabs/ContentTab';
import TranscriptsTab from './tabs/TranscriptsTab';

type Tab = 'stats' | 'interviews' | 'content' | 'settings' | 'logs' | 'transcripts';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'stats', label: 'Statistics', icon: '📊' },
  { id: 'interviews', label: 'Interviews', icon: '💬' },
  { id: 'transcripts', label: 'Transcripts', icon: '📄' },
  { id: 'content', label: 'Content', icon: '✏️' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
  { id: 'logs', label: 'Logs', icon: '📋' },
];

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

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('stats');
  const [stats, setStats] = useState<StatsData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchStats = useCallback(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-60 bg-gray-900 text-white flex flex-col transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: '#E63946' }}
            >
              HR
            </div>
            <div>
              <p className="text-sm font-semibold">hr-chat</p>
              <p className="text-[11px] text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                tab === t.id
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <span className="text-base">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-gray-800/50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <p className="text-sm font-semibold text-gray-900">
            {TABS.find((t) => t.id === tab)?.icon} {TABS.find((t) => t.id === tab)?.label}
          </p>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-6xl">
          {/* Desktop page title */}
          <div className="hidden lg:flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-gray-900">
              {TABS.find((t) => t.id === tab)?.label}
            </h1>
            <button
              onClick={fetchStats}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {tab === 'stats' && <StatsTab data={stats} />}
          {tab === 'interviews' && <InterviewsTab />}
          {tab === 'transcripts' && <TranscriptsTab />}
          {tab === 'content' && <ContentTab />}
          {tab === 'settings' && <SettingsTab data={stats} />}
          {tab === 'logs' && <LogsTab />}
        </main>
      </div>
    </div>
  );
}
