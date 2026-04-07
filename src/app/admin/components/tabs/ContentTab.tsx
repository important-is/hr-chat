'use client';

import { useCallback, useEffect, useState } from 'react';

interface RoleData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  prompt: string;
  override: Record<string, unknown>;
}

interface UIData {
  heroTitle?: string;
  heroSubtitle?: string;
  howItWorksTitle?: string;
  howItWorksText?: string;
  successTitle?: string;
  successText?: string;
  fallbackTitle?: string;
  fallbackText?: string;
}

interface GlobalData {
  companyKnowledge?: string;
  interviewRules?: string;
}

interface DefaultsData {
  companyKnowledge: string;
  interviewRules: string;
}

type Section = 'global' | 'roles' | 'ui';

export default function ContentTab() {
  const [roles, setRoles] = useState<Record<string, RoleData>>({});
  const [ui, setUi] = useState<UIData>({});
  const [global, setGlobal] = useState<GlobalData>({});
  const [defaults, setDefaults] = useState<DefaultsData>({ companyKnowledge: '', interviewRules: '' });
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [section, setSection] = useState<Section>('global');
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/content');
      const data = await res.json();
      setRoles(data.roles || {});
      setUi(data.ui || {});
      setGlobal(data.global || {});
      setDefaults(data.defaults || { companyKnowledge: '', interviewRules: '' });
      setUpdatedAt(data.updatedAt || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const saveRoleField = async (roleId: string, field: string, value: string | string[]) => {
    setSaving(true);
    try {
      await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId, roleData: { [field]: value } }),
      });
      showToast('Saved!');
      fetchContent();
    } catch (err) {
      showToast('Error: ' + String(err));
    } finally {
      setSaving(false);
    }
  };

  const saveUI = async (updates: Partial<UIData>) => {
    setSaving(true);
    try {
      await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ui: updates }),
      });
      showToast('Saved!');
      fetchContent();
    } catch (err) {
      showToast('Error: ' + String(err));
    } finally {
      setSaving(false);
    }
  };

  const saveGlobal = async (field: string, value: string) => {
    setSaving(true);
    try {
      await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ global: { [field]: value } }),
      });
      showToast('Saved!');
      fetchContent();
    } catch (err) {
      showToast('Error: ' + String(err));
    } finally {
      setSaving(false);
    }
  };

  const resetGlobal = async (field: string) => {
    if (!confirm('Reset to code defaults?')) return;
    setSaving(true);
    try {
      await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetGlobal: field }),
      });
      showToast('Reset to defaults');
      fetchContent();
    } catch (err) {
      showToast('Error: ' + String(err));
    } finally {
      setSaving(false);
    }
  };

  const resetRole = async (roleId: string) => {
    if (!confirm(`Reset ${roleId} to defaults? All overrides will be removed.`)) return;
    setSaving(true);
    try {
      await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetRole: roleId }),
      });
      showToast('Reset to defaults');
      fetchContent();
    } catch (err) {
      showToast('Error: ' + String(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-400 animate-pulse">Loading content...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}

      {/* Section tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['global', 'roles', 'ui'] as Section[]).map((s) => {
          const labels: Record<Section, string> = {
            global: 'Global Prompt',
            roles: `Roles (${Object.keys(roles).length})`,
            ui: 'UI Texts',
          };
          return (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                section === s ? 'bg-[#E63946] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {labels[s]}
            </button>
          );
        })}
      </div>

      {updatedAt && (
        <p className="text-xs text-gray-400">Last updated: {new Date(updatedAt).toLocaleString('pl-PL')}</p>
      )}

      {/* Global prompt section */}
      {section === 'global' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <p className="text-sm text-amber-800">
              Globalny prompt jest doklejany do <strong>wszystkich</strong> rozmów. Zmiany tu nadpisują domyślne wytyczne wbudowane w kod.
              Jeśli pole jest puste — używane są wytyczne z kodu.
            </p>
          </div>

          {/* Company Knowledge */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Wiedza o firmie</h3>
                <p className="text-xs text-gray-400">Informacje o important.is które Kaja podaje kandydatom</p>
              </div>
              {global.companyKnowledge && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700">customized</span>
              )}
            </div>
            <PromptEditor
              value={global.companyKnowledge || defaults.companyKnowledge}
              onSave={(v) => saveGlobal('companyKnowledge', v)}
              saving={saving}
            />
            {global.companyKnowledge && (
              <button onClick={() => resetGlobal('companyKnowledge')} className="mt-2 text-xs text-gray-400 hover:text-red-500">
                Reset to code defaults
              </button>
            )}
          </div>

          {/* Interview Rules */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Zasady rozmowy</h3>
                <p className="text-xs text-gray-400">Ton, styl, język inkluzywny, ograniczenia</p>
              </div>
              {global.interviewRules && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700">customized</span>
              )}
            </div>
            <PromptEditor
              value={global.interviewRules || defaults.interviewRules}
              onSave={(v) => saveGlobal('interviewRules', v)}
              saving={saving}
            />
            {global.interviewRules && (
              <button onClick={() => resetGlobal('interviewRules')} className="mt-2 text-xs text-gray-400 hover:text-red-500">
                Reset to code defaults
              </button>
            )}
          </div>
        </div>
      )}

      {/* Roles section */}
      {section === 'roles' && (
        <div className="space-y-3">
          {Object.entries(roles).map(([id, role]) => (
            <div key={id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Role header */}
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
                onClick={() => setEditingRole(editingRole === id ? null : id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{(roles[id] as RoleData & { emoji?: string })?.id === id ? '' : ''}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{role.title}</p>
                    <p className="text-xs text-gray-400">{role.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {Object.keys(role.override).length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700">
                      customized
                    </span>
                  )}
                  <span className="text-gray-400 text-xs">{editingRole === id ? '▼' : '▶'}</span>
                </div>
              </div>

              {/* Role editor */}
              {editingRole === id && (
                <div className="border-t border-gray-100 px-4 py-4 space-y-4">
                  <EditableField
                    label="Title"
                    value={role.title}
                    onSave={(v) => saveRoleField(id, 'title', v)}
                    saving={saving}
                  />
                  <EditableField
                    label="Subtitle"
                    value={role.subtitle}
                    onSave={(v) => saveRoleField(id, 'subtitle', v)}
                    saving={saving}
                  />
                  <EditableField
                    label="Description (shown on start screen)"
                    value={role.description}
                    multiline
                    onSave={(v) => saveRoleField(id, 'description', v)}
                    saving={saving}
                  />
                  <EditableField
                    label="Tags (comma-separated)"
                    value={role.tags.join(', ')}
                    onSave={(v) => saveRoleField(id, 'tags', v.split(',').map((t) => t.trim()).filter(Boolean))}
                    saving={saving}
                  />

                  {/* Prompt editor */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Interview Prompt
                      </label>
                      <button
                        onClick={() => setEditingPrompt(editingPrompt === id ? null : id)}
                        className="text-xs text-[#E63946] hover:underline"
                      >
                        {editingPrompt === id ? 'Hide' : 'Edit prompt'}
                      </button>
                    </div>
                    {editingPrompt === id && (
                      <PromptEditor
                        value={role.prompt}
                        onSave={(v) => saveRoleField(id, 'prompt', v)}
                        saving={saving}
                      />
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <button
                      onClick={() => resetRole(id)}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                      Reset to defaults
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* UI section */}
      {section === 'ui' && (
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-4 space-y-4">
          <UIField label="Hero title" field="heroTitle" value={ui.heroTitle} placeholder="Dołącz do zespołu." onSave={saveUI} saving={saving} />
          <UIField label="Hero subtitle" field="heroSubtitle" value={ui.heroSubtitle} placeholder="Wybierz stanowisko, na które chcesz aplikować..." onSave={saveUI} saving={saving} />
          <UIField label="How it works — title" field="howItWorksTitle" value={ui.howItWorksTitle} placeholder="Jak to działa?" onSave={saveUI} saving={saving} />
          <UIField label="How it works — text" field="howItWorksText" value={ui.howItWorksText} placeholder="Kaja, nasza asystentka AI, przeprowadzi z Tobą krótką rozmowę..." multiline onSave={saveUI} saving={saving} />
          <UIField label="Success title" field="successTitle" value={ui.successTitle} placeholder="Dziękujemy za rozmowę!" onSave={saveUI} saving={saving} />
          <UIField label="Success text" field="successText" value={ui.successText} placeholder="Twoje odpowiedzi właśnie wylądowały u nas..." multiline onSave={saveUI} saving={saving} />
          <UIField label="Fallback title" field="fallbackTitle" value={ui.fallbackTitle} placeholder="Kaja chwilowo niedostępna." onSave={saveUI} saving={saving} />
          <UIField label="Fallback text" field="fallbackText" value={ui.fallbackText} placeholder="Mamy teraz dużo rozmów..." multiline onSave={saveUI} saving={saving} />
        </div>
      )}
    </div>
  );
}

/* ── Editable field component ─────────────────────────── */
function EditableField({
  label, value, multiline, onSave, saving,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  onSave: (v: string) => void;
  saving: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => { setDraft(value); }, [value]);

  if (!editing) {
    return (
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</label>
        <div
          onClick={() => setEditing(true)}
          className="mt-1 px-3 py-2 rounded-lg border border-gray-100 text-sm text-gray-700 cursor-pointer hover:border-gray-300 transition-colors min-h-[36px]"
        >
          {value || <span className="text-gray-300 italic">Click to edit</span>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</label>
      {multiline ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          className="mt-1 w-full px-3 py-2 rounded-lg border border-[#E63946] text-sm text-gray-700 focus:outline-none resize-y"
          autoFocus
        />
      ) : (
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded-lg border border-[#E63946] text-sm text-gray-700 focus:outline-none"
          autoFocus
        />
      )}
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => { onSave(draft); setEditing(false); }}
          disabled={saving || draft === value}
          className="px-3 py-1 rounded-lg text-xs font-medium bg-[#E63946] text-white hover:opacity-90 disabled:opacity-40"
        >
          Save
        </button>
        <button
          onClick={() => { setDraft(value); setEditing(false); }}
          className="px-3 py-1 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ── Prompt editor component ─────────────────────────── */
function PromptEditor({
  value, onSave, saving,
}: {
  value: string;
  onSave: (v: string) => void;
  saving: boolean;
}) {
  const [draft, setDraft] = useState(value);
  const [changed, setChanged] = useState(false);

  useEffect(() => { setDraft(value); setChanged(false); }, [value]);

  return (
    <div>
      <textarea
        value={draft}
        onChange={(e) => { setDraft(e.target.value); setChanged(e.target.value !== value); }}
        rows={20}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-700 font-mono focus:outline-none focus:border-[#E63946] resize-y"
      />
      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={() => { onSave(draft); setChanged(false); }}
          disabled={saving || !changed}
          className="px-4 py-1.5 rounded-lg text-xs font-medium bg-[#E63946] text-white hover:opacity-90 disabled:opacity-40"
        >
          Save prompt
        </button>
        {changed && <span className="text-xs text-amber-600">Unsaved changes</span>}
        <span className="text-xs text-gray-400 ml-auto">{draft.length} chars</span>
      </div>
    </div>
  );
}

/* ── UI text field component ─────────────────────────── */
function UIField({
  label, field, value, placeholder, multiline, onSave, saving,
}: {
  label: string;
  field: string;
  value?: string;
  placeholder: string;
  multiline?: boolean;
  onSave: (updates: Record<string, string>) => void;
  saving: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');

  useEffect(() => { setDraft(value || ''); }, [value]);

  if (!editing) {
    return (
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</label>
        <div
          onClick={() => setEditing(true)}
          className="mt-1 px-3 py-2 rounded-lg border border-gray-100 text-sm text-gray-700 cursor-pointer hover:border-gray-300 transition-colors"
        >
          {value || <span className="text-gray-300 italic">{placeholder}</span>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</label>
      {multiline ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder={placeholder}
          className="mt-1 w-full px-3 py-2 rounded-lg border border-[#E63946] text-sm text-gray-700 focus:outline-none resize-y"
          autoFocus
        />
      ) : (
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          className="mt-1 w-full px-3 py-2 rounded-lg border border-[#E63946] text-sm text-gray-700 focus:outline-none"
          autoFocus
        />
      )}
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => { onSave({ [field]: draft }); setEditing(false); }}
          disabled={saving}
          className="px-3 py-1 rounded-lg text-xs font-medium bg-[#E63946] text-white hover:opacity-90 disabled:opacity-40"
        >
          Save
        </button>
        <button
          onClick={() => { setDraft(value || ''); setEditing(false); }}
          className="px-3 py-1 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100"
        >
          Cancel
        </button>
        {value && (
          <button
            onClick={() => { onSave({ [field]: '' }); setEditing(false); }}
            className="px-3 py-1 rounded-lg text-xs font-medium text-red-400 hover:bg-red-50"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
