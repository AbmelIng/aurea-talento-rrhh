import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseService } from '../dist/database.js';
import { EngagementService } from '../dist/engagement.service.js';
import { PayrollService } from '../dist/payroll.service.js';

test('clientes, asignaciones, permisos y horas por encargo', async()=>{
  const folder=mkdtempSync(join(tmpdir(),'aurea-engagements-'));
  process.env.SQLITE_FILE=join(folder,'test.sqlite');
  const db=new DatabaseService();
  try {
    await db.initialize();
    const employee=async(code,managerId=null)=>db.run('INSERT INTO employees (code,first_name,last_name,work_email,hire_date,job_title,area,office,employment_type,status,manager_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)',[code,code,'Prueba',`${code.toLowerCase()}@example.test`,'2026-01-01','Auditor','Auditoría','Guatemala','Indefinido','Activo',managerId]);
    const adminId=await employee('ADMIN');const managerId=await employee('MANAGER');const workerId=await employee('WORKER');const outsiderId=await employee('OUTSIDER');
    const user=async(id,role)=>({id:await db.run('INSERT INTO users (employee_id,email,password_hash,role) VALUES (?,?,?,?)',[id,`${role.toLowerCase()}${id}@example.test`,'x',role]),employee_id:id,role});
    const admin=await user(adminId,'ADMIN');const manager=await user(managerId,'MANAGER');const worker=await user(workerId,'EMPLOYEE');const outsider=await user(outsiderId,'EMPLOYEE');
    const engagements=new EngagementService(db);const payroll=new PayrollService(db,engagements);
    const client=await engagements.saveClient(admin,{code:'ACME',name:'Acme, S. A.',tax_id:'1234',address:'Ciudad de Guatemala',offices:'Sede central',contact_name:'Contacto',phone:'5555-0000',email:'contacto@example.test'});
    assert.equal(client.code,'ACME');
    await assert.rejects(()=>engagements.clients(worker),/Solo administración/);
    const engagement=await engagements.saveEngagement(admin,{client_id:client.id,name:'Auditoría anual',audit_type:'Financiera',fiscal_period:'2026',start_date:'2026-11-01',end_date:'2026-11-15',location:'Presencial',partner_id:adminId,manager_id:managerId,status:'Activo'});
    await assert.rejects(()=>engagements.detail(outsider,engagement.id),/No participas/);
    await engagements.assign(admin,engagement.id,{employee_id:workerId,team_role:'Auditor',start_date:'2026-11-01',end_date:'2026-11-15',planned_hours:80,arrival_instructions:'Reportarse en recepción'});
    assert.equal((await engagements.list(worker)).length,1);
    assert.equal((await engagements.list(outsider)).length,0);
    assert.equal((await engagements.detail(manager,engagement.id)).team[0].planned_hours,80);
    const period=await db.run('INSERT INTO payroll_periods (label,start_date,end_date,submit_deadline,pay_date,status,created_by,updated_at) VALUES (?,?,?,?,?,?,?,?)',['Noviembre','2026-11-01','2026-11-15','2026-11-15','2026-11-20','Abierto',admin.id,new Date().toISOString()]);
    await assert.rejects(()=>payroll.saveEntry(worker,{period_id:period,work_date:'2026-11-03',hours:8}),/Selecciona el engagement/);
    await assert.rejects(()=>payroll.saveEntry(outsider,{period_id:period,work_date:'2026-11-03',hours:8,engagement_id:engagement.id}),/No participas/);
    const sheet=await payroll.saveEntry(worker,{period_id:period,work_date:'2026-11-03',hours:8,engagement_id:engagement.id});
    assert.equal(sheet.entries[0].engagement_name,'Auditoría anual');
    assert.equal(Number((await engagements.detail(manager,engagement.id)).team[0].registered_hours),8);
    await payroll.submit(worker,period);
    assert.equal((await payroll.reviewQueue(manager)).length,1);
    await payroll.review(manager,Number(sheet.sheet.id),true);
    assert.equal(Number((await engagements.detail(manager,engagement.id)).team[0].approved_hours),8);
    await engagements.unassign(admin,engagement.id,workerId);
    await assert.rejects(()=>engagements.detail(worker,engagement.id),/No participas/);
    assert.equal((await db.all('SELECT id FROM audit_logs WHERE action=?',['RETIRAR_ASIGNACION'])).length,1);
  } finally {await db.onModuleDestroy();rmSync(folder,{recursive:true,force:true});}
});
