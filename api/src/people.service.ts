import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { AuthenticatedRequest, User } from './auth';
import { DatabaseService, Param, Row, hashPassword } from './database';

const directFields = ['preferred_name', 'personal_email', 'phone', 'address', 'emergency_name', 'emergency_phone'];
const approvalFields = ['first_name', 'last_name', 'birth_date', 'dpi', 'nit', 'igss'];
const jobFields = ['job_title', 'area', 'service_line', 'office', 'employment_type', 'status', 'manager_id', 'hire_date'];
const labels: Record<string, string> = {
  EMPLOYEE: 'Empleado', MANAGER: 'Gerente', HR_ADMIN: 'RR. HH.', ADMIN: 'Administrador total',
};

function stringValue(value: unknown, label: string, max = 190): string {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new BadRequestException(`${label}: valor obligatorio o inválido`);
  return value.trim();
}
function optionalText(value: unknown, label: string, max = 255): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string' || value.length > max) throw new BadRequestException(`${label}: valor inválido`);
  return value.trim();
}
function emailValue(value: unknown): string {
  const email = stringValue(value, 'Correo', 190).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new BadRequestException('Correo inválido');
  return email;
}

@Injectable()
export class PeopleService {
  constructor(private readonly db: DatabaseService) {}

  private async audit(actor: User, employeeId: number | null, action: string, fields: string[]): Promise<void> {
    await this.db.run('INSERT INTO audit_logs (actor_user_id,employee_id,action,details,created_at) VALUES (?,?,?,?,?)',
      [actor.id, employeeId, action, JSON.stringify({ fields }), new Date().toISOString()]);
  }
  private async employeeRow(id: number): Promise<Row> {
    const row = await this.db.get<Row>(
      `SELECT e.*, m.first_name AS manager_first_name, m.last_name AS manager_last_name,
       u.role, u.last_login FROM employees e LEFT JOIN employees m ON m.id=e.manager_id
       LEFT JOIN users u ON u.employee_id=e.id WHERE e.id=?`, [id]);
    if (!row) throw new NotFoundException('Empleado no encontrado');
    return row;
  }
  private sanitize(row: Row, detailed: boolean): Row {
    const result = { ...row };
    if (!detailed) for (const key of ['birth_date', 'dpi', 'nit', 'igss', 'personal_email', 'address', 'emergency_name', 'emergency_phone']) delete result[key];
    return result;
  }
  private canManage(user: User): boolean { return user.role === 'HR_ADMIN' || user.role === 'ADMIN'; }
  private assertManage(user: User): void { if (!this.canManage(user)) throw new ForbiddenException('Solo RR. HH. puede modificar expedientes'); }

  async me(user: User): Promise<Row> { return this.sanitize(await this.employeeRow(user.employee_id), true); }

  async list(user: User, search = '', status = 'Activo'): Promise<Row[]> {
    if (!this.canManage(user) && user.role !== 'MANAGER') throw new ForbiddenException('No tienes acceso a Personas');
    const params: Param[] = [];
    let where = 'WHERE 1=1';
    if (user.role === 'MANAGER') { where += ' AND e.manager_id=?'; params.push(user.employee_id); }
    if (status !== 'Todos') { where += ' AND e.status=?'; params.push(status); }
    if (search.trim()) { where += ' AND (e.first_name LIKE ? OR e.last_name LIKE ? OR e.code LIKE ? OR e.job_title LIKE ?)'; params.push(...Array(4).fill(`%${search.trim()}%`)); }
    const rows = await this.db.all<Row>(
      `SELECT e.id,e.code,e.first_name,e.last_name,e.work_email,e.job_title,e.area,e.office,e.employment_type,e.status,e.hire_date,e.manager_id,u.role
       FROM employees e LEFT JOIN users u ON u.employee_id=e.id ${where} ORDER BY e.code`, params);
    return rows;
  }

  async get(user: User, id: number): Promise<Row> {
    const row = await this.employeeRow(id);
    if (id !== user.employee_id && !this.canManage(user) && !(user.role === 'MANAGER' && Number(row.manager_id) === user.employee_id))
      throw new ForbiddenException('No tienes acceso a este expediente');
    return this.sanitize(row, id === user.employee_id || this.canManage(user));
  }

