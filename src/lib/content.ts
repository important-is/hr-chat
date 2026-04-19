import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { COMPANY_KNOWLEDGE, INTERVIEW_RULES } from './prompts/shared';

const DATA_DIR = join(process.cwd(), 'data');
const CONTENT_FILE = join(DATA_DIR, 'content.json');

export interface RoleContent {
  title?: string;
  subtitle?: string;
  description?: string;
  tags?: string[];
  prompt?: string;
}

export interface UIContent {
  heroTitle?: string;
  heroSubtitle?: string;
  howItWorksTitle?: string;
  howItWorksText?: string;
  successTitle?: string;
  successText?: string;
  fallbackTitle?: string;
  fallbackText?: string;
}

export interface GlobalPrompt {
  companyKnowledge?: string; // Override for COMPANY_KNOWLEDGE
  interviewRules?: string;   // Override for INTERVIEW_RULES
}

export type ModelProvider = 'openai' | 'anthropic';

export interface ModelOverride {
  provider: ModelProvider;
  modelId: string;
}

export interface EmailTemplate {
  subject?: string;
  html?: string;
}

export type EmailTemplateType = 'candidateConfirmation' | 'lukaszNotification';

export interface EmailTemplates {
  candidateConfirmation?: EmailTemplate;
  lukaszNotification?: EmailTemplate;
}

export interface ContentData {
  roles: Record<string, RoleContent>;
  ui: UIContent;
  global: GlobalPrompt;
  modelOverride?: ModelOverride | null;
  emailTemplates?: EmailTemplates;
  updatedAt?: string;
}

/**
 * Lista dostępnych modeli do wyboru z panelu admina.
 * priceIn / priceOut — USD per MTok (1 mln tokenów).
 */
