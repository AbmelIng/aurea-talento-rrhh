const value = process.env.AUREA_API_ORIGIN?.trim();
if (!value) {
  throw new Error('Configura AUREA_API_ORIGIN con el origen HTTPS público de NestJS en Vercel.');
}

let apiUrl;
try {
  apiUrl = new URL(value);
} catch {
  throw new Error('AUREA_API_ORIGIN debe ser una URL HTTPS válida.');
}
if (apiUrl.protocol !== 'https:' || apiUrl.username || apiUrl.password || apiUrl.pathname !== '/' || apiUrl.search || apiUrl.hash) {
  throw new Error('AUREA_API_ORIGIN debe contener solo el origen HTTPS, sin /api, ruta, credenciales ni parámetros.');
}

export const config = {
  buildCommand: 'npm run build',
  outputDirectory: 'dist/aurea-talento-web/browser',
  rewrites: [
    { source: '/api/:path*', destination: `${apiUrl.origin}/api/:path*` },
    { source: '/(.*)', destination: '/index.html' },
  ],
  headers: [
    { source: '/api/:path*', headers: [{ key: 'Cache-Control', value: 'private, no-store' }] },
  ],
};
