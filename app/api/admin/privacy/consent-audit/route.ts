import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/adminAuth';
import { audit } from '@/lib/audit';
import { CONSENT_ACTIONS, CONSENT_LANGUAGES, cookieNoticeHash } from '@/lib/privacy/consentAudit';
import { NOTICE_VERSION } from '@/lib/privacy/notices';
import { parseLogDate } from '@/lib/privacy/visitorLog';
import { jsonError, logError } from '@/lib/security/request';
import { cleanText, csvCell, oneOf } from '@/lib/validation';

const PAGE_SIZE = 50;

const answer = (value: boolean | null) => (value === null ? '' : value ? 'yes' : 'no');

/** The consent audit trail: one row per saved cookie choice. Read-only. */
export async function GET(request: Request) {
  const { admin, response } = await requirePermission(request, 'privacy:read');
  if (!admin) return response;

  try {
    const params = new URL(request.url).searchParams;
    const from = parseLogDate(params.get('from'));
    const to = parseLogDate(params.get('to'), true);
    const anonymousId = cleanText(params.get('anonymousId'), 64).toLowerCase();
    const action = oneOf(params.get('action'), CONSENT_ACTIONS);
    const language = oneOf(params.get('language'), CONSENT_LANGUAGES);

    const where = {
      ...(from || to ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
      ...(anonymousId ? { anonymousId } : {}),
      ...(action ? { action } : {}),
      ...(language ? { language } : {}),
    };

    if (params.get('format') === 'csv') {
      const rows = await prisma.consentAuditEvent.findMany({ where, orderBy: { createdAt: 'desc' }, take: 20000 });
      // Marketing is the advertising and remarketing cookie category.
      const header = 'Time (UTC),Anonymous ID,Action,Source,Necessary,Analytics,Marketing,Videos & maps,Language,Masked IP,Notice version,Notice hash (SHA-256)';
      const lines = rows.map((row) =>
        [
          row.createdAt.toISOString(),
          row.anonymousId,
          row.action,
          row.source,
          answer(row.necessary),
          answer(row.analytics),
          answer(row.advertising),
          answer(row.media),
          row.language,
          row.maskedIp || '',
          row.noticeVersion,
          row.noticeHash,
        ]
          .map(csvCell)
          .join(','),
      );
      await audit(admin, 'consent_audit.exported', 'consent_audit_event', undefined, { count: rows.length });
      return new Response(`﻿${[header, ...lines].join('\r\n')}`, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="vastu_vihar_consent_audit_${new Date().toISOString().slice(0, 10)}.csv"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    const page = Math.max(1, Number.parseInt(params.get('page') || '1', 10) || 1);
    const answered = (category: 'analytics' | 'advertising' | 'media', value: boolean) =>
      prisma.consentAuditEvent.count({ where: { ...where, [category]: value } });
    const [rows, total, byAction, ...answers] = await Promise.all([
      prisma.consentAuditEvent.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
      prisma.consentAuditEvent.count({ where }),
      prisma.consentAuditEvent.groupBy({ by: ['action'], where, _count: { _all: true } }),
      answered('analytics', true),
      answered('analytics', false),
      answered('advertising', true),
      answered('advertising', false),
      answered('media', true),
      answered('media', false),
    ]);
    // How often each category was allowed among the saves that answered it.
    const [analyticsYes, analyticsNo, marketingYes, marketingNo, mediaYes, mediaNo] = answers;
    const optIn = {
      analytics: { allowed: analyticsYes, refused: analyticsNo },
      marketing: { allowed: marketingYes, refused: marketingNo },
      media: { allowed: mediaYes, refused: mediaNo },
    };

    return NextResponse.json({
      success: true,
      rows,
      total,
      page,
      pageSize: PAGE_SIZE,
      summary: byAction.map((group) => ({ action: group.action, count: group._count._all })),
      optIn,
      actions: CONSENT_ACTIONS,
      // What a row's hash should be for the notice live right now, per language.
      current: {
        noticeVersion: NOTICE_VERSION,
        hashes: Object.fromEntries(CONSENT_LANGUAGES.map((lang) => [lang, cookieNoticeHash(lang)])),
      },
    });
  } catch (error) {
    logError('admin.privacy.consent_audit', error);
    return jsonError('Failed to load the consent audit', 500);
  }
}
