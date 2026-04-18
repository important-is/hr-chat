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

export interface ContentData {
  roles: Record<string, RoleContent>;
  ui: UIContent;
  global: GlobalPrompt;
  modelOverride?: ModelOverride | null;
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
