'use client';

import { useCallback, useEffect, useState } from 'react';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  const checkAuth = useCallback(() => {
    fetch('/api/admin/stats')
      .then((r) => setAuthed(r.ok))
      .catch(() => setAuthed(false));
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (authed === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  return <AdminDashboard onLogout={() => setAuthed(false)} />;
}
