import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import {
  loadContent,
  saveContent,
  DEFAULTS,
  DEFAULT_EMAIL_TEMPLATES,
  setEmailTemplate,
  type EmailTemplateType,
} from '@/lib/content';
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

  // Email templates — zwracamy override (jeśli jest) oraz defaulty z kodu
  const emailOverrides = content.emailTemplates || {};
  const emailTemplates: Record<EmailTemplateType, { subject: string; html: string; override: { subject?: string; html?: string } }> = {
    candidateConfirmation: {
      subject: emailOverrides.candidateConfirmation?.subject || DEFAULT_EMAIL_TEMPLATES.candidateConfirmation.subject,
      html: emailOverrides.candidateConfirmation?.html || DEFAULT_EMAIL_TEMPLATES.candidateConfirmation.html,
      override: emailOverrides.candidateConfirmation || {},
    },
    lukaszNotification: {
      subject: emailOverrides.lukaszNotification?.subject || DEFAULT_EMAIL_TEMPLATES.lukaszNotification.subject,
      html: emailOverrides.lukaszNotification?.html || DEFAULT_EMAIL_TEMPLATES.lukaszNotification.html,
      override: emailOverrides.lukaszNotification || {},
    },
  };

  return NextResponse.json({
    roles: rolesWithDefaults,
    ui: content.ui || {},
    global: content.global || {},
    emailTemplates,
    defaults: {
      companyKnowledge: DEFAULTS.companyKnowledge,
      interviewRules: DEFAULTS.interviewRules,
      emailTemplates: DEFAULT_EMAIL_TEMPLATES,
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

    // Email templates — merge/save override
    if (body.emailTemplates && typeof body.emailTemplates === 'object') {
      if (!content.emailTemplates) content.emailTemplates = {};
      for (const [type, tpl] of Object.entries(body.emailTemplates) as [EmailTemplateType, { subject?: string; html?: string } | null][]) {
        if (type !== 'candidateConfirmation' && type !== 'lukaszNotification') continue;
        if (tpl === null) {
          delete content.emailTemplates[type];
          continue;
        }
        content.emailTemplates[type] = {
          ...content.emailTemplates[type],
          ...(tpl.subject !== undefined ? { subject: tpl.subject } : {}),
          ...(tpl.html !== undefined ? { html: tpl.html } : {}),
        };
      }
    }

    // Reset email template to defaults
    if (body.resetEmailTemplate) {
      const type = body.resetEmailTemplate as EmailTemplateType;
      if (type === 'candidateConfirmation' || type === 'lukaszNotification') {
        setEmailTemplate(type, null);
        // reload — setEmailTemplate zapisało już content
        return NextResponse.json({ success: true, updatedAt: new Date().toISOString() });
      }
    }

    saveContent(content);
    return NextResponse.json({ success: true, updatedAt: content.updatedAt });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
