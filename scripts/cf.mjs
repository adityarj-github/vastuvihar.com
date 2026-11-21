// One entry point for Cloudflare builds and deploys, so every environment is built the
// same way and nothing reaches Cloudflare without passing the preflight checks.
//
//   node scripts/cf.mjs preflight production
//   node scripts/cf.mjs build     <local|production>
//   node scripts/cf.mjs migrate   <local|production>
//   node scripts/cf.mjs deploy    production --confirm-production
//   node scripts/cf.mjs ci        production   (Workers Builds: preflight, build, migrate; its deploy step deploys)
//   node scripts/cf.mjs upload    production --confirm-production   (new version, no traffic moved)
//
// UAT was removed for now. Its Worker and D1 still exist in Cloudflare; to bring it back,
// restore env.uat in wrangler.jsonc and the uat entry below from git history.
//
// Production deploys also need --confirm-production and a clean, committed tree.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);

const ENVIRONMENTS = {
  local: { wranglerEnv: null, appEnv: 'local', siteUrl: 'http://localhost:8787', allowTags: false },
  production: {
    wranglerEnv: null,
    appEnv: 'production',
    siteUrl: process.env.PRODUCTION_SITE_URL || 'https://vastuvihar.org',
    allowTags: true,
  },
};

const REQUIRED_SECRETS = ['PRIVACY_HASH_SECRET', 'RETENTION_CRON_SECRET'];
const TAG_VARS = [
  'NEXT_PUBLIC_GA4_ID',
  'NEXT_PUBLIC_GOOGLE_ADS_ID',
  'NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL',
  'NEXT_PUBLIC_META_PIXEL_ID',
  'NEXT_PUBLIC_CLARITY_ID',
];
// OpenNext copies these files into the Worker bundle (compile-env-files.js), so local
// secrets would ship inside it and silently stand in for a missing Wrangler secret.
const BUNDLED_ENV_FILES = ['.env', '.env.local', '.env.production', '.env.production.local'];

const [command, target, ...flags] = process.argv.slice(2);
const env = ENVIRONMENTS[target];
if (!['preflight', 'build', 'migrate', 'deploy', 'upload', 'ci'].includes(command) || !env) {
  console.error('Usage: node scripts/cf.mjs <preflight|build|migrate|deploy|upload|ci> <local|production>');
  process.exit(1);
}
if (['preflight', 'deploy', 'upload', 'ci'].includes(command) && target === 'local') {
  console.error(`"${command}" needs production.`);
  process.exit(1);
}

const isWindows = process.platform === 'win32';
function run(cmd, args, options = {}) {
  console.log(`\n> ${cmd} ${args.join(' ')}`);
  const result = spawnSync(cmd, args, { stdio: 'inherit', shell: isWindows, env: process.env, ...options });
  if (result.status !== 0) {
    console.error(`\nFailed: ${cmd} ${args.join(' ')}`);
    process.exit(result.status ?? 1);
  }
  return result;
}
const envArgs = env.wranglerEnv ? ['--env', env.wranglerEnv] : [];

