// `npm run build`. Cloudflare Workers Builds runs `npm run build` and then `npx wrangler
// deploy` by default, and sets WORKERS_CI. There, this runs the production preflight,
// the OpenNext build and the D1 migrations (scripts/cf.mjs ci production), so the default
// deploy command finds a checked, built Worker. Everywhere else (Lightsail, Docker, local)
// it is the plain Next.js build, unchanged.
import { spawnSync } from 'node:child_process';

const isWindows = process.platform === 'win32';
function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', shell: isWindows, env: process.env });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (process.env.WORKERS_CI) {
  run('node', ['scripts/cf.mjs', 'ci', 'production']);
} else {
  run('node', ['scripts/gallery-manifest.mjs']);
  run('npx', ['prisma', 'generate']);
  run('npx', ['next', 'build']);
}
