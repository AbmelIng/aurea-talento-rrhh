import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseService } from '../dist/database.js';
import { EngagementService } from '../dist/engagement.service.js';
import { PayrollService } from '../dist/payroll.service.js';
import { PayrollCalculationService } from '../dist/payroll-calculation.service.js';

test('MySQL: migraciones, encargo, hoja de tiempo y cálculo de nómina', async () => {
  assert.equal(process.env.DB_DRIVER, 'mysql', 'Esta prueba requiere DB_DRIVER=mysql');
  let db = new DatabaseService();
  try {
    await db.initialize();
    assert.equal(db.isMysql, true);
    assert.deepEqual((await db.all('SELECT version FROM schema_migrations ORDER BY version')).map(r => Number(r.version)), [1, 2, 3, 4, 5, 6, 7]);
    assert.equal(Number((await db.get('SELECT COUNT(*) AS total FROM employees')).total), 0, 'Instalación sin empleados ficticios');

    const employee = (code, status = 'Activo') => db.run(
      'INSERT INTO employees (code,first_name,last_name,work_email,hire_date,job_title,area,office,employment_type,status) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [code, code, 'Prueba', `${code.toLowerCase()}@example.test`, '2026-11-01', 'Auditor', 'Auditoría', 'Guatemala', 'Indefinido', status]);
    const adminId = await employee('ADMIN');
    const payrollId = await employee('PAYROLL');
    const managerId = await employee('MANAGER');
    const workerId = await employee('WORKER');
    const user = async (employeeId, role) => ({
      id: await db.run('INSERT INTO users (employee_id,email,password_hash,role) VALUES (?,?,?,?)',
        [employeeId, `${role.toLowerCase()}@example.test`, 'test-only', role]), employee_id: employeeId, role,
    });
    const admin = await user(adminId, 'ADMIN');
    const payrollUser = await user(payrollId, 'PAYROLL');
    const manager = await user(managerId, 'MANAGER');
    const worker = await user(workerId, 'EMPLOYEE');
    const engagements = new EngagementService(db);
    const time = new PayrollService(db, engagements);
    const calculation = new PayrollCalculationService(db);

    const client = await engagements.saveClient(admin, { code: 'CLIENTE-1', name: 'Cliente de prueba', address: 'Guatemala' });
    const engagement = await engagements.saveEngagement(admin, {
      client_id: client.id, name: 'Auditoría anual', audit_type: 'Financiera', fiscal_period: '2026',
      start_date: '2026-11-01', end_date: '2026-11-15', location: 'Presencial',
      partner_id: adminId, manager_id: managerId, status: 'Activo',
    });
    await engagements.assign(admin, engagement.id, {
      employee_id: workerId, team_role: 'Auditor', start_date: '2026-11-01', end_date: '2026-11-15',
      planned_hours: 80, arrival_instructions: 'Reportarse en recepción',
    });
    assert.equal((await engagements.list(worker)).length, 1);
    const period = await db.run(
      'INSERT INTO payroll_periods (label,start_date,end_date,submit_deadline,pay_date,status,created_by,updated_at) VALUES (?,?,?,?,?,?,?,?)',
      ['Primera quincena', '2026-11-01', '2026-11-15', '2026-11-15', '2026-11-20', 'Abierto', payrollUser.id, new Date().toISOString()]);
    const sheet = await time.saveEntry(worker, { period_id: period, work_date: '2026-11-03', hours: 8, engagement_id: engagement.id });
    assert.equal(Number((await engagements.detail(manager, engagement.id)).team[0].registered_hours), 8);
    await time.submit(worker, period);
    assert.equal((await time.reviewQueue(manager)).length, 1);
    await time.review(manager, Number(sheet.sheet.id), true);

    for (const employeeId of [adminId, payrollId, managerId]) {
      await calculation.addCondition(payrollUser, { employee_id: employeeId, kind: 'SALARIO_MENSUAL', amount: 8000, effective_from: '2026-11-01' });
    }
    await calculation.addCondition(payrollUser, { employee_id: workerId, kind: 'TARIFA_HORA', amount: 100, effective_from: '2026-11-01' });
    const run = await calculation.generate(payrollUser, period);
    assert.equal(run.items.length, 4);
    assert.equal(Number(run.items.find(item => Number(item.employee_id) === workerId).base_amount), 800);
    await calculation.submit(payrollUser, period);
    await calculation.approve(admin, period, true);
    await calculation.publish(payrollUser, period);
    assert.equal((await calculation.run(admin, period)).status, 'Publicado');
    assert.equal(Number((await engagements.detail(manager, engagement.id)).team[0].approved_hours), 8);

    await db.onModuleDestroy();
    db = new DatabaseService();
    await db.initialize();
    assert.equal(Number((await db.get('SELECT COUNT(*) AS total FROM schema_migrations')).total), 7, 'Migraciones repetibles');
    assert.equal(Number((await db.get('SELECT COUNT(*) AS total FROM audit_clients')).total), 1, 'Los datos se conservan al reiniciar');
  } finally {
    await db.onModuleDestroy();
  }
});
