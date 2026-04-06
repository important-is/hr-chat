import { WORDPRESS_DEV_PROMPT } from './prompts/wordpress-dev';
import { PM_PROMPT } from './prompts/pm';
import { GRAFIK_PROMPT } from './prompts/grafik';
import { AI_SPECIALIST_PROMPT } from './prompts/ai-specialist';
import { AUTOMATYZACJE_PROMPT } from './prompts/automatyzacje';

export interface Role {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  prompt: string;
  notionRole: string;
  description: string;
  tags: string[];
}

export const ROLES: Record<string, Role> = {
  'wordpress-dev': {
    id: 'wordpress-dev',
    title: 'Ekspert od WordPress',
    subtitle: 'Bricks, Gutenberg, WooCommerce',
    emoji: '🌐',
    prompt: WORDPRESS_DEV_PROMPT,
    notionRole: 'WordPress Developer',
    description: 'Szukamy osoby, która ogarnia WordPress od podszewki — Bricks Builder, WooCommerce, optymalizacja, custom development. Opiekujemy się serwisami klientów generującymi realne przychody, więc liczy się jakość i odpowiedzialność. Jeśli lubisz rozwiązywać problemy, dbasz o detal i chcesz rozwijać się w stabilnym zespole — to rola dla Ciebie.',
    tags: ['B2B', '~35h/tydzień', 'Remote', 'Stała współpraca'],
  },
  pm: {
    id: 'pm',
    title: 'Project Manager',
    subtitle: 'Komunikacja, ClickUp, klienci',
    emoji: '📋',
    prompt: PM_PROMPT,
    notionRole: 'Project Manager',
    description: 'Szukamy kogoś, kto będzie mostem między klientami a zespołem dev/design. Prowadzisz projekty od A do Z — komunikacja z klientem, koordynacja zespołu, pilnowanie terminów i budżetów. Nie boisz się trudnych rozmów i potrafisz ogarnąć kilka projektów naraz.',
    tags: ['B2B', 'Elastyczne godziny', 'Remote', 'Stała współpraca'],
  },
  grafik: {
    id: 'grafik',
    title: 'Grafik / Designer',
    subtitle: 'Figma, UI/UX, branding',
    emoji: '🎨',
    prompt: GRAFIK_PROMPT,
    notionRole: 'Grafik',
    description: 'Szukamy designera, który nie tylko tworzy piękne rzeczy, ale myśli o UX i rozumie web. Pracujemy w Figmie, wdrażamy na WordPress (Bricks Builder). Od brandingu przez UI stron po kreacje social media — jeśli masz oko do detalu i lubisz projektować z myślą o użytkowniku, porozmawiajmy.',
    tags: ['B2B', 'Projekty + stała współpraca', 'Remote'],
  },
  'ai-specialist': {
    id: 'ai-specialist',
    title: 'AI Specialist',
    subtitle: 'LLM, prompting, integracje AI',
    emoji: '🤖',
    prompt: AI_SPECIALIST_PROMPT,
    notionRole: 'AI Specialist',
    description: 'Szukamy kogoś, kto ogarnia AI od strony technicznej — nie tylko promptuje, ale integruje, buduje workflow i myśli o realnych zastosowaniach biznesowych. Wdrażamy AI w procesy klientów i własne — od chatbotów po automatyzacje treści i integracje LLM.',
    tags: ['B2B', 'Projekty + stała współpraca', 'Remote'],
  },
  automatyzacje: {
    id: 'automatyzacje',
    title: 'Specjalista od automatyzacji',
    subtitle: 'n8n, Zapier, Make, API',
    emoji: '⚡',
    prompt: AUTOMATYZACJE_PROMPT,
    notionRole: 'Automatyzacje',
    description: 'Szukamy kogoś, kto myśli procesowo i potrafi zautomatyzować to, co ludzie robią ręcznie. Główne narzędzie to n8n (self-hosted). Integrujemy CRM, maile, płatności, powiadomienia, raporty. Jeśli lubisz łączyć systemy i budować workflow — to Twoje miejsce.',
    tags: ['B2B', 'Projekty + stała współpraca', 'Remote'],
  },
};

export function getRole(id: string): Role | undefined {
  return ROLES[id];
}
