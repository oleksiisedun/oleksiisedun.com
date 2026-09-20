import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SCRIPT = new URL('../scripts/check-sw.mjs', import.meta.url).pathname;

/**
 * Builds a minimal valid site (index, manifest, one js/css/commands file, sw.js) in a fresh temp dir.
 * The script resolves its root from its own location, so a copy of it is placed inside the fixture.
 * @returns {string} Path of the fixture root.
 */
const makeFixture = () => {
  const root = mkdtempSync(join(tmpdir(), 'check-sw-'));
  for (const dir of ['scripts', 'js', 'css', 'commands', 'icons']) mkdirSync(join(root, dir));
  cpSync(SCRIPT, join(root, 'scripts/check-sw.mjs'));
  writeFileSync(join(root, 'package.json'), '{"type":"module"}');
  writeFileSync(join(root, 'index.html'), '<link href="css/a.css"><script src="js/a.js"></script>');
  writeFileSync(join(root, 'manifest.json'), '{"icons":[{"src":"/icons/i.png"}]}');
  writeFileSync(join(root, 'js/a.js'), '');
  writeFileSync(join(root, 'js/config.js'), "export const ANALYTICS_ENDPOINT = 'https://api.example.dev/';");
  writeFileSync(join(root, 'css/a.css'), '');
  writeFileSync(join(root, 'commands/help.txt'), '');
  writeFileSync(join(root, 'icons/i.png'), '');
  writeSw(root);
  return root;
};

/**
 * Writes the fixture's sw.js, precaching every fixture shell file except those in `omit`, plus any `extra` paths.
 * @param {string} root - Fixture root.
 * @param {{ omit?: string[], extra?: string[], host?: string }} [options]
 * @returns {void}
 */
const writeSw = (root, { omit = [], extra = [], host = 'api.example.dev' } = {}) => {
  const assets = [
    '/',
    '/index.html',
    '/manifest.json',
    '/js/a.js',
    '/js/config.js',
    '/css/a.css',
    '/commands/help.txt',
    '/icons/i.png',
  ]
    .filter((a) => !omit.includes(a))
    .concat(extra);
  writeFileSync(
    join(root, 'sw.js'),
    `const CACHE_NAME = 'v1';\nconst CORE_ASSETS = [\n${assets.map((a) => `  '${a}',`).join('\n')}\n];\n` +
      `const NETWORK_ONLY_HOSTS = ['${host}'];\n`,
  );
};

/**
 * Runs the fixture's copy of check-sw.mjs.
 * @param {string} root - Fixture root.
 * @returns {import('node:child_process').SpawnSyncReturns<string>}
 */
const runCheck = (root) => spawnSync('node', [join(root, 'scripts/check-sw.mjs')], { encoding: 'utf8' });

describe('check-sw.mjs', () => {
  /** @type {string} */
  let root;

  before(() => {
    root = makeFixture();
  });
  after(() => rmSync(root, { recursive: true, force: true }));

  it('passes for a consistent service worker', () => {
    writeSw(root);
    const result = runCheck(root);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /check-sw: OK/);
  });

  it('fails when a shell file is missing from CORE_ASSETS', () => {
    writeSw(root, { omit: ['/js/a.js'] });
    const result = runCheck(root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /missing \/js\/a\.js/);
  });

  it('fails when an asset referenced by the manifest is not precached', () => {
    writeSw(root, { omit: ['/icons/i.png'] });
    const result = runCheck(root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /missing \/icons\/i\.png/);
  });

  it('fails when CORE_ASSETS lists a file that does not exist', () => {
    writeSw(root, { extra: ['/js/gone.js'] });
    const result = runCheck(root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /\/js\/gone\.js, which does not exist/);
  });

  it('fails when the analytics host drifts from config.js', () => {
    writeSw(root, { host: 'old.example.dev' });
    const result = runCheck(root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /NETWORK_ONLY_HOSTS does not include api\.example\.dev/);
  });
});
