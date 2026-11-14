import { test } from 'node:test';
import assert from 'node:assert/strict';

test('Vercel envía /api al backend HTTPS y conserva las rutas Angular', async () => {
  process.env.AUREA_API_ORIGIN = 'https://api.example.test';
  const { config } = await import('../vercel.mjs?valid');
  assert.equal(config.outputDirectory, 'dist/aurea-talento-web/browser');
  assert.deepEqual(config.rewrites, [
    { source: '/api/:path*', destination: 'https://api.example.test/api/:path*' },
    { source: '/(.*)', destination: '/index.html' },
  ]);
  assert.deepEqual(config.headers, [
    { source: '/api/:path*', headers: [{ key: 'Cache-Control', value: 'private, no-store' }] },
  ]);
});

test('Vercel rechaza un backend sin HTTPS o con ruta /api duplicada', async () => {
  process.env.AUREA_API_ORIGIN = 'http://api.example.test';
  await assert.rejects(import('../vercel.mjs?http'), /origen HTTPS/);
  process.env.AUREA_API_ORIGIN = 'https://api.example.test/api';
  await assert.rejects(import('../vercel.mjs?path'), /sin \/api/);
  delete process.env.AUREA_API_ORIGIN;
  await assert.rejects(import('../vercel.mjs?missing'), /Configura AUREA_API_ORIGIN/);
});
