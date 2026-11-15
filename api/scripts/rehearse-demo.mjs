import assert from 'node:assert/strict';
import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';

const dataDir = resolve('data');
const databaseFile = join(dataDir, 'aurea-demo.sqlite');
const credentialsFile = join(dataDir, 'demo-credentials.json');
const secretFile = join(dataDir, 'demo-secret.txt');
for (const file of [databaseFile, credentialsFile, secretFile]) {
  if (!existsSync(file)) throw new Error(`Primero ejecuta npm run demo:seed. Falta ${file}`);
}
const credentials = JSON.parse(readFileSync(credentialsFile, 'utf8'));
const secret = readFileSync(secretFile, 'utf8').trim();
const scratch = mkdtempSync(join(tmpdir(), 'aurea-demo-rehearsal-'));
const databaseCopy = join(scratch, 'rehearsal.sqlite');
copyFileSync(databaseFile, databaseCopy);
const port = await new Promise((resolvePort, reject) => {
  const server = createServer();
  server.once('error', reject);
  server.listen(0, '127.0.0.1', () => {
    const address = server.address();
    server.close(() => resolvePort(address.port));
  });
});
const base = `http://127.0.0.1:${port}/api`;
const api = spawn(process.execPath, ['dist/main.js'], {
  cwd: process.cwd(),
  env: { ...process.env, NODE_ENV: 'development', DB_DRIVER: 'sqlite', SQLITE_FILE: databaseCopy,
    APP_SECRET: secret, HOST: '127.0.0.1', PORT: String(port), WEB_ORIGIN: 'http://localhost:4201' },
  stdio: ['ignore', 'ignore', 'pipe'],
});
let serverErrors = '';
api.stderr.on('data', chunk => { serverErrors += chunk.toString().slice(0, 1000); });

const request = async (method, path, token, body, expected = 200) => {
  const response = await fetch(base + path, {
    method,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json();
  assert.equal(response.status, expected, `${method} ${path}: ${JSON.stringify(data)}`);
  return data;
};

const checks = [];
try {
  let healthy = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    if (api.exitCode !== null) throw new Error(`La API terminó antes de iniciar: ${serverErrors}`);
    try {
      const response = await fetch(base + '/health');
      if (response.ok) { healthy = true; break; }
    } catch { /* Esperar el inicio. */ }
    await new Promise(resolveDelay => setTimeout(resolveDelay, 250));
  }
  assert.ok(healthy, `La API no respondió: ${serverErrors}`);
  checks.push('API local y base aislada');

  const tokens = {};
  for (const account of credentials) {
    const login = await request('POST', '/auth/login', null,
      { email: account.email, password: account.password }, 201);
    assert.equal(login.user.role, account.role);
    assert.ok(login.token);
    tokens[account.role] = login.token;
    await request('GET', '/employees/me', login.token);
  }
  checks.push('Inicio de sesión y expediente propio de los ocho roles');

  const employees = await request('GET', '/employees', tokens.ADMIN);
  assert.equal(employees.length, credentials.length);
  await request('GET', '/settings/form-options', tokens.HR_ADMIN);
  await request('GET', '/settings/catalogs', tokens.EMPLOYEE, undefined, 403);
  checks.push('Directorio, catálogos y rechazo de acceso no autorizado');

  const ownEngagements = await request('GET', '/engagements', tokens.EMPLOYEE);
  const managedEngagements = await request('GET', '/engagements', tokens.MANAGER);
  const unrelatedEngagements = await request('GET', '/engagements', tokens.LEGAL);
  assert.equal(ownEngagements.length, 1);
  assert.equal(managedEngagements.length, 1);
  assert.equal(unrelatedEngagements.length, 0);
  checks.push('Cliente y encargo visibles solo a participantes y responsable');

  const periods = await request('GET', '/payroll/periods', tokens.PAYROLL);
  assert.equal(periods.length, 1);
  const period = periods[0];
  const entry = await request('POST', '/payroll/time-entry', tokens.EMPLOYEE, {
    period_id: period.id, work_date: period.start_date, hours: 8,
    engagement_id: ownEngagements[0].id, note: 'Trabajo de demostración',
  }, 201);
  assert.ok(entry);
  await request('POST', '/payroll/timesheet/submit', tokens.EMPLOYEE,
    { period_id: period.id }, 201);
  const queue = await request('GET', '/payroll/review', tokens.MANAGER);
  assert.equal(queue.length, 1);
  await request('PATCH', `/payroll/timesheets/${queue[0].id}/review`, tokens.MANAGER,
    { approve: true });
  checks.push('Horas asociadas al encargo, envío y aprobación del gerente');

  const run = await request('POST', `/payroll/runs/${period.id}/generate`, tokens.PAYROLL, {}, 201);
  assert.equal(run.items.length, credentials.length);
  await request('POST', `/payroll/runs/${period.id}/submit`, tokens.PAYROLL, {}, 201);
  await request('POST', `/payroll/runs/${period.id}/approve`, tokens.ADMIN, { approve: true }, 201);
  await request('POST', `/payroll/runs/${period.id}/publish`, tokens.PAYROLL, {}, 201);
  const receipts = await request('GET', '/payroll/receipts', tokens.EMPLOYEE);
  assert.ok(receipts.length > 0);
  checks.push('Borradores, revisión separada, publicación y recibo del empleado');

  const result = { date: new Date().toISOString(), passed: checks.length, checks, note: 'La prueba usó una copia temporal de SQLite; no tocó producción ni modificó la base de demostración.' };
  writeFileSync(join(dataDir, 'demo-rehearsal-result.json'), JSON.stringify(result, null, 2) + '\n');
  for (const check of checks) console.log(`OK: ${check}`);
} finally {
  api.kill();
  await new Promise(resolveExit => {
    if (api.exitCode !== null) resolveExit();
    else { api.once('exit', resolveExit); setTimeout(resolveExit, 5000); }
  });
  rmSync(scratch, { recursive: true, force: true });
}
