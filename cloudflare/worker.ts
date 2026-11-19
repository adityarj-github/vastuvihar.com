// The Worker entry point. It serves the OpenNext build unchanged, and adds the daily
// retention job as a Cron Trigger (wrangler.jsonc "triggers"), because a Worker has no
// server crontab. Built by `opennextjs-cloudflare build`, then bundled by Wrangler.
// @ts-ignore: generated at build time
import handler from '../.open-next/worker.js';

interface Env {
  RETENTION_CRON_SECRET?: string;
  [binding: string]: unknown;
}

export default {
  fetch: handler.fetch,

  async scheduled(_controller: unknown, env: Env, ctx: { waitUntil(promise: Promise<unknown>): void }) {
    const secret = env.RETENTION_CRON_SECRET;
    if (!secret || secret.length < 32) {
      console.warn('[retention] RETENTION_CRON_SECRET is not set, so the scheduled run was skipped.');
      return;
    }
    // The same protected endpoint a server cron would call, so one code path runs both.
    const request = new Request('https://worker.internal/api/internal/retention/', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}` },
    });
    const response = await handler.fetch(request, env, ctx);
    if (!response.ok) throw new Error(`[retention] scheduled run failed with ${response.status}`);
    console.log('[retention] scheduled run finished.');
  },
};