export const AVAILABLE_MODELS = {
  openai: [
    { id: 'gpt-4o-mini', label: 'GPT-4o mini (tani, domyślny)', priceIn: 0.15, priceOut: 0.60 },
    { id: 'gpt-4o', label: 'GPT-4o (droższy, bardziej niezawodny)', priceIn: 2.50, priceOut: 10.00 },
  ],
  anthropic: [
    { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5 (tani)', priceIn: 1, priceOut: 5 },
    { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (droższy)', priceIn: 3, priceOut: 15 },
  ],
} as const;

export type AvailableProvider = keyof typeof AVAILABLE_MODELS;

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_CONTENT: ContentData = {
  roles: {},
  ui: {},
  global: {},
  modelOverride: null,
  emailTemplates: {},
};

/**
 * Domyślne szablony maili — używane jako fallback gdy brak override w content.json.
 * Placeholdery:
 *  - candidateConfirmation: {{imie}}, {{imie_first}}, {{email}}, {{rola}}
 *  - lukaszNotification: {{imie}}, {{email}}, {{rola}}, {{wynik}}, {{decyzja}},
 *    {{notatki}}, {{notionUrl}}, {{earlyTag}}, {{emoji}}
 */
export const DEFAULT_EMAIL_TEMPLATES: Record<EmailTemplateType, Required<EmailTemplate>> = {
  candidateConfirmation: {
    subject: 'Dzięki za rozmowę, {{imie_first}}! ✌️',
    html: `
      <div style="font-family: sans-serif; max-width: 560px; color: #222;">
        <h2 style="font-size: 22px; margin-bottom: 8px;">Hej {{imie_first}}! 👋</h2>
        <p>Dzięki za rozmowę na stanowisko <strong>{{rola}}</strong> w important.is.</p>
        <p>Łukasz przejrzy Twoje odpowiedzi i odezwie się do Ciebie w ciągu <strong>5 dni roboczych</strong>.</p>
        <p style="color: #666; font-size: 14px;">Jeśli masz pytania — pisz śmiało na <a href="mailto:hi@important.is">hi@important.is</a>.</p>
        <p style="margin-top: 32px;">Do usłyszenia,<br><strong>Kaja</strong><br><span style="color:#666;font-size:13px;">Rekruterka · important.is</span></p>
      </div>
    `.trim(),
  },
  lukaszNotification: {
    subject: '{{emoji}} Nowy kandydat: {{imie}} — {{rola}}{{earlyTag}}',
    html: `
      <div style="font-family: sans-serif; max-width: 600px;">
        <h2 style="margin-bottom: 4px;">{{emoji}} {{imie}}{{earlyTag}}</h2>
        <p style="color: #666; margin-top: 0;">Rola: <strong>{{rola}}</strong></p>

        <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #eee; color: #666;">Email</td>
            <td style="padding: 8px; border: 1px solid #eee;"><a href="mailto:{{email}}">{{email}}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #eee; color: #666;">Wynik</td>
            <td style="padding: 8px; border: 1px solid #eee;">{{wynik}}/55 pkt</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #eee; color: #666;">Decyzja</td>
            <td style="padding: 8px; border: 1px solid #eee;"><strong>{{decyzja}}</strong></td>
          </tr>
        </table>

        <p style="color: #333;"><strong>Notatki Kai:</strong><br>{{notatki}}</p>

        {{notionUrl}}
        {{earlyNote}}
      </div>
    `.trim(),
  },
};

export function loadContent(): ContentData {
  ensureDir();
  if (!existsSync(CONTENT_FILE)) return DEFAULT_CONTENT;
  try {
    const data = JSON.parse(readFileSync(CONTENT_FILE, 'utf-8'));
    return { ...DEFAULT_CONTENT, ...data };
  } catch {
    return DEFAULT_CONTENT;
  }
}

export function saveContent(data: ContentData) {
  ensureDir();
  data.updatedAt = new Date().toISOString();
  writeFileSync(CONTENT_FILE, JSON.stringify(data, null, 2));
}

/** Get role content with overrides applied */
export function getRoleOverride(roleId: string): RoleContent {
  const content = loadContent();
  return content.roles[roleId] || {};
}

/** Get UI content with overrides */
export function getUIOverrides(): UIContent {
  return loadContent().ui || {};
}

/** Get global prompt overrides (null = use defaults baked into role prompts) */
export function getGlobalPromptOverrides(): { companyKnowledge: string | null; interviewRules: string | null } {
  const content = loadContent();
  return {
    companyKnowledge: content.global?.companyKnowledge || null,
    interviewRules: content.global?.interviewRules || null,
  };
}

/** Get the defaults from code (for admin UI "reset" feature) */
export const DEFAULTS = {
  companyKnowledge: COMPANY_KNOWLEDGE,
  interviewRules: INTERVIEW_RULES,
};

/**
 * Pobierz aktualny override modelu ustawiony z panelu admina.
 * Zwraca null gdy brak override — wtedy używamy env var MODEL_PROVIDER.
 */
export function getModelOverride(): ModelOverride | null {
  const content = loadContent();
  const override = content.modelOverride;
  if (!override) return null;
  // Walidacja — na wypadek uszkodzonego content.json
  const providerModels = AVAILABLE_MODELS[override.provider as AvailableProvider];
  if (!providerModels) return null;
  const exists = providerModels.some((m) => m.id === override.modelId);
  if (!exists) return null;
  return { provider: override.provider, modelId: override.modelId };
}

/**
 * Zapisz (lub wyczyść) override modelu.
 * null = reset do env default.
 */
export function setModelOverride(override: ModelOverride | null): void {
  const content = loadContent();
  content.modelOverride = override;
  saveContent(content);
}

/**
 * Pobierz override szablonu maila z content.json.
 * Zwraca null jeśli brak override (lub nie ma ani subject, ani html) —
 * wtedy mailer powinien użyć hardcoded defaultu z kodu.
 */
export function getEmailTemplate(type: EmailTemplateType): { subject: string; html: string } | null {
  const content = loadContent();
  const tpl = content.emailTemplates?.[type];
  if (!tpl) return null;
  const subject = (tpl.subject ?? '').trim();
  const html = (tpl.html ?? '').trim();
  if (!subject && !html) return null;
  const defaults = DEFAULT_EMAIL_TEMPLATES[type];
  return {
    subject: subject || defaults.subject,
    html: html || defaults.html,
  };
}

/**
 * Zapisz (lub wyczyść) override szablonu maila.
 * Przekaż pusty obiekt `{}` aby zresetować do defaultów z kodu.
 */
export function setEmailTemplate(type: EmailTemplateType, template: EmailTemplate | null): void {
  const content = loadContent();
  if (!content.emailTemplates) content.emailTemplates = {};
  if (template === null || (!template.subject && !template.html)) {
    delete content.emailTemplates[type];
  } else {
    content.emailTemplates[type] = {
      ...content.emailTemplates[type],
      ...template,
    };
  }
  saveContent(content);
}