async function preflight() {
  const problems = [];
  const warnings = [];
  const { unstable_readConfig: readConfig } = await import('wrangler');
  const config = readConfig({ config: 'wrangler.jsonc', env: env.wranglerEnv ?? undefined }, { hideWarnings: true });

  // Every value, binding and ID must be real.
  const serialised = JSON.stringify({ vars: config.vars, d1: config.d1_databases, r2: config.r2_buckets, name: config.name });
  for (const match of serialised.matchAll(/"([A-Z_]+)":"(REPLACE_[^"]*)"/g)) {
    // Placeholder Access values keep the admin area closed (proxy.ts answers 503), so they
    // are safe to deploy with. Every other placeholder blocks the deploy.
    if (match[1].startsWith('CF_ACCESS_')) continue;
    problems.push(`${match[1]} is still "${match[2]}" in wrangler.jsonc.`);
  }
  for (const match of serialised.matchAll(/"(database_id|bucket_name)":"(REPLACE_[^"]*)"/g)) problems.push(`${match[1]} is still "${match[2]}".`);
  if (config.vars?.REQUIRE_CF_ACCESS === '1' && /REPLACE_/.test(`${config.vars?.CF_ACCESS_TEAM_DOMAIN}${config.vars?.CF_ACCESS_AUD}`)) {
    warnings.push('Cloudflare Access is not configured, so the admin area is LOCKED (503) for everyone. Fill CF_ACCESS_TEAM_DOMAIN and CF_ACCESS_AUD to open it.');
  }

  const d1 = (config.d1_databases || []).find((db) => db.binding === 'DB');
  if (!d1?.database_id) problems.push('The DB binding has no database_id.');
  // R2 bindings may be left out until R2 is enabled. Uploads then answer "File storage is
  // not available" (lib/privateStorage.ts) and the rest of the site works.
  const boundR2 = config.r2_buckets || [];
  for (const binding of ['PRIVATE_FILES', 'MEDIA']) {
    if (!boundR2.some((bucket) => bucket.binding === binding)) warnings.push(`R2 binding ${binding} is not set, so file uploads (resumes, blog and gallery images) are off.`);
  }
  if (config.vars?.APP_ENV !== env.appEnv) problems.push(`vars.APP_ENV is "${config.vars?.APP_ENV}", expected "${env.appEnv}".`);

  // Without Access, the admin login is the only gate (owner's decision, see wrangler.jsonc).
  if (config.vars?.REQUIRE_CF_ACCESS !== '1') {
    warnings.push('Cloudflare Access is off. The admin login page is public; only passwords protect it.');
  }
  if (target === 'production') {
    // Temporarily allowed until vastuvihar.org moves to Cloudflare (see wrangler.jsonc).
    if (config.workers_dev !== false) warnings.push('workers_dev is on. Turn it off at cutover so nothing routes around the WAF.');
    if (config.preview_urls !== false) problems.push('Production must set "preview_urls": false.');
  }

  // R2 must exist before a deploy that binds it.
  const buckets = boundR2.length
    ? spawnSync('npx', ['wrangler', 'r2', 'bucket', 'list'], { encoding: 'utf8', shell: isWindows, env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: config.account_id } })
    : { status: 0, stdout: '', stderr: '' };
  const bucketText = `${buckets.stdout}${buckets.stderr}`;
  if (/enable R2|10042/i.test(bucketText)) problems.push('R2 is not enabled on this Cloudflare account (dashboard > R2).');
  else if (buckets.status !== 0) {
    const lines = bucketText.split('\n').map((line) => line.replace(/\x1b\[[0-9;]*m/g, '').trim());
    const reason = lines.find((line) => /\[ERROR\]|\[code: \d+\]/.test(line)) || lines.find((line) => /error|permission|unauthori[sz]ed/i.test(line)) || 'unknown error';
    problems.push(`Could not list R2 buckets (does the API token have R2 access?): ${reason.trim()}`);
  } else {
    for (const bucket of config.r2_buckets || []) {
      if (!bucketText.includes(bucket.bucket_name)) problems.push(`R2 bucket ${bucket.bucket_name} does not exist.`);
    }
  }

  // Secrets are set with `wrangler secret put`, never in files.
  const secrets = spawnSync('npx', ['wrangler', 'secret', 'list', '--format', 'json', ...envArgs], {
    encoding: 'utf8',
    shell: isWindows,
    env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: config.account_id },
  });
  let names = [];
  try {
    names = JSON.parse(secrets.stdout.slice(secrets.stdout.indexOf('['))).map((secret) => secret.name);
  } catch {
    warnings.push('Could not list Worker secrets (the Worker may not exist yet). Set them right after the first upload.');
  }
  for (const name of REQUIRED_SECRETS) {
    if (names.length && !names.includes(name)) problems.push(`Secret ${name} is not set: npx wrangler secret put ${name} ${envArgs.join(' ')}`);
  }
  if (names.length && !names.includes('ADMIN_PASSWORD')) {
    warnings.push(`Secret ADMIN_PASSWORD is not set, so the master admin login is off: npx wrangler secret put ADMIN_PASSWORD ${envArgs.join(' ')}`);
  }

  for (const file of BUNDLED_ENV_FILES) {
    if (fs.existsSync(file)) problems.push(`${file} exists. OpenNext would bundle its values into the Worker. Build in CI, or move it out of the project first.`);
  }

  if (target === 'production') {
    const status = spawnSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).stdout.trim();
    if (status) problems.push('The git working tree has uncommitted changes. Production deploys only committed code.');
    if (!flags.includes('--confirm-production') && ['deploy', 'upload'].includes(command)) {
      problems.push('Production needs --confirm-production.');
    }
  }

  for (const warning of warnings) console.warn(`WARN  ${warning}`);
  if (problems.length) {
    console.error(`\nPreflight failed for ${target}:`);
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }
  console.log(`Preflight passed for ${target} (${config.name}).`);
}

function build() {
  process.env.NEXT_PUBLIC_APP_ENV = env.appEnv;
  process.env.NEXT_PUBLIC_SITE_URL = env.siteUrl;
  if (!env.allowTags) for (const name of TAG_VARS) process.env[name] = '';
  if (target !== 'local') {
    for (const file of BUNDLED_ENV_FILES) {
      if (fs.existsSync(file)) {
        console.error(`${file} exists. OpenNext would bundle its values into the Worker. Build in CI, or move it out first.`);
        process.exit(1);
      }
    }
  }
  run('npx', ['prisma', 'generate']);
  run('npx', ['opennextjs-cloudflare', 'build', ...envArgs]);
}

function migrate() {
  const where = target === 'local' ? '--local' : '--remote';
  run('npx', ['wrangler', 'd1', 'migrations', 'apply', 'DB', where, ...envArgs]);
}

if (command === 'preflight') await preflight();
if (command === 'build') build();
if (command === 'migrate') migrate();
if (command === 'ci') {
  if (!process.env.WORKERS_CI) {
    console.error('"ci" is for Cloudflare Workers Builds. Use "deploy" elsewhere.');
    process.exit(1);
  }
  await preflight();
  build();
  migrate();
}
if (command === 'deploy' || command === 'upload') {
  await preflight();
  build();
  migrate();
  // deploy moves all traffic to the new version. upload only creates the version, so it
  // can be checked on its preview first and promoted with `wrangler versions deploy`.
  run('npx', ['opennextjs-cloudflare', command, ...envArgs]);
}
