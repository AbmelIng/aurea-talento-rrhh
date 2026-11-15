import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Vercel dirige la API al backend configurado y conserva las rutas Angular', async () => {
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  assert.equal(config.outputDirectory, 'dist/aurea-talento-web/browser');
  assert.deepEqual(config.routes, [
    {
      src: '/api/(.*)',
      dest: '${AUREA_API_ORIGIN}/api/$1',
      env: ['AUREA_API_ORIGIN'],
      headers: { 'cache-control': 'private, no-store' },
    },
    { handle: 'filesystem' },
    { src: '/.*', dest: '/index.html' },
  ]);
});
