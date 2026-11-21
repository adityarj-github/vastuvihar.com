import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

// Every page renders on each request (`dynamic = 'force-dynamic'` in app/layout.jsx), so
// the site needs no R2 page cache, tag cache or queue. The build output cache is read-only.
// Do not add `revalidate` to a page: with this cache it would never refresh.
export default {
  ...defineCloudflareConfig({
    incrementalCache: staticAssetsIncrementalCache,
  }),
  // `npm run cf:build` runs OpenNext, so OpenNext must not call it back.
  buildCommand: 'npm run build:next',
};
