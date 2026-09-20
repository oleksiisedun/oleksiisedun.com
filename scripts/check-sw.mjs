#!/usr/bin/env node
// Guards the service worker invariants that are easy to break silently:
//  1. every shell file (under src/) (js/css/commands + assets index.html and the manifest reference) is precached,
//  2. sw.js's hardcoded analytics host matches ANALYTICS_ENDPOINT in js/config.js,
//  3. CACHE_NAME is bumped whenever a precached file changes vs. a base git ref.
//
// Usage: node scripts/check-sw.mjs [baseRef]   (baseRef defaults to HEAD, i.e. uncommitted changes)

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname;
const SITE_DIR = 'src';
const SITE = join(ROOT, SITE_DIR);
const errors = [];

/**
 * Extracts the string literals of a top-level `const NAME = [ ... ];` array in sw.js source.
 * @param {string} source - Contents of sw.js.
 * @param {string} name - The constant's name.
 * @returns {string[]} The array's string entries.
 */
const readArrayConst = (source, name) => {
  const match = source.match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\];`));
  if (!match) throw new Error(`Could not find "const ${name} = [...]" in sw.js`);
  return [...match[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
};

/**
 * Reads the CACHE_NAME constant from sw.js source.
 * @param {string} source - Contents of sw.js.
 * @returns {string|undefined} The cache name, or undefined if not found.
 */
const readCacheName = (source) => source.match(/const CACHE_NAME = '([^']+)'/)?.[1];

/**
 * Lists files in a directory (non-recursive) as root-relative URL paths, e.g. `/js/config.js`.
 * @param {string} dir - Directory relative to the site root (`src/`).
 * @param {string} ext - File extension to include, e.g. `.js`.
 * @returns {string[]} URL paths.
 */
const listShellFiles = (dir, ext) =>
  readdirSync(join(SITE, dir))
    .filter((f) => f.endsWith(ext))
    .map((f) => `/${dir}/${f}`);

/**
 * Collects same-origin URLs referenced by index.html (`href`/`src`) and the manifest icons.
 * @returns {string[]} URL paths.
 */
const listReferencedAssets = () => {
  const html = readFileSync(join(SITE, 'index.html'), 'utf8');
  const fromHtml = [...html.matchAll(/(?:href|src)="(?!https?:|mailto:|#)([^"#?]+)"/g)].map((m) =>
    m[1].startsWith('/') ? m[1] : `/${m[1]}`,
  );
  const manifest = JSON.parse(readFileSync(join(SITE, 'manifest.json'), 'utf8'));
  const fromManifest = (manifest.icons ?? []).map((icon) => `/${icon.src.replace(/^\.?\//, '')}`);
  return [...fromHtml, ...fromManifest];
};

const swSource = readFileSync(join(SITE, 'sw.js'), 'utf8');
const coreAssets = new Set(readArrayConst(swSource, 'CORE_ASSETS'));

// 1. Precache completeness
const expected = [
  '/',
  '/index.html',
  '/manifest.json',
  ...listShellFiles('js', '.js'),
  ...listShellFiles('css', '.css'),
  ...listShellFiles('commands', '.txt'),
  ...listReferencedAssets(),
];
for (const path of new Set(expected)) {
  if (!coreAssets.has(path)) errors.push(`sw.js CORE_ASSETS is missing ${path}`);
}
for (const path of coreAssets) {
  if (path !== '/' && !existsSync(join(SITE, path)))
    errors.push(`sw.js CORE_ASSETS lists ${path}, which does not exist`);
}

// 2. Analytics host in sync with config.js
const { ANALYTICS_ENDPOINT } = await import(pathToFileURL(join(SITE, 'js/config.js')).href);
const configHost = new URL(ANALYTICS_ENDPOINT).hostname;
if (!readArrayConst(swSource, 'NETWORK_ONLY_HOSTS').includes(configHost)) {
  errors.push(`sw.js NETWORK_ONLY_HOSTS does not include ${configHost} (ANALYTICS_ENDPOINT in js/config.js)`);
}

// 3. CACHE_NAME bumped when a precached file changed
const baseRef = process.argv[2] ?? 'HEAD';
try {
  const changed = execFileSync('git', ['diff', '--name-only', `--relative=${SITE_DIR}`, baseRef], {
    cwd: ROOT,
    encoding: 'utf8',
  })
    .split('\n')
    .filter(Boolean);
  const changedShell = changed.filter((f) => f !== 'sw.js' && coreAssets.has(`/${f}`));
  if (changedShell.length > 0) {
    const baseSw = execFileSync('git', ['show', `${baseRef}:${SITE_DIR}/sw.js`], { cwd: ROOT, encoding: 'utf8' });
    if (readCacheName(baseSw) === readCacheName(swSource)) {
      errors.push(
        `CACHE_NAME "${readCacheName(swSource)}" not bumped, but precached files changed vs ${baseRef}: ${changedShell.join(', ')}`,
      );
    }
  }
} catch {
  console.warn(`check-sw: could not diff against "${baseRef}"; skipping the CACHE_NAME bump check`);
}

if (errors.length > 0) {
  console.error(errors.map((e) => `✖ ${e}`).join('\n'));
  process.exit(1);
}
console.log('check-sw: OK');
