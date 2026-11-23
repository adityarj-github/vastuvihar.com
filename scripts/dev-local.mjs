// `npm run dev:local`: the dev server with the admin login skipped.
//
// It listens on 127.0.0.1 only, so nothing else on the network can reach it, and sets
// ADMIN_DEV_BYPASS for this process (lib/security/devBypass.ts). Plain `npm run dev`
// still listens on the LAN and still asks for a login.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const nextBin = require.resolve('next/dist/bin/next');

const child = spawn(process.execPath, [nextBin, 'dev', '--webpack', '--hostname', '127.0.0.1', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env, ADMIN_DEV_BYPASS: 'loopback-only' },
});

for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('exit', (code) => process.exit(code ?? 0));
