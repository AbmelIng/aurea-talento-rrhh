import { randomBytes } from 'node:crypto';
import { DatabaseService, hashPassword } from './database';

async function main():Promise<void> {
  const email=(process.env.BOOTSTRAP_EMAIL||'').trim().toLowerCase();
  const first=(process.env.BOOTSTRAP_FIRST_NAME||'').trim();
  const last=(process.env.BOOTSTRAP_LAST_NAME||'').trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!first||!last||first.length>100||last.length>100)
    throw new Error('Define BOOTSTRAP_EMAIL, BOOTSTRAP_FIRST_NAME y BOOTSTRAP_LAST_NAME válidos');
  if(!process.env.APP_SECRET||process.env.APP_SECRET.length<32) throw new Error('Define APP_SECRET estable de al menos 32 caracteres');
  const db=new DatabaseService();
  try {
    await db.initialize();
    const password=randomBytes(24).toString('base64url');
    await db.transaction(async tx=>{
      // La fila de configuración existe en una instalación vacía y serializa dos intentos simultáneos.
      await tx.get('SELECT id FROM employee_code_config WHERE id=1'+(process.env.DB_DRIVER==='mysql'?' FOR UPDATE':''));
      const users=await tx.get<{n:number}>('SELECT COUNT(*) AS n FROM users');
      const employees=await tx.get<{n:number}>('SELECT COUNT(*) AS n FROM employees');
      if(Number(users?.n)||Number(employees?.n)) throw new Error('La instalación ya contiene cuentas o empleados; inicialización bloqueada');
      const code='ADMIN-0001';
      const employeeId=await tx.run(
        `INSERT INTO employees (code,first_name,last_name,work_email,hire_date,job_title,area,office,employment_type,status) VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [code,first,last,email,new Date().toISOString().slice(0,10),'Administrador del sistema','Administración','Sede principal','Plazo indefinido','Activo']);
      await tx.run('INSERT INTO users (employee_id,email,password_hash,role) VALUES (?,?,?,?)',[employeeId,email,hashPassword(password),'ADMIN']);
    });
    process.stdout.write(`Administrador inicial creado: ${email}\nContraseña inicial (guardar ahora): ${password}\n`);
  } finally { await db.onModuleDestroy(); }
}
main().catch(error=>{ process.stderr.write(`${error instanceof Error?error.message:String(error)}\n`); process.exitCode=1; });
