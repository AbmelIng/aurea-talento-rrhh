import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('recorrido local de los sprints 1 y 2 con permisos por rol', async () => {
  const folder = mkdtempSync(join(tmpdir(), 'aurea-test-'));
  const port = 34000 + Math.floor(Math.random() * 20000);
  const base = `http://127.0.0.1:${port}/api`;
  const server = spawn(process.execPath, ['dist/main.js'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port), SQLITE_FILE: join(folder, 'test.sqlite') },
    stdio: 'ignore',
  });
  async function request(path, method = 'GET', token = '', body) {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    return { status: response.status, data: await response.json() };
  }
  async function login(email) {
    const result = await request('/auth/login', 'POST', '', { email, password: 'Demo2026!' });
    assert.equal(result.status, 201);
    return result.data.token;
  }
  try {
    let ready = false;
    for (let attempt = 0; attempt < 80; attempt++) {
      if (server.exitCode !== null) throw new Error('La API terminó antes de iniciar');
      try { await fetch(`${base}/auth/me`); ready = true; break; } catch { await new Promise(resolve => setTimeout(resolve, 100)); }
    }
    assert.equal(ready, true, 'La API debe iniciar');

    const employee = await login('ana@demo.local');
    assert.equal((await request('/employees/me', 'GET', employee)).data.first_name, 'Ana');
    assert.equal((await request('/employees', 'GET', employee)).status, 403);
    assert.equal((await request('/employees/5', 'GET', employee)).status, 403);
    assert.equal((await request('/employees/me', 'PATCH', employee, { phone: '+502 5555-0999' })).status, 200);
    const change = await request('/change-requests', 'POST', employee, { field: 'first_name', proposed_value: 'Anita' });
    assert.equal(change.status, 201);

    const manager = await login('carlos@demo.local');
    const team = await request('/employees', 'GET', manager);
    assert.equal(team.status, 200);
    assert.equal(team.data.length, 2);
    assert.equal((await request('/employees/6', 'GET', manager)).status, 403);
    assert.equal((await request('/employees/4', 'GET', manager)).data.dpi, undefined);

    const hr = await login('maria@demo.local');
    assert.equal((await request(`/change-requests/${change.data.id}`, 'PATCH', hr, { approve: true })).status, 200);
    assert.equal((await request('/employees/4', 'GET', hr)).data.first_name, 'Anita');
    const unique = Date.now().toString(36);
    const created = await request('/employees', 'POST', hr, {
      code: `T-${unique}`, first_name: 'Prueba', last_name: 'Local', work_email: `prueba-${unique}@demo.local`,
      hire_date: '2026-10-30', job_title: 'Auditor junior', area: 'Auditoría externa',
      office: 'Ciudad de Guatemala', manager_id: 3,
    });
    assert.equal(created.status, 201);
    assert.ok(created.data.temporaryPassword);
    const id = created.data.employee.id;
    assert.equal((await request(`/employees/${id}`, 'PATCH', hr, { job_title: 'Auditor senior' })).status, 200);
    assert.equal((await request(`/employees/${id}/history`, 'GET', hr)).data.length, 2);

    const admin = await login('valeria@demo.local');
    assert.equal((await request('/settings/access-levels', 'GET', admin)).status, 200);
    assert.equal((await request(`/employees/${id}/role`, 'PATCH', admin, { role: 'MANAGER' })).status, 200);
    assert.equal((await request('/employees/1/role', 'PATCH', admin, { role: 'EMPLOYEE' })).status, 409);
    assert.equal((await request('/settings/account', 'GET', hr)).status, 403);
  } finally {
    if (server.exitCode === null) {
      server.kill();
      await new Promise(resolve => server.once('exit', resolve));
    }
    if (folder.startsWith(tmpdir())) rmSync(folder, { recursive: true, force: true });
  }
});
