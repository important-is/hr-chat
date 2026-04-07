import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { loadContent, saveContent, DEFAULTS } from '@/lib/content';
import { ROLES } from '@/lib/roles';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const content = loadContent();

  const rolesWithDefaults: Record<string, {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    tags: string[];
    prompt: string;
    override: Partial<{ title: string; subtitle: string; description: string; tags: string[]; prompt: string }>;
  }> = {};

  for (const [id, role] of Object.entries(ROLES)) {
    const override = content.roles[id] || {};
    rolesWithDefaults[id] = {
      id,
      title: override.title || role.title,
      subtitle: override.subtitle || role.subtitle,
      description: override.description || role.description,
      tags: override.tags || role.tags,
      prompt: override.prompt || role.prompt,
      override,
    };
  }

  return NextResponse.json({
    roles: rolesWithDefaults,
    ui: content.ui || {},
    global: content.global || {},
    defaults: {
      companyKnowledge: DEFAULTS.companyKnowledge,
      interviewRules: DEFAULTS.interviewRules,
    },
    updatedAt: content.updatedAt,
  });
}

export async function PUT(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const content = loadContent();

    // Update role overrides
    if (body.roleId && body.roleData) {
      content.roles[body.roleId] = {
        ...content.roles[body.roleId],
        ...body.roleData,
      };
    }

    // Update UI overrides
    if (body.ui) {
      content.ui = { ...content.ui, ...body.ui };
    }

    // Update global prompt overrides
    if (body.global) {
      content.global = { ...content.global, ...body.global };
    }

    // Reset a role to defaults
    if (body.resetRole) {
      delete content.roles[body.resetRole];
    }

    // Reset global to defaults
    if (body.resetGlobal) {
      if (body.resetGlobal === 'companyKnowledge') delete content.global.companyKnowledge;
      else if (body.resetGlobal === 'interviewRules') delete content.global.interviewRules;
      else if (body.resetGlobal === 'all') content.global = {};
    }

    saveContent(content);
    return NextResponse.json({ success: true, updatedAt: content.updatedAt });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
