import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

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
  heroTitle?: string; // "Dołącz do zespołu."
  heroSubtitle?: string; // "Wybierz stanowisko..."
  howItWorksTitle?: string; // "Jak to działa?"
  howItWorksText?: string; // "Kaja, nasza asystentka AI..."
  successTitle?: string; // "Dziękujemy za rozmowę!"
  successText?: string; // "Twoje odpowiedzi..."
  fallbackTitle?: string; // "Kaja chwilowo niedostępna."
  fallbackText?: string; // "Mamy teraz dużo rozmów..."
}

export interface ContentData {
  roles: Record<string, RoleContent>;
  ui: UIContent;
  updatedAt?: string;
}

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_CONTENT: ContentData = {
  roles: {},
  ui: {},
};

export function loadContent(): ContentData {
  ensureDir();
  if (!existsSync(CONTENT_FILE)) return DEFAULT_CONTENT;
  try {
    return JSON.parse(readFileSync(CONTENT_FILE, 'utf-8'));
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
