'use client';

import { useChat } from 'ai/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Suspense } from 'react';
import { ROLES } from '@/lib/roles';

function KajaAvatar({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/kaja.png"
      alt="Kaja"
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: 'cover', objectPosition: 'center top' }}
      className="rounded-full flex-shrink-0"
    />
  );
}

/** Generate a random session ID */
function genSessionId() {
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Track an event (fire-and-forget) */
function track(type: string, data?: { role?: string; sessionId?: string }) {
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, ...data }),
  }).catch(() => {});
}

/* ── Main content (needs useSearchParams → Suspense) ──────────────────── */
function ChatApp() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');

  const [selectedRole, setSelectedRole] = useState<string | null>(roleParam);
  const [started, setStarted] = useState(false);
  const [interviewDone, setInterviewDone] = useState(false);
  const [budgetError, setBudgetError] = useState(false);

  // CMS content overrides
  const [cmsRoles, setCmsRoles] = useState<Record<string, {
    title?: string; subtitle?: string; description?: string; tags?: string[]; emoji?: string;
  }> | null>(null);
  const [cmsUI, setCmsUI] = useState<Record<string, string>>({});
  const [fallbackEmail, setFallbackEmail] = useState('');
  const [fallbackSent, setFallbackSent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef(genSessionId());
  const pageLoadTime = useRef(Date.now());

  const baseRole = selectedRole ? ROLES[selectedRole] : null;
  const cmsRole = selectedRole && cmsRoles ? cmsRoles[selectedRole] : null;
  // Merge: CMS override wins over default
  const role = baseRole ? {
    ...baseRole,
    title: cmsRole?.title || baseRole.title,
    subtitle: cmsRole?.subtitle || baseRole.subtitle,
    description: cmsRole?.description || baseRole.description,
    tags: cmsRole?.tags || baseRole.tags,
  } : null;
  const triggerMsg = role
    ? `Cześć, chciałbym/chciałabym aplikować na stanowisko: ${role.title}.`
    : '';

  // Track page view + load CMS content on mount
  useEffect(() => {
    track('page_view');
    fetch('/api/content').then(r => r.json()).then(d => {
      setCmsRoles(d.roles || {});
      setCmsUI(d.ui || {});
    }).catch(() => {});
  }, []);

  // Reset page load time when start screen shows
  useEffect(() => {
    if (selectedRole && !started) {
      pageLoadTime.current = Date.now();
    }
  }, [selectedRole, started]);

  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: '/api/chat',
    body: {
      role: selectedRole,
      sessionId: sessionIdRef.current,
      _hp: honeypot, // honeypot — should be empty
      _t: Date.now() - pageLoadTime.current, // time gate — ms since page load
    },
    onError: (err) => {
      console.error('Chat error:', err);
      // Check if it's a budget error
      if (err.message?.includes('budget') || err.message?.includes('429')) {
        setBudgetError(true);
      }
    },
    onResponse: (response) => {
      if (response.status === 429) {
        setBudgetError(true);
      }
    },
  });

  const handleRoleSelect = useCallback((roleId: string) => {
    setSelectedRole(roleId);
    track('role_select', { role: roleId });
  }, []);

  const startInterview = () => {
    setStarted(true);
    track('interview_start', { role: selectedRole ?? undefined, sessionId: sessionIdRef.current });
    append({ role: 'user', content: triggerMsg });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    for (const msg of messages) {
      if (msg.role === 'assistant' && msg.toolInvocations) {
        const done = msg.toolInvocations.find(
          (t) =>
            t.toolName === 'complete_interview' &&
            t.state === 'result' &&
            (t.result as { success?: boolean })?.success !== false,
        );
        if (done) { setInterviewDone(true); break; }
      }
    }
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) handleSubmit(e as unknown as React.FormEvent);
    }
  };

  // ── Fallback: Kaja niedostępna ──────────────────────────────────────────
  if (budgetError) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-5 sm:px-6 py-10 text-center">
        <div className="mb-5 sm:mb-6"><KajaAvatar size={56} /></div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
          Kaja chwilowo niedostępna<span className="text-accent">.</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-500 max-w-sm mb-6">
          Mamy teraz dużo rozmów i musimy chwilę odpocząć 😊
          Zostaw swój email — odezwiemy się i umówimy rozmowę.
        </p>
        {fallbackSent ? (
          <p className="text-sm text-green-600 font-medium">Zapisano! Odezwiemy się wkrótce 🙌</p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (fallbackEmail.trim()) {
                fetch('/api/track', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    type: 'page_view',
                    meta: { fallbackEmail: fallbackEmail.trim(), role: selectedRole },
                  }),
                }).catch(() => {});
                setFallbackSent(true);
              }
            }}
            className="flex gap-2 w-full max-w-sm"
          >
            <input
              type="email"
              value={fallbackEmail}
              onChange={(e) => setFallbackEmail(e.target.value)}
              placeholder="Twój email"
              required
              className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-accent"
            />
            <button
              type="submit"
              style={{ backgroundColor: '#E63946' }}
              className="px-5 py-2.5 rounded-full text-white text-sm font-medium hover:opacity-90"
            >
              Wyślij
            </button>
          </form>
        )}
      </div>
    );
  }

  // ── Success ─────────────────────────────────────────────────────────────
  if (interviewDone) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-5 sm:px-6 py-10 text-center">
        <div className="mb-5 sm:mb-6"><KajaAvatar size={56} /></div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
          Dziękujemy za rozmowę<span className="text-accent">!</span> 🙌
        </h1>
        <p className="text-sm sm:text-base text-gray-500 max-w-sm">
          Twoje odpowiedzi właśnie wylądowały u nas. Odezwiemy się w ciągu
          5 dni roboczych z informacją o kolejnych krokach. Do usłyszenia!
        </p>
        <a href="https://important.is" target="_blank" rel="noopener noreferrer"
          className="mt-6 text-sm text-gray-400 hover:text-accent transition-colors">
          important<span className="text-accent">.</span>is 🚀
        </a>
      </div>
    );
  }

  // ── Role selection ──────────────────────────────────────────────────────
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 sm:px-6 py-10 text-center">
        <div className="mb-3"><KajaAvatar size={72} /></div>
        <p className="text-sm font-medium text-gray-900">
          Kaja Ważna
        </p>
        <p className="text-[11px] sm:text-xs text-gray-400 mb-5 sm:mb-6">Asystentka AI · Rekrutacja</p>
        <a href="https://important.is" target="_blank" rel="noopener noreferrer" className="mb-3 sm:mb-4 inline-block hover:opacity-70 transition-opacity">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/important-logo.svg" alt="important.is" className="h-4 sm:h-5 w-auto" />
        </a>
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
          {cmsUI.heroTitle || <>Dołącz do zespołu<span className="text-accent">.</span></>}
        </h1>
        <p className="text-gray-400 text-sm mb-8 sm:mb-10 max-w-sm px-2">
          {cmsUI.heroSubtitle || 'Wybierz stanowisko, na które chcesz aplikować — Kaja przeprowadzi Cię przez krótką rozmowę ☕️'}
        </p>
        <div className="grid gap-2.5 sm:gap-3 w-full max-w-md">
          {Object.entries(ROLES).map(([id, r]) => {
            const cr = cmsRoles?.[id];
            return (
            <button
              key={id}
              onClick={() => handleRoleSelect(id)}
              className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 sm:py-4 rounded-2xl border border-gray-200 hover:border-accent active:border-accent hover:shadow-sm transition-all text-left group"
            >
              <span className="text-xl sm:text-2xl flex-shrink-0">{cr?.emoji || r.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 group-hover:text-accent transition-colors truncate">
                  {cr?.title || r.title}
                </p>
                <p className="text-xs text-gray-400 truncate">{cr?.subtitle || r.subtitle}</p>
              </div>
              <span
                style={{ backgroundColor: '#E63946' }}
                className="px-3 sm:px-4 py-1.5 rounded-full text-white text-[11px] sm:text-xs font-medium flex-shrink-0"
              >
                Aplikuj
              </span>
            </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Start screen ────────────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-5 sm:px-6 py-10 text-center">
        <div className="mb-5 sm:mb-6"><KajaAvatar size={64} /></div>
        <a href="https://important.is" target="_blank" rel="noopener noreferrer" className="mb-3 sm:mb-4 inline-block hover:opacity-70 transition-opacity">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/important-logo.svg" alt="important.is" className="h-4 sm:h-5 w-auto" />
        </a>
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">
          {role!.emoji} {role!.title}<span className="text-accent">.</span>
        </h1>
        <div className="flex flex-wrap gap-1.5 justify-center mb-4">
          {role!.tags.map((tag) => (
            <span key={tag} className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500">
              {tag}
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-600 max-w-md mb-6 leading-relaxed">
          {role!.description}
        </p>
        <div className="bg-gray-50 rounded-2xl px-5 py-4 max-w-md mb-6 sm:mb-8">
          <p className="text-xs text-gray-400 mb-1">{cmsUI.howItWorksTitle || 'Jak to działa?'}</p>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            {cmsUI.howItWorksText || 'Kaja, nasza asystentka AI, przeprowadzi z Tobą krótką rozmowę — luźno, bez stresu. Odpowiadaj naturalnie, zajmie to ok. 15-20 minut ☕️'}
          </p>
        </div>
        {/* Honeypot — invisible to humans, bots fill it */}
        <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}>
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>
        <div className="flex gap-2 sm:gap-3 w-full max-w-sm justify-center">
          <button onClick={() => setSelectedRole(null)}
            className="px-5 sm:px-6 py-3 rounded-full text-sm font-medium border border-gray-200 text-gray-500 hover:border-gray-400 transition-colors">
            ← Wróć
          </button>
          <button onClick={startInterview}
            style={{ backgroundColor: '#E63946' }}
            className="text-white px-6 sm:px-8 py-3 rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
            Zacznij rozmowę 🚀
          </button>
        </div>
      </div>
    );
  }

  // ── Chat ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 px-3 sm:px-4 py-3 flex items-center gap-2 sm:gap-3 sticky top-0 z-10">
        <button
          onClick={() => {
            if (confirm('Na pewno chcesz wrócić? Rozmowa zostanie przerwana.')) {
              setStarted(false);
              setSelectedRole(null);
              window.location.reload();
            }
          }}
          aria-label="Wróć"
          className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <KajaAvatar size={32} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 truncate">Kaja Ważna</p>
          <p className="text-xs text-gray-400 truncate">
            Asystentka AI · Rekrutacja · {role!.title}
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4 max-w-2xl mx-auto w-full">
        {messages
          .filter((m) => m.role !== 'user' || m.content)
          .map((message) => {
            if (message.role === 'user' && message.content === triggerMsg) return null;
            const isUser = message.role === 'user';
            if (!isUser && (!message.content || message.content.trim() === '')) return null;

            return (
              <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && <div className="mr-2 mt-1"><KajaAvatar /></div>}
                <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3.5 sm:px-4 py-2.5 text-sm leading-relaxed break-words ${
                  isUser
                    ? 'bg-black text-white rounded-tr-sm'
                    : 'bg-white text-gray-800 rounded-tl-sm shadow-sm border border-gray-100'
                }`}>
                  {typeof message.content === 'string'
                    ? message.content.split('\n').map((line, i, arr) => (
                        <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                      ))
                    : null}
                </div>
              </div>
            );
          })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="mr-2 mt-1"><KajaAvatar /></div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <div className="bg-white border-t border-gray-100 px-3 sm:px-4 py-3 sticky bottom-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end max-w-2xl mx-auto">
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Napisz odpowiedź… (Enter = wyślij)"
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-accent transition-colors max-h-32 overflow-y-auto"
            style={{ minHeight: '42px' }}
            disabled={isLoading}
          />
          <button type="submit" disabled={!input.trim() || isLoading}
            style={{ backgroundColor: '#E63946' }}
            className="w-10 h-10 rounded-full text-white flex items-center justify-center flex-shrink-0 hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Page wrapper (Suspense for useSearchParams) ──────────────────────── */
export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-gray-300">Ładowanie...</div>
      </div>
    }>
      <ChatApp />
    </Suspense>
  );
}