  async create(user: User, input: Record<string, unknown>): Promise<{ employee: Row; temporaryPassword: string }> {
    this.assertManage(user);
    const first = stringValue(input.first_name, 'Primer nombre', 100);
    const last = stringValue(input.last_name, 'Primer apellido', 100);
    const workEmail = emailValue(input.work_email);
    const code = stringValue(input.code, 'Código', 20);
    const jobTitle = stringValue(input.job_title, 'Puesto', 140);
    const area = stringValue(input.area, 'Área', 100);
    const office = stringValue(input.office, 'Sede', 100);
    const hireDate = stringValue(input.hire_date, 'Fecha de ingreso', 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(hireDate)) throw new BadRequestException('Fecha de ingreso inválida');
    const managerId = input.manager_id ? Number(input.manager_id) : null;
    if (managerId && !(await this.db.get('SELECT id FROM employees WHERE id=?', [managerId]))) throw new BadRequestException('Responsable inexistente');
    if (await this.db.get('SELECT id FROM employees WHERE code=? OR work_email=?', [code, workEmail])) throw new ConflictException('Código o correo ya registrado');
    const id = await this.db.run(
      `INSERT INTO employees (code,first_name,last_name,work_email,hire_date,job_title,area,service_line,office,employment_type,status,manager_id,phone)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [code, first, last, workEmail, hireDate, jobTitle, area, optionalText(input.service_line, 'Línea de servicio', 100), office,
        optionalText(input.employment_type, 'Tipo de contratación', 80) || 'Plazo indefinido', 'Activo', managerId, optionalText(input.phone, 'Teléfono', 30)]);
    const temporaryPassword = randomBytes(10).toString('base64url');
    await this.db.run('INSERT INTO users (employee_id,email,password_hash,role) VALUES (?,?,?,?)',
      [id, workEmail, hashPassword(temporaryPassword), 'EMPLOYEE']);
    await this.recordJob(id, user.id);
    await this.audit(user, id, 'CREAR_EMPLEADO', ['code', 'first_name', 'last_name', 'work_email', 'job_title', 'area']);
    return { employee: await this.get(user, id), temporaryPassword };
  }

  async updateSelf(user: User, input: Record<string, unknown>): Promise<Row> {
    const keys = Object.keys(input);
    if (!keys.length || keys.some(key => !directFields.includes(key))) throw new BadRequestException('Campo no editable directamente');
    const values = keys.map(key => key === 'personal_email' && input[key] ? emailValue(input[key]) : optionalText(input[key], key));
    await this.db.run(`UPDATE employees SET ${keys.map(key => `${key}=?`).join(',')} WHERE id=?`, [...values, user.employee_id]);
    await this.audit(user, user.employee_id, 'EDITAR_DATOS_PROPIOS', keys);
    return this.me(user);
  }

  async update(user: User, id: number, input: Record<string, unknown>): Promise<Row> {
    this.assertManage(user);
    await this.employeeRow(id);
    const allowed = [...directFields, ...approvalFields, ...jobFields, 'work_email'];
    const keys = Object.keys(input);
    if (!keys.length || keys.some(key => !allowed.includes(key))) throw new BadRequestException('Campo no permitido');
    const values: Param[] = [];
    for (const key of keys) {
      const value = input[key];
      if (key === 'manager_id') {
        const manager = value ? Number(value) : null;
        if (manager === id) throw new BadRequestException('Un empleado no puede ser su propio responsable');
        if (manager && !(await this.db.get('SELECT id FROM employees WHERE id=?', [manager]))) throw new BadRequestException('Responsable inexistente');
        values.push(manager);
      } else if (key === 'work_email') values.push(emailValue(value));
      else if (key === 'personal_email') values.push(value ? emailValue(value) : null);
      else if (key === 'dpi') {
        if (value && !/^\d{13}$/.test(String(value))) throw new BadRequestException('El DPI debe tener 13 dígitos');
        values.push(value ? String(value) : null);
      } else if (['first_name', 'last_name', 'job_title', 'area', 'office', 'employment_type', 'status', 'hire_date'].includes(key))
        values.push(stringValue(value, key));
      else values.push(optionalText(value, key));
    }
    if (keys.includes('work_email')) {
      const existing = await this.db.get<Row>('SELECT id FROM employees WHERE work_email=? AND id<>?', [values[keys.indexOf('work_email')], id]);
      if (existing) throw new ConflictException('Correo institucional ya registrado');
    }
    await this.db.run(`UPDATE employees SET ${keys.map(key => `${key}=?`).join(',')} WHERE id=?`, [...values, id]);
    if (keys.includes('work_email')) await this.db.run('UPDATE users SET email=? WHERE employee_id=?', [values[keys.indexOf('work_email')], id]);
    if (keys.some(key => jobFields.includes(key))) await this.recordJob(id, user.id);
    await this.audit(user, id, 'EDITAR_EMPLEADO', keys);
    return this.get(user, id);
  }

  private async recordJob(employeeId: number, actorId: number): Promise<void> {
    const row = await this.employeeRow(employeeId);
    await this.db.run(
      `INSERT INTO employment_history (employee_id,job_title,area,service_line,office,employment_type,status,manager_id,effective_date,recorded_at,recorded_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [employeeId, String(row.job_title), String(row.area), row.service_line as Param ?? null,
        String(row.office), String(row.employment_type), String(row.status), row.manager_id as Param ?? null,
        new Date().toISOString().slice(0, 10), new Date().toISOString(), actorId]);
  }
  async history(user: User, id: number): Promise<Row[]> {
    await this.get(user, id);
    return this.db.all('SELECT * FROM employment_history WHERE employee_id=? ORDER BY id DESC', [id]);
  }

  async requestChange(user: User, field: string, proposed: unknown): Promise<Row> {
    if (!approvalFields.includes(field)) throw new BadRequestException('Este campo no requiere aprobación');
    const proposedValue = stringValue(proposed, field);
    if (field === 'dpi' && !/^\d{13}$/.test(proposedValue)) throw new BadRequestException('El DPI debe tener 13 dígitos');
    const employee = await this.employeeRow(user.employee_id);
    const id = await this.db.run(
      `INSERT INTO change_requests (employee_id,field,proposed_value,previous_value,status,created_at) VALUES (?,?,?,?,?,?)`,
      [user.employee_id, field, proposedValue, employee[field] as Param ?? null, 'Pendiente', new Date().toISOString()]);
    await this.audit(user, user.employee_id, 'SOLICITAR_CAMBIO', [field]);
    return (await this.db.get('SELECT * FROM change_requests WHERE id=?', [id]))!;
  }
  async requests(user: User): Promise<Row[]> {
    if (this.canManage(user)) return this.db.all('SELECT r.*,e.first_name,e.last_name FROM change_requests r JOIN employees e ON e.id=r.employee_id ORDER BY r.id DESC');
    return this.db.all('SELECT * FROM change_requests WHERE employee_id=? ORDER BY id DESC', [user.employee_id]);
  }
  async resolveRequest(user: User, id: number, approve: boolean): Promise<Row> {
    this.assertManage(user);
    const row = await this.db.get<Row>('SELECT * FROM change_requests WHERE id=?', [id]);
    if (!row) throw new NotFoundException('Solicitud no encontrada');
    if (row.status !== 'Pendiente') throw new ConflictException('La solicitud ya fue resuelta');
    if (approve) await this.db.run(`UPDATE employees SET ${String(row.field)}=? WHERE id=?`, [String(row.proposed_value), Number(row.employee_id)]);
    await this.db.run('UPDATE change_requests SET status=?,resolved_at=?,resolved_by=? WHERE id=?',
      [approve ? 'Aprobada' : 'Rechazada', new Date().toISOString(), user.id, id]);
    await this.audit(user, Number(row.employee_id), approve ? 'APROBAR_CAMBIO' : 'RECHAZAR_CAMBIO', [String(row.field)]);
    return (await this.db.get('SELECT * FROM change_requests WHERE id=?', [id]))!;
  }

  async account(user: User): Promise<Row> {
    if (user.role !== 'ADMIN') throw new ForbiddenException('Solo el administrador total puede ver Configuración');
    return { company: 'Aurea Auditoría', country: 'Guatemala', package: 'Demostración académica', users: Number((await this.db.get<{ n: number }>('SELECT COUNT(*) AS n FROM users'))?.n ?? 0) };
  }
  async levels(user: User): Promise<Row[]> {
    if (user.role !== 'ADMIN') throw new ForbiddenException('Solo el administrador total puede ver niveles');
    const rows = await this.db.all<Row>('SELECT role,COUNT(*) AS total FROM users GROUP BY role ORDER BY role');
    return rows.map(row => ({ role: row.role, label: labels[String(row.role)] ?? row.role, total: Number(row.total) }));
  }
  async changeRole(user: User, employeeId: number, role: string): Promise<Row> {
    if (user.role !== 'ADMIN') throw new ForbiddenException('Solo el administrador total puede asignar niveles');
    if (!Object.keys(labels).includes(role)) throw new BadRequestException('Nivel inválido');
    const target = await this.db.get<Row>('SELECT * FROM users WHERE employee_id=?', [employeeId]);
    if (!target) throw new NotFoundException('Usuario no encontrado');
    if (target.role === 'ADMIN' && role !== 'ADMIN') {
      const count = await this.db.get<{ n: number }>("SELECT COUNT(*) AS n FROM users WHERE role='ADMIN'");
      if (Number(count?.n) <= 1) throw new ConflictException('Debe existir al menos un administrador total');
    }
    await this.db.run('UPDATE users SET role=? WHERE employee_id=?', [role, employeeId]);
    await this.audit(user, employeeId, 'CAMBIAR_NIVEL', ['role']);
    return this.get(user, employeeId);
  }
  async auditLog(user: User): Promise<Row[]> {
    if (user.role !== 'ADMIN') throw new ForbiddenException('Solo el administrador total puede consultar la bitácora');
    return this.db.all('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 100');
  }
}
