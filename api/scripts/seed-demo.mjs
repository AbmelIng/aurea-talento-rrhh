import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DatabaseService, hashPassword } from '../dist/database.js';

if (process.env.NODE_ENV === 'production' || process.env.DB_DRIVER === 'mysql') {
  throw new Error('La demostración solo se puede crear con SQLite fuera de producción.');
}

const dataDir = resolve('data');
const databaseFile = resolve(dataDir, 'aurea-demo.sqlite');
const credentialsFile = resolve(dataDir, 'demo-credentials.json');
const secretFile = resolve(dataDir, 'demo-secret.txt');
if ([databaseFile, credentialsFile, secretFile].some(existsSync)) {
  throw new Error('Ya existe una demostración local. No se sobrescribieron datos.');
}
mkdirSync(dataDir, { recursive: true });
process.env.DB_DRIVER = 'sqlite';
process.env.SQLITE_FILE = databaseFile;

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth();
const iso = date => date.toISOString().slice(0, 10);
const monthStart = iso(new Date(Date.UTC(year, month, 1)));
const monthEnd = iso(new Date(Date.UTC(year, month + 1, 0)));
const engagementEnd = iso(new Date(Date.UTC(year, month + 2, 0)));
const now = new Date().toISOString();
const people = [
  { role: 'ADMIN', first: 'Alicia', last: 'Administradora', position: 'Administradora del sistema' },
  { role: 'HR_ADMIN', first: 'Rosa', last: 'Recursos', position: 'Coordinadora de RR. HH.' },
  { role: 'PAYROLL', first: 'Pablo', last: 'Nómina', position: 'Analista de nómina' },
  { role: 'PARTNER', first: 'Sofía', last: 'Socia', position: 'Socia de auditoría' },
  { role: 'MANAGER', first: 'María', last: 'Gerente', position: 'Gerente de auditoría' },
  { role: 'EMPLOYEE', first: 'Elena', last: 'Auditora', position: 'Auditora' },
  { role: 'LEGAL', first: 'Luis', last: 'Legal', position: 'Asesor legal' },
  { role: 'COMPLIANCE', first: 'Carmen', last: 'Cumplimiento', position: 'Analista de cumplimiento' },
];

const db = new DatabaseService();
try {
  await db.initialize();
  const credentials = [];
  const ids = {};
  const userIds = {};
  for (let index = 0; index < people.length; index++) {
    const person = people[index];
    const email = `${person.role.toLowerCase()}@aurea-demo.example.test`;
    const employeeId = await db.run(
      'INSERT INTO employees (code,first_name,last_name,work_email,hire_date,job_title,area,service_line,office,employment_type,status,manager_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      [`DEM-${String(index + 1).padStart(4, '0')}`, person.first, person.last, email, monthStart,
        person.position, person.role === 'HR_ADMIN' ? 'Recursos Humanos' : 'Auditoría', 'Auditoría financiera',
        'Ciudad de Guatemala', 'Plazo indefinido', 'Activo', person.role === 'EMPLOYEE' ? ids.MANAGER : null],
    );
    const password = randomBytes(18).toString('base64url');
    const userId = await db.run('INSERT INTO users (employee_id,email,password_hash,role) VALUES (?,?,?,?)',
      [employeeId, email, hashPassword(password), person.role]);
    ids[person.role] = employeeId;
    userIds[person.role] = userId;
    credentials.push({ role: person.role, name: `${person.first} ${person.last}`, email, password });
  }

  const clientId = await db.run(
    'INSERT INTO audit_clients (code,name,tax_id,address,offices,contact_name,phone,email,active) VALUES (?,?,?,?,?,?,?,?,1)',
    ['CLI-DEMO', 'Comercial Ejemplo, S. A.', 'CF', 'Zona 10, Ciudad de Guatemala', 'Sede central',
      'Patricia Contacto', '5555-0101', 'contacto@example.test'],
  );
  const engagementId = await db.run(
    'INSERT INTO engagements (client_id,name,audit_type,fiscal_period,start_date,end_date,location,partner_id,manager_id,status) VALUES (?,?,?,?,?,?,?,?,?,?)',
    [clientId, 'Auditoría financiera de demostración', 'Financiera', String(year), monthStart, engagementEnd,
      'Presencial', ids.PARTNER, ids.MANAGER, 'Activo'],
  );
  await db.run(
    'INSERT INTO engagement_assignments (engagement_id,employee_id,team_role,start_date,end_date,planned_hours,arrival_instructions,created_by,created_at,active) VALUES (?,?,?,?,?,?,?,?,?,1)',
    [engagementId, ids.EMPLOYEE, 'Auditora', monthStart, engagementEnd, 80,
      'Presentarse en recepción y preguntar por Patricia Contacto.', userIds.ADMIN, now],
  );
  await db.run(
    'INSERT INTO payroll_periods (label,start_date,end_date,submit_deadline,pay_date,status,created_by,updated_at) VALUES (?,?,?,?,?,?,?,?)',
    [`Nómina de demostración ${year}-${String(month + 1).padStart(2, '0')}`, monthStart, monthEnd,
      monthEnd, monthEnd, 'Abierto', userIds.PAYROLL, now],
  );
  for (const person of people) {
    await db.run(
      'INSERT INTO pay_conditions (employee_id,kind,amount,daily_hours,effective_from,effective_to,created_by,created_at) VALUES (?,?,?,?,?,?,?,?)',
      [ids[person.role], person.role === 'EMPLOYEE' ? 'TARIFA_HORA' : 'SALARIO_MENSUAL',
        person.role === 'EMPLOYEE' ? 75 : 8000, 8, monthStart, null, userIds.PAYROLL, now],
    );
  }

  writeFileSync(credentialsFile, JSON.stringify(credentials, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
  writeFileSync(secretFile, randomBytes(32).toString('hex') + '\n', { mode: 0o600, flag: 'wx' });
  console.log(`Demostración local creada: ${people.length} cuentas, un cliente, un encargo y un período.`);
  console.log(`Credenciales: ${credentialsFile}`);
  console.log(`Clave local de sesiones: ${secretFile}`);
  console.log('Ningún dato se agregó a la instalación pública.');
} finally {
  await db.onModuleDestroy();
}
