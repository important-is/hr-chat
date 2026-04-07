import { NextResponse } from 'next/server';
import { loadContent } from '@/lib/content';
import { ROLES } from '@/lib/roles';

export const dynamic = 'force-dynamic';

/** Public endpoint — returns merged role data + UI overrides (no prompts!) */
export async function GET() {
  const content = loadContent();

  const roles: Record<string, {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    tags: string[];
    emoji: string;
  }> = {};

  for (const [id, role] of Object.entries(ROLES)) {
    const override = content.roles[id] || {};
    roles[id] = {
      id,
      title: override.title || role.title,
      subtitle: override.subtitle || role.subtitle,
      description: override.description || role.description,
      tags: override.tags || role.tags,
      emoji: role.emoji,
    };
  }

  return NextResponse.json({ roles, ui: content.ui || {} });
}
