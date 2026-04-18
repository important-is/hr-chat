'use client';

import { useEffect, useState } from 'react';

const COOKIE_NAME = 'important_cookie_consent';
const ACCEPT_TTL_DAYS = 365;
const REJECT_TTL_DAYS = 30;

function getConsentCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setConsentCookie(value: 'accepted' | 'rejected') {
  const days = value === 'accepted' ? ACCEPT_TTL_DAYS : REJECT_TTL_DAYS;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  // domain=.important.is → cookie współdzielony przez wszystkie subdomeny
  const domain = typeof window !== 'undefined' && window.location.hostname.endsWith('important.is')
    ? '; domain=.important.is'
    : '';
  document.cookie = `${COOKIE_NAME}=${value}; expires=${expires}; path=/${domain}; SameSite=Lax`;
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getConsentCookie()) {
      // Małe opóźnienie żeby nie "wyskakiwał" przy ładowaniu
      const t = setTimeout(() => setVisible(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

  if (!visible) return null;

  const handle = (value: 'accepted' | 'rejected') => {
    setConsentCookie(value);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Zgoda na cookies"
      className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 pointer-events-none"
    >
      <div className="mx-auto max-w-3xl bg-white border border-gray-200 rounded-2xl shadow-lg p-4 sm:p-5 pointer-events-auto">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex-1 text-sm text-gray-700 leading-relaxed">
            Używamy plików cookies do działania serwisu i analizy ruchu. Szczegóły znajdziesz
            w{' '}
            <a href="/polityka-prywatnosci" className="underline hover:text-accent">
              Polityce prywatności
            </a>
            {' '}i{' '}
            <a href="/regulamin" className="underline hover:text-accent">
              Regulaminie
            </a>
            .
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => handle('rejected')}
              className="text-xs sm:text-sm px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Odrzuć
            </button>
            <button
              onClick={() => handle('accepted')}
              className="text-xs sm:text-sm px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors font-medium"
            >
              Akceptuję
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
