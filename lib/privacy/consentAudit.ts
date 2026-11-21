import { prisma } from '@/lib/prisma';
import { sha256 } from '@/lib/security/crypto';
import { OFFERED_CATEGORIES, categoryText } from './cookieConfig';
import { COOKIE_NOTICE, NOTICE_VERSION } from './notices';

// What a visitor did when the choice was saved. Shared with the admin filters.
export const CONSENT_ACTIONS = ['accept_all', 'reject_all', 'save_preferences', 'allow_embed', 'policy_update'] as const;
export type ConsentAction = (typeof CONSENT_ACTIONS)[number];

export const CONSENT_LANGUAGES = ['en', 'hi'] as const;

/**
 * Keeps only the network part of an address: IPv4 to /24 (203.0.113.0), IPv6 to /48
 * (2001:db8:abcd::). The full address is never stored.
 */
export function maskIp(ip: string | null | undefined): string | null {
  const value = (ip || '').trim().split('%')[0];
  if (!value || value === 'unknown') return null;

  const v4 = value.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const octets = v4.slice(1).map(Number);
    return octets.every((octet) => octet <= 255) ? `${octets[0]}.${octets[1]}.${octets[2]}.0` : null;
  }

  if (!value.includes(':')) return null;
  const halves = value.split('::');
  if (halves.length > 2) return null;
  const groups = (part: string) =>
    part ? part.split(':').flatMap((group) => (group.includes('.') ? ['0', '0'] : [group])) : [];
  const head = groups(halves[0]);
  const tail = halves.length === 2 ? groups(halves[1]) : [];
  const missing = 8 - head.length - tail.length;
  if (missing < 0 || (halves.length === 1 && missing !== 0)) return null;
  const all = [...head, ...Array(missing).fill('0'), ...tail];
  if (!all.every((group) => /^[0-9a-f]{1,4}$/i.test(group))) return null;
  return `${all.slice(0, 3).map((group) => group.toLowerCase().replace(/^0+(?=.)/, '')).join(':')}::`;
}

const hashes = new Map<string, string>();

/**
 * SHA-256 of the cookie notice exactly as this build shows it in one language: the notice
 * version, the banner text and the name and description of every category on offer.
 * Computed on the server, so a browser cannot claim it saw different wording.
 */
export function cookieNoticeHash(language: string): string {
  const lang = (CONSENT_LANGUAGES as readonly string[]).includes(language) ? language : 'en';
  const cached = hashes.get(lang);
  if (cached) return cached;
  const notice = {
    version: NOTICE_VERSION,
    language: lang,
    text: COOKIE_NOTICE[lang as 'en' | 'hi'],
    categories: ['necessary', ...OFFERED_CATEGORIES].map((category) => ({ category, ...categoryText(category, lang) })),
  };
  const hash = sha256(JSON.stringify(notice));
  hashes.set(lang, hash);
  return hash;
}

/** Works out the action from the choices when the browser did not say. */
function inferAction(choices: Record<string, boolean>, source: string): ConsentAction {
  if (source === 'embed') return 'allow_embed';
  if (source === 'privacy_policy') return 'policy_update';
  const values = OFFERED_CATEGORIES.map((category) => choices[category]);
  if (values.every((value) => value === true)) return 'accept_all';
  if (values.every((value) => value === false)) return 'reject_all';
  return 'save_preferences';
}

interface AuditInput {
  anonymousId: string;
  action?: ConsentAction | null;
  source: string;
  choices: Record<string, boolean>;
  language: string;
  ip: string;
}

export async function recordConsentAudit(input: AuditInput) {
  const answer = (category: string) => (typeof input.choices[category] === 'boolean' ? input.choices[category] : null);
  return prisma.consentAuditEvent.create({
    data: {
      anonymousId: input.anonymousId,
      action: input.action || inferAction(input.choices, input.source),
      source: input.source,
      necessary: true,
      media: answer('media'),
      analytics: answer('analytics'),
      advertising: answer('advertising'),
      language: input.language,
      maskedIp: maskIp(input.ip),
      noticeVersion: NOTICE_VERSION,
      noticeHash: cookieNoticeHash(input.language),
    },
  });
}
