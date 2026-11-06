import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService, Row } from './database';
import { EngagementService } from './engagement.service';
import { User } from './auth';

const statuses = ['Abierto', 'En revisión', 'Bloqueado', 'Procesado', 'Pagado'];
const isoDate = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
const money = (value: unknown, label: string): number => {
  const n = Number(value);
  if (value === '' || value === null || value === undefined || !Number.isFinite(n) || n < 0 || Math.round(n * 100) !== n * 100)
    throw new BadRequestException(`${label} debe ser un importe no negativo con hasta dos decimales`);
  return n;
};
const id = (value: unknown): number => {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) throw new BadRequestException('Identificador inválido');
  return n;
};

@Injectable()
export class PayrollService {
  constructor(private readonly db: DatabaseService, private readonly engagements:EngagementService) {}

  private payrollOnly(user: User): void {
    if (user.role !== 'PAYROLL') throw new ForbiddenException('Solo Nómina puede administrar pagos y periodos');
  }
  private async audit(user: User, employeeId: number | null, action: string, periodId: number | null): Promise<void> {
    await this.db.run('INSERT INTO audit_logs (actor_user_id,employee_id,action,details,created_at) VALUES (?,?,?,?,?)',
      [user.id, employeeId, action, JSON.stringify({ period_id: periodId }), new Date().toISOString()]);
  }
  private async period(periodId: number): Promise<Row> {
    const period = await this.db.get<Row>('SELECT * FROM payroll_periods WHERE id=?', [periodId]);
    if (!period) throw new NotFoundException('Periodo no encontrado');
    return period;
  }
  async periods(): Promise<Row[]> {
    return this.db.all('SELECT * FROM payroll_periods ORDER BY start_date DESC');
  }
  async createPeriod(user: User, input: Record<string, unknown>): Promise<Row> {
    this.payrollOnly(user);
    const { label, start_date, end_date, submit_deadline, pay_date } = input;
    if (typeof label !== 'string' || !label.trim() || label.length > 100 ||
        !isoDate(start_date) || !isoDate(end_date) || !isoDate(submit_deadline) || !isoDate(pay_date) ||
        start_date > end_date || submit_deadline < start_date || pay_date < end_date)
      throw new BadRequestException('Revisa las fechas y el nombre del periodo');
    const overlap = await this.db.get<Row>('SELECT id FROM payroll_periods WHERE start_date<=? AND end_date>=?', [end_date, start_date]);
    if (overlap) throw new BadRequestException('El periodo se solapa con otro existente');
    const periodId = await this.db.run(
      'INSERT INTO payroll_periods (label,start_date,end_date,submit_deadline,pay_date,status,created_by,updated_at) VALUES (?,?,?,?,?,?,?,?)',
      [label.trim(), start_date, end_date, submit_deadline, pay_date, 'Abierto', user.id, new Date().toISOString()]);
    await this.audit(user, null, 'CREAR_PERIODO_NOMINA', periodId);
    return this.period(periodId);
  }
  async updatePeriod(user: User, periodId: number, input: Record<string, unknown>): Promise<Row> {
    this.payrollOnly(user);
    const period = await this.period(periodId);
    const allowed = ['label', 'submit_deadline', 'pay_date', 'status'];
    const keys = Object.keys(input);
    if (!keys.length || keys.some(key => !allowed.includes(key))) throw new BadRequestException('Campo de periodo no permitido');
    const values: (string | number)[] = [];
    for (const key of keys) {
      const value = input[key];
      if (key === 'status') {
        if (!statuses.includes(String(value))) throw new BadRequestException('Estado inválido');
        if (String(period.status) === 'Pagado' && value !== 'Pagado') throw new BadRequestException('Un periodo pagado no se reabre en esta versión');
        const run = await this.db.get<Row>('SELECT status FROM payroll_runs WHERE period_id=?',[periodId]);
        if(run && ['Procesado','Pagado'].includes(String(value)) && run.status!=='Publicado')
          throw new BadRequestException('Primero publica el cálculo aprobado');
      } else if (key === 'label') {
        if (typeof value !== 'string' || !value.trim() || value.length > 100) throw new BadRequestException('Nombre inválido');
      } else if (!isoDate(value)) throw new BadRequestException('Fecha inválida');
      values.push(String(value));
    }
    await this.db.run(`UPDATE payroll_periods SET ${keys.map(key => `${key}=?`).join(',')},updated_at=? WHERE id=?`,
      [...values, new Date().toISOString(), periodId]);
    await this.audit(user, null, 'ACTUALIZAR_PERIODO_NOMINA', periodId);
    return this.period(periodId);
  }
  async employees(user: User): Promise<Row[]> {
    this.payrollOnly(user);
    return this.db.all('SELECT id,code,first_name,last_name,job_title,status FROM employees ORDER BY code');
  }
  private async employeeAccess(user: User, employeeId: number, allowManager = false, periodId?:number): Promise<void> {
    if (user.employee_id === employeeId || user.role === 'PAYROLL') return;
    if (allowManager && user.role === 'MANAGER' && await this.db.get('SELECT id FROM employees WHERE id=? AND manager_id=?', [employeeId, user.employee_id])) return;
    if(allowManager&&periodId&&user.role==='MANAGER'&&await this.db.get('SELECT t.id FROM timesheets t JOIN time_entries d ON d.timesheet_id=t.id JOIN engagements e ON e.id=d.engagement_id WHERE t.employee_id=? AND t.period_id=? AND e.manager_id=? LIMIT 1',[employeeId,periodId,user.employee_id]))return;
    throw new ForbiddenException('No tienes acceso a los datos de esta persona');
  }
  async timesheet(user: User, periodId: number, employeeId = user.employee_id): Promise<Row> {
    await this.employeeAccess(user, employeeId, true,periodId);
    const period = await this.period(periodId);
    const sheet = await this.db.get<Row>('SELECT * FROM timesheets WHERE period_id=? AND employee_id=?', [periodId, employeeId]);
    const entries = sheet ? await this.db.all<Row>('SELECT t.*,e.name AS engagement_name FROM time_entries t LEFT JOIN engagements e ON e.id=t.engagement_id WHERE t.timesheet_id=? ORDER BY t.work_date', [Number(sheet.id)]) : [];
    return { period, sheet: sheet || { status: 'Borrador', employee_id: employeeId, period_id: periodId }, entries,
      total_hours: entries.reduce((sum, entry) => sum + Number(entry.hours), 0) };
  }
  async saveEntry(user: User, input: Record<string, unknown>): Promise<Row> {
    const periodId = id(input.period_id);
    const period = await this.period(periodId);
    if (period.status !== 'Abierto') throw new BadRequestException('El periodo no está abierto para captura');
    if (!isoDate(input.work_date) || input.work_date < String(period.start_date) || input.work_date > String(period.end_date))
      throw new BadRequestException('La fecha está fuera del periodo');
    const hours = Number(input.hours);
    if (!Number.isFinite(hours) || hours <= 0 || hours > 24 || Math.round(hours * 4) !== hours * 4)
      throw new BadRequestException('Las horas deben estar entre 0.25 y 24, en incrementos de 0.25');
    const note = input.note === undefined || input.note === null ? '' : String(input.note);
    if (note.length > 300) throw new BadRequestException('Comentario demasiado largo');
    const engagementId=input.engagement_id? id(input.engagement_id):null;
    if(engagementId)await this.engagements.validateTimeEntry(user,engagementId,String(input.work_date));
    else if(await this.db.get('SELECT a.id FROM engagement_assignments a JOIN engagements e ON e.id=a.engagement_id WHERE a.employee_id=? AND a.active=1 AND e.status=? AND a.start_date<=? AND a.end_date>=? LIMIT 1',[user.employee_id,'Activo',String(input.work_date),String(input.work_date)]))throw new BadRequestException('Selecciona el engagement para registrar estas horas');
    let sheet = await this.db.get<Row>('SELECT * FROM timesheets WHERE period_id=? AND employee_id=?', [periodId, user.employee_id]);
    if (sheet && !['Borrador', 'Devuelta'].includes(String(sheet.status))) throw new BadRequestException('La hoja enviada no se puede editar');
    if (!sheet) {
      const sheetId = await this.db.run('INSERT INTO timesheets (period_id,employee_id,status) VALUES (?,?,?)', [periodId, user.employee_id, 'Borrador']);
      sheet = { id: sheetId };
    }
    const existing = await this.db.get<Row>('SELECT id FROM time_entries WHERE timesheet_id=? AND work_date=?', [Number(sheet.id), input.work_date]);
    if (existing) await this.db.run('UPDATE time_entries SET hours=?,note=?,engagement_id=?,updated_at=? WHERE id=?', [hours, note,engagementId, new Date().toISOString(), Number(existing.id)]);
    else await this.db.run('INSERT INTO time_entries (timesheet_id,work_date,hours,note,engagement_id,updated_at) VALUES (?,?,?,?,?,?)',
      [Number(sheet.id), input.work_date, hours, note,engagementId, new Date().toISOString()]);
    await this.audit(user, user.employee_id, 'REGISTRAR_HORAS', periodId);
    return this.timesheet(user, periodId);
  }
  async submit(user: User, periodId: number): Promise<Row> {
    const period = await this.period(periodId);
    if (period.status !== 'Abierto') throw new BadRequestException('El periodo no está abierto');
    const sheet = await this.db.get<Row>('SELECT * FROM timesheets WHERE period_id=? AND employee_id=?', [periodId, user.employee_id]);
    if (!sheet || !['Borrador', 'Devuelta'].includes(String(sheet.status))) throw new BadRequestException('No hay una hoja en borrador');
    const entries = await this.db.all('SELECT id FROM time_entries WHERE timesheet_id=?', [Number(sheet.id)]);
    if (!entries.length) throw new BadRequestException('Registra al menos un día antes de enviar');
    await this.db.run('UPDATE timesheets SET status=?,submitted_at=?,review_comment=NULL WHERE id=?', ['Enviada', new Date().toISOString(), Number(sheet.id)]);
    await this.audit(user, user.employee_id, 'ENVIAR_HOJA_TIEMPO', periodId);
    return this.timesheet(user, periodId);
  }
  async reviewQueue(user: User): Promise<Row[]> {
    if (user.role !== 'MANAGER' && user.role !== 'PAYROLL') throw new ForbiddenException('Sin acceso a revisión');
    const filter = user.role === 'MANAGER' ? 'AND (e.manager_id=? OR EXISTS(SELECT 1 FROM time_entries d JOIN engagements g ON g.id=d.engagement_id WHERE d.timesheet_id=t.id AND g.manager_id=?))' : '';
    const params = user.role === 'MANAGER' ? [user.employee_id,user.employee_id] : [];
    return this.db.all(`SELECT t.*,p.label AS period_label,e.first_name,e.last_name,e.code,
      (SELECT COALESCE(SUM(hours),0) FROM time_entries WHERE timesheet_id=t.id) AS total_hours
      FROM timesheets t JOIN payroll_periods p ON p.id=t.period_id JOIN employees e ON e.id=t.employee_id
      WHERE t.status IN ('Enviada','Aprobada','Devuelta') ${filter} ORDER BY t.submitted_at DESC`, params);
  }
  async review(user: User, sheetId: number, approve: boolean, comment?: unknown): Promise<Row> {
    if (user.role !== 'MANAGER' && user.role !== 'PAYROLL') throw new ForbiddenException('Sin acceso a revisión');
    const sheet = await this.db.get<Row>('SELECT * FROM timesheets WHERE id=?', [sheetId]);
    if (!sheet) throw new NotFoundException('Hoja no encontrada');
    await this.employeeAccess(user, Number(sheet.employee_id), true,Number(sheet.period_id));
    if (Number(sheet.employee_id) === user.employee_id) throw new ForbiddenException('No puedes aprobar tu propia hoja');
    if (sheet.status !== 'Enviada') throw new BadRequestException('Solo se resuelven hojas enviadas');
    const reason = typeof comment === 'string' ? comment.trim() : '';
    if (!approve && !reason) throw new BadRequestException('Indica el motivo de devolución');
    if (reason.length > 500) throw new BadRequestException('Comentario demasiado largo');
    await this.db.run('UPDATE timesheets SET status=?,review_comment=?,reviewed_at=?,reviewed_by=? WHERE id=?',
      [approve ? 'Aprobada' : 'Devuelta', reason, new Date().toISOString(), user.id, sheetId]);
    await this.audit(user, Number(sheet.employee_id), approve ? 'APROBAR_HOJA_TIEMPO' : 'DEVOLVER_HOJA_TIEMPO', Number(sheet.period_id));
    return this.timesheet(user, Number(sheet.period_id), Number(sheet.employee_id));
  }
  private publicRecord(row: Row): Row {
    return { ...row, earnings: JSON.parse(String(row.earnings_json)), tax_items: JSON.parse(String(row.taxes_json)),
      deduction_items: JSON.parse(String(row.deductions_json)), earnings_json: undefined, taxes_json: undefined, deductions_json: undefined };
  }
  async receipts(user: User, employeeId = user.employee_id): Promise<Row[]> {
    await this.employeeAccess(user, employeeId);
    const where = user.role === 'PAYROLL' ? '' : "AND r.status='Publicado'";
    const rows = await this.db.all<Row>(`SELECT r.*,p.label AS period_label,p.start_date,p.end_date,p.pay_date,
      e.first_name,e.last_name,e.code FROM pay_records r JOIN payroll_periods p ON p.id=r.period_id
      JOIN employees e ON e.id=r.employee_id WHERE r.employee_id=? ${where} ORDER BY p.pay_date DESC`, [employeeId]);
    await this.audit(user, employeeId, 'CONSULTAR_RECIBOS', null);
    return rows.map(row => this.publicRecord(row));
  }
  async receipt(user: User, receiptId: number): Promise<Row> {
    const row = await this.db.get<Row>(`SELECT r.*,p.label AS period_label,p.start_date,p.end_date,p.pay_date,
      e.first_name,e.last_name,e.code FROM pay_records r JOIN payroll_periods p ON p.id=r.period_id
      JOIN employees e ON e.id=r.employee_id WHERE r.id=?`, [receiptId]);
    if (!row) throw new NotFoundException('Recibo no encontrado');
    await this.employeeAccess(user, Number(row.employee_id));
    if (user.role !== 'PAYROLL' && row.status !== 'Publicado') throw new NotFoundException('Recibo no disponible');
    await this.audit(user, Number(row.employee_id), 'CONSULTAR_RECIBO', Number(row.period_id));
    return this.publicRecord(row);
  }
  async saveReceipt(user: User, input: Record<string, unknown>): Promise<Row> {
    this.payrollOnly(user);
    const periodId = id(input.period_id), employeeId = id(input.employee_id);
    const period = await this.period(periodId);
    if(await this.db.get('SELECT id FROM payroll_runs WHERE period_id=?',[periodId]))
      throw new BadRequestException('Este período usa cálculo masivo; edita las condiciones o ajustes y recalcula');
    if (period.status === 'Pagado') throw new BadRequestException('El periodo pagado no admite cambios');
    if (!(await this.db.get('SELECT id FROM employees WHERE id=?', [employeeId]))) throw new NotFoundException('Empleado no encontrado');
    const gross = money(input.gross, 'Bruto'), taxes = money(input.taxes, 'Impuestos'), deductions = money(input.deductions, 'Deducciones');
    const net = Math.round((gross - taxes - deductions) * 100) / 100;
    if (net < 0) throw new BadRequestException('El neto no puede ser negativo');
    const source = typeof input.source_note === 'string' ? input.source_note.trim() : '';
    if (!source || source.length > 255) throw new BadRequestException('Indica la fuente de los importes');
    const earnings = JSON.stringify([{ name: 'Ingresos registrados', amount: gross }]);
    const taxItems = JSON.stringify(taxes ? [{ name: 'Impuestos registrados', amount: taxes }] : []);
    const deductionItems = JSON.stringify(deductions ? [{ name: 'Deducciones registradas', amount: deductions }] : []);
    const existing = await this.db.get<Row>('SELECT id,status,version FROM pay_records WHERE period_id=? AND employee_id=?', [periodId, employeeId]);
    if (existing?.status === 'Publicado') throw new BadRequestException('Un recibo publicado no se modifica en esta versión');
    if (existing) await this.db.run(`UPDATE pay_records SET gross=?,taxes=?,deductions=?,net=?,earnings_json=?,taxes_json=?,
      deductions_json=?,source_note=?,version=?,updated_at=?,updated_by=? WHERE id=?`,
      [gross,taxes,deductions,net,earnings,taxItems,deductionItems,source,Number(existing.version)+1,new Date().toISOString(),user.id,Number(existing.id)]);
    else await this.db.run(`INSERT INTO pay_records (period_id,employee_id,currency,gross,taxes,deductions,net,earnings_json,
      taxes_json,deductions_json,status,source_note,updated_at,updated_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [periodId,employeeId,'GTQ',gross,taxes,deductions,net,earnings,taxItems,deductionItems,'Borrador',source,new Date().toISOString(),user.id]);
    await this.audit(user, employeeId, 'GUARDAR_RECIBO_BORRADOR', periodId);
    const row = await this.db.get<Row>('SELECT id FROM pay_records WHERE period_id=? AND employee_id=?', [periodId, employeeId]);
    return this.receipt(user, Number(row!.id));
  }
  async publish(user: User, receiptId: number): Promise<Row> {
    this.payrollOnly(user);
    const row = await this.receipt(user, receiptId);
    if(await this.db.get('SELECT id FROM payroll_runs WHERE period_id=?',[Number(row.period_id)]))
      throw new BadRequestException('Este período usa cálculo masivo; publique el conjunto aprobado');
    if (row.status !== 'Borrador') throw new BadRequestException('El recibo ya está publicado');
    await this.db.run('UPDATE pay_records SET status=?,updated_at=?,updated_by=? WHERE id=?',
      ['Publicado', new Date().toISOString(), user.id, receiptId]);
    await this.audit(user, Number(row.employee_id), 'PUBLICAR_RECIBO', Number(row.period_id));
    return this.receipt(user, receiptId);
  }
  async issue(user: User, input: Record<string, unknown>): Promise<Row> {
    const periodId = id(input.period_id);
    await this.period(periodId);
    const receiptId = input.pay_record_id ? id(input.pay_record_id) : null;
    if (receiptId) {
      const receipt = await this.receipt(user, receiptId);
      if (Number(receipt.period_id) !== periodId || Number(receipt.employee_id) !== user.employee_id)
        throw new BadRequestException('El recibo no corresponde al periodo');
    }
    const message = typeof input.message === 'string' ? input.message.trim() : '';
    if (message.length < 10 || message.length > 1000) throw new BadRequestException('Describe la diferencia en 10 a 1000 caracteres');
    const issueId = await this.db.run('INSERT INTO payroll_issues (employee_id,period_id,pay_record_id,message,created_at) VALUES (?,?,?,?,?)',
      [user.employee_id, periodId, receiptId, message, new Date().toISOString()]);
    await this.audit(user, user.employee_id, 'REPORTAR_DISCREPANCIA', periodId);
    return (await this.db.get<Row>('SELECT * FROM payroll_issues WHERE id=?', [issueId]))!;
  }
  async issues(user: User): Promise<Row[]> {
    const where = user.role === 'PAYROLL' ? '' : 'WHERE i.employee_id=?';
    const params = user.role === 'PAYROLL' ? [] : [user.employee_id];
    return this.db.all(`SELECT i.*,e.first_name,e.last_name,p.label AS period_label FROM payroll_issues i
      JOIN employees e ON e.id=i.employee_id JOIN payroll_periods p ON p.id=i.period_id ${where} ORDER BY i.created_at DESC`, params);
  }
  async resolveIssue(user: User, issueId: number, response: unknown): Promise<Row> {
    this.payrollOnly(user);
    const issue = await this.db.get<Row>('SELECT * FROM payroll_issues WHERE id=?', [issueId]);
    if (!issue) throw new NotFoundException('Reporte no encontrado');
    const text = typeof response === 'string' ? response.trim() : '';
    if (!text || text.length > 1000) throw new BadRequestException('Ingresa una respuesta válida');
    await this.db.run('UPDATE payroll_issues SET status=?,response=?,resolved_at=?,resolved_by=? WHERE id=?',
      ['Resuelta', text, new Date().toISOString(), user.id, issueId]);
    await this.audit(user, Number(issue.employee_id), 'RESOLVER_DISCREPANCIA', Number(issue.period_id));
    return (await this.db.get<Row>('SELECT * FROM payroll_issues WHERE id=?', [issueId]))!;
  }
}
