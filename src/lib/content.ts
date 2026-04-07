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

export interface ContentData {
  roles: Record<string, RoleContent>;
  ui: UIContent;
  global: GlobalPrompt;
  updatedAt?: string;
}

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_CONTENT: ContentData = {
  roles: {},
  ui: {},
  global: {},
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
