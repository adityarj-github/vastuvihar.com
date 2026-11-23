// Local-development login bypass for the admin panel.
//
// Active only when BOTH of these hold:
//   1. the server is `next dev` (NODE_ENV === 'development'). `next build`, `next start`
//      and the Cloudflare Worker always run with NODE_ENV=production;
//   2. ADMIN_DEV_BYPASS is 'loopback-only', which only `npm run dev:local`
//      (scripts/dev-local.mjs) sets. That command binds the server to 127.0.0.1, so no
//      other device can connect. Do not put this variable in a .env file: plain
//      `npm run dev` also listens on the LAN, and request headers (Host,
//      X-Forwarded-For) cannot prove where a request came from.
//
// The Host check below is a second guard against DNS rebinding from a web page.
// The bypass signs in as the built-in super admin (MASTER_ADMIN in lib/adminAuth.ts).

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

export const DEV_BYPASS_EMAIL = 'dev-bypass@localhost';

function hostName(host: string) {
  // "localhost:3000" → "localhost", "[::1]:3000" → "[::1]"
  return host.startsWith('[') ? host.slice(0, host.indexOf(']') + 1) : host.split(':')[0];
}

/** True when this request may skip the admin login (see the conditions above). */
export function isDevBypassRequest(headers: Headers): boolean {
  if (process.env.NODE_ENV !== 'development' || process.env.ADMIN_DEV_BYPASS !== 'loopback-only') return false;
  return LOOPBACK_HOSTS.has(hostName((headers.get('host') || '').trim().toLowerCase()));
}
