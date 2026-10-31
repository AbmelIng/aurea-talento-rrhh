import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('instalación vacía, administrador inicial, catálogos, códigos y acceso', async () => {
  const folder=mkdtempSync(join(tmpdir(),'aurea-prod-test-'));
  const port=34000+Math.floor(Math.random()*20000);
  const base=`http://127.0.0.1:${port}/api`;
  const env={...process.env,PORT:String(port),SQLITE_FILE:join(folder,'test.sqlite'),APP_SECRET:'integration-test-secret-at-least-32-characters',BOOTSTRAP_EMAIL:'admin@empresa.example',BOOTSTRAP_FIRST_NAME:'Ada',BOOTSTRAP_LAST_NAME:'Prueba'};
  let server;
  const start=async()=>{
    server=spawn(process.execPath,['dist/main.js'],{cwd:process.cwd(),env,stdio:'ignore'});
    for(let i=0;i<100;i++) {
      if(server.exitCode!==null) throw new Error('La API terminó antes de iniciar');
      try { await fetch(`${base}/auth/me`); return; } catch { await new Promise(resolve=>setTimeout(resolve,100)); }
    }
    throw new Error('La API no inició');
  };
  const stop=async()=>{ if(server?.exitCode===null){server.kill();await new Promise(resolve=>server.once('exit',resolve));} };
  const request=async(path,method='GET',token='',body)=>{
    const response=await fetch(`${base}${path}`,{method,headers:{...(token?{Authorization:`Bearer ${token}`} : {}),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
    return {status:response.status,data:await response.json()};
  };
  try {
    await start();
    assert.equal((await request('/auth/login','POST','',{email:'admin@empresa.example',password:'anything'})).status,401);
    await stop();
    const bootstrap=spawnSync(process.execPath,['dist/bootstrap-admin.js'],{cwd:process.cwd(),env,encoding:'utf8'});
    assert.equal(bootstrap.status,0,bootstrap.stderr);
    const password=/Contraseña inicial \(guardar ahora\): (\S+)/.exec(bootstrap.stdout)?.[1];
    assert.ok(password && password.length>=24);
    const second=spawnSync(process.execPath,['dist/bootstrap-admin.js'],{cwd:process.cwd(),env,encoding:'utf8'});
    assert.notEqual(second.status,0,'No se puede ejecutar dos veces');
    await start();
    const login=await request('/auth/login','POST','',{email:'admin@empresa.example',password});
    assert.equal(login.status,201);
    const admin=login.data.token;
    assert.equal((await request('/employees','GET',admin)).data.length,1);
    assert.equal((await request('/payroll/periods','GET',admin)).data.length,0);
    assert.equal((await request('/settings/catalogs')).status,401);
    const categories=['job_title','area','service_line','office','employment_type'];
    const names=['Auditor','Auditoría','Servicios profesionales','Guatemala','Plazo indefinido'];
    const ids={};
    for(let i=0;i<categories.length;i++) {
      const result=await request(`/settings/catalogs/${categories[i]}`,'POST',admin,{name:names[i]});
      assert.equal(result.status,201);
      ids[`${categories[i]}_id`]=result.data.id;
    }
    const invalid=await request('/employees','POST',admin,{first_name:'Luz',last_name:'Nueva',work_email:'luz@empresa.example',hire_date:'2026-11-01',...ids,job_title_id:999});
    assert.equal(invalid.status,400);
    const create=async(email)=>request('/employees','POST',admin,{first_name:'Luz',last_name:'Nueva',work_email:email,hire_date:'2026-11-01',...ids});
    const [first,secondEmployee]=await Promise.all([create('luz@empresa.example'),create('sol@empresa.example')]);
    assert.equal(first.status,201,JSON.stringify(first.data));
    assert.equal(secondEmployee.status,201,JSON.stringify(secondEmployee.data));
    assert.notEqual(first.data.employee.code,secondEmployee.data.employee.code);
    assert.equal((await request('/settings/employee-codes','GET',admin)).data.next_number,3);
    const history=await request(`/employees/${first.data.employee.id}/history`,'GET',admin);
    assert.equal(history.data.length,1,'El alta registra su historia laboral');
    assert.equal(history.data[0].job_title,'Auditor');
    assert.equal((await request(`/settings/catalogs/${ids.job_title_id}`,'PATCH',admin,{name:'Auditor financiero'})).status,200);
    assert.equal((await request(`/employees/${first.data.employee.id}`,'GET',admin)).data.job_title,'Auditor financiero');
    assert.equal((await request(`/employees/${first.data.employee.id}/history`,'GET',admin)).data[0].job_title,'Auditor','El historial conserva el nombre anterior');
    const disabled=await request(`/settings/catalogs/${ids.job_title_id}`,'PATCH',admin,{active:false});
    assert.equal(disabled.status,200);
    assert.equal((await create('tercera@empresa.example')).status,400);
    const code=await request('/settings/employee-codes','PATCH',admin,{prefix:'RRHH-D1',separator:'-',digits:5,next_number:3});
    assert.equal(code.status,200);
    assert.equal((await request('/settings/employee-codes','PATCH',admin,{prefix:'EMP',separator:'-',digits:4,next_number:1})).status,400);
    assert.equal((await request(`/settings/catalogs/${ids.job_title_id}`,'PATCH',admin,{active:true})).status,200);
    const third=await create('tercera@empresa.example');
    assert.equal(third.status,201);
    assert.equal(third.data.employee.code,'RRHH-D1-00003');
    assert.equal((await request(`/employees/${first.data.employee.id}/role`,'PATCH',admin,{role:'PAYROLL'})).status,200);
    const payrollLogin=await request('/auth/login','POST','',{email:'luz@empresa.example',password:first.data.temporaryPassword});
    assert.equal(payrollLogin.status,201);
    const payroll=payrollLogin.data.token;
    const period=await request('/payroll/periods','POST',payroll,{label:'Noviembre 2026',start_date:'2026-11-01',end_date:'2026-11-15',submit_deadline:'2026-11-15',pay_date:'2026-11-20'});
    assert.equal(period.status,201);
    const receipt=await request('/payroll/receipts','POST',payroll,{period_id:period.data.id,employee_id:secondEmployee.data.employee.id,gross:5000,taxes:100,deductions:200,source_note:'Carga de control interno'});
    assert.equal(receipt.status,201,JSON.stringify(receipt.data));
    assert.equal((await request(`/payroll/receipts/${receipt.data.id}/publish`,'PATCH',payroll,{})).status,200);
    const employeeLogin=await request('/auth/login','POST','',{email:'sol@empresa.example',password:secondEmployee.data.temporaryPassword});
    assert.equal(employeeLogin.status,201);
    assert.equal((await request('/payroll/receipts','GET',employeeLogin.data.token)).data.length,1);
    assert.equal((await request('/payroll/receipts','GET',admin)).data.length,0);
    assert.equal((await request('/settings/catalogs','GET',employeeLogin.data.token)).status,403);
    assert.equal((await request(`/employees/${secondEmployee.data.employee.id}/catalog-permission`,'PATCH',admin,{enabled:true})).status,200);
    assert.equal((await request('/settings/catalogs','GET',employeeLogin.data.token)).status,200);
    assert.equal((await request('/settings/employee-codes','GET',employeeLogin.data.token)).status,403);
    assert.equal((await request('/auth/password','POST',admin,{current:password,next:'NuevaClaveSegura2026!'})).status,201);
    assert.equal((await request('/employees/me','GET',admin)).status,401);
    assert.equal((await request('/auth/login','POST','',{email:'admin@empresa.example',password:'NuevaClaveSegura2026!'})).status,201);
  } finally { await stop(); rmSync(folder,{recursive:true,force:true}); }
});
