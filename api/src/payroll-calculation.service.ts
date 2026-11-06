import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from './auth';
import { DatabaseService, Row } from './database';

const date = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(`${v}T12:00:00Z`)) && new Date(`${v}T12:00:00Z`).toISOString().slice(0,10) === v;
const positiveId = (v: unknown): number => { const n=Number(v); if(!Number.isInteger(n)||n<1) throw new BadRequestException('Identificador inválido'); return n; };
const amount = (v: unknown): number => { const n=Number(v); if(v===''||v==null||!Number.isFinite(n)||n<0||n>999999999||Math.round(n*100)!==n*100) throw new BadRequestException('Importe inválido'); return n; };
const cents = (n:number)=>Math.round(n*100);
const cash = (n:number)=>Math.round(n)/100;
const days = (start:string,end:string):string[] => { const out:string[]=[]; for(let t=Date.parse(`${start}T12:00:00Z`),last=Date.parse(`${end}T12:00:00Z`);t<=last;t+=86400000) out.push(new Date(t).toISOString().slice(0,10)); return out; };
const monthDays=(day:string)=>new Date(Date.UTC(Number(day.slice(0,4)),Number(day.slice(5,7)),0)).getUTCDate();

@Injectable()
export class PayrollCalculationService {
  constructor(private readonly db:DatabaseService) {}
  private payroll(user:User) { if(user.role!=='PAYROLL') throw new ForbiddenException('Solo Nómina puede preparar cálculos'); }
  private reviewer(user:User) { if(user.role!=='ADMIN') throw new ForbiddenException('Solo administración total aprueba el cálculo'); }
  private async log(user:User,action:string,periodId:number|null,employeeId:number|null=null) { await this.db.run('INSERT INTO audit_logs (actor_user_id,employee_id,action,details,created_at) VALUES (?,?,?,?,?)',[user.id,employeeId,action,JSON.stringify({period_id:periodId}),new Date().toISOString()]); }
  private async period(periodId:number) { const row=await this.db.get<Row>('SELECT * FROM payroll_periods WHERE id=?',[periodId]); if(!row) throw new NotFoundException('Período no encontrado'); return row; }

  async conditions(user:User,employeeId:number) {
    if(!['PAYROLL','ADMIN'].includes(user.role)) throw new ForbiddenException();
    return this.db.all('SELECT * FROM pay_conditions WHERE employee_id=? ORDER BY effective_from DESC',[employeeId]);
  }
  async addCondition(user:User,input:Record<string,unknown>) {
    this.payroll(user);
    const employeeId=positiveId(input.employee_id), kind=String(input.kind||''), value=amount(input.amount);
    if(!['SALARIO_MENSUAL','TARIFA_HORA','SERVICIOS_PROFESIONALES'].includes(kind)||!date(input.effective_from)||input.effective_to!=null&&!date(input.effective_to)||input.effective_to!=null&&String(input.effective_to)<input.effective_from||value<=0) throw new BadRequestException('Condición de pago inválida');
    const dailyHours=Number(input.daily_hours??8);
    if(!Number.isFinite(dailyHours)||dailyHours<=0||dailyHours>24||Math.round(dailyHours*4)!==dailyHours*4) throw new BadRequestException('Jornada diaria inválida');
    const conditionId=await this.db.transaction(async tx=>{
      const employee=await tx.get(this.db.isMysql?'SELECT id FROM employees WHERE id=? FOR UPDATE':'SELECT id FROM employees WHERE id=?',[employeeId]);
      if(!employee) throw new NotFoundException('Empleado no encontrado');
      const overlaps=await tx.get('SELECT id FROM pay_conditions WHERE employee_id=? AND effective_from<=? AND (effective_to IS NULL OR effective_to>=?)',[employeeId,String(input.effective_to||'9999-12-31'),String(input.effective_from)]);
      if(overlaps) throw new ConflictException('La vigencia se solapa con otra condición; cierre la anterior primero');
      return tx.run('INSERT INTO pay_conditions (employee_id,kind,amount,daily_hours,effective_from,effective_to,created_by,created_at) VALUES (?,?,?,?,?,?,?,?)',[employeeId,kind,value,dailyHours,String(input.effective_from),input.effective_to?String(input.effective_to):null,user.id,new Date().toISOString()]);
    });
    await this.log(user,'CREAR_CONDICION_PAGO',null,employeeId);
    return this.db.get('SELECT * FROM pay_conditions WHERE id=?',[conditionId]);
  }
  async closeCondition(user:User,conditionId:number,effectiveTo:unknown) {
    this.payroll(user);
    const old=await this.db.get<Row>('SELECT * FROM pay_conditions WHERE id=?',[conditionId]);
    if(!old) throw new NotFoundException('Condición no encontrada');
    if(!date(effectiveTo)||effectiveTo<String(old.effective_from)||old.effective_to) throw new BadRequestException('Fecha de cierre inválida');
    const published=await this.db.get('SELECT i.id FROM payroll_run_items i JOIN payroll_runs r ON r.id=i.run_id JOIN payroll_periods p ON p.id=r.period_id WHERE i.employee_id=? AND r.status=? AND p.end_date>? LIMIT 1',[Number(old.employee_id),'Publicado',effectiveTo]);
    if(published) throw new ConflictException('La vigencia ya intervino en un período publicado');
    await this.db.run('UPDATE pay_conditions SET effective_to=? WHERE id=?',[effectiveTo,conditionId]);
    await this.log(user,'CERRAR_CONDICION_PAGO',null,Number(old.employee_id));
    return this.db.get('SELECT * FROM pay_conditions WHERE id=?',[conditionId]);
  }
  async adjustments(user:User,periodId:number) { this.payroll(user); await this.period(periodId); return this.db.all('SELECT a.*,e.first_name,e.last_name FROM pay_adjustments a JOIN employees e ON e.id=a.employee_id WHERE a.period_id=? ORDER BY a.id',[periodId]); }
  async addAdjustment(user:User,input:Record<string,unknown>) {
    this.payroll(user);
    const periodId=positiveId(input.period_id),employeeId=positiveId(input.employee_id),kind=String(input.kind||''),value=amount(input.amount),reason=String(input.reason||'').trim();
    if(!['BONO','AJUSTE_POSITIVO','DEDUCCION','IMPUESTO'].includes(kind)||value<=0||!reason||reason.length>255) throw new BadRequestException('Ajuste inválido');
    await this.period(periodId);
    if(await this.db.get('SELECT id FROM payroll_runs WHERE period_id=? AND status<>?',[periodId,'Borrador'])) throw new ConflictException('El cálculo ya fue enviado a revisión');
    if(!(await this.db.get('SELECT id FROM employees WHERE id=?',[employeeId]))) throw new NotFoundException('Empleado no encontrado');
    const id=await this.db.run('INSERT INTO pay_adjustments (employee_id,period_id,kind,amount,reason,created_by,created_at) VALUES (?,?,?,?,?,?,?)',[employeeId,periodId,kind,value,reason,user.id,new Date().toISOString()]);
    await this.log(user,'REGISTRAR_AJUSTE_NOMINA',periodId,employeeId);
    return this.db.get('SELECT * FROM pay_adjustments WHERE id=?',[id]);
  }
  async run(user:User,periodId:number):Promise<(Row & {items:Row[]})|null> {
    if(!['PAYROLL','ADMIN'].includes(user.role)) throw new ForbiddenException();
    await this.period(periodId);
    const run=await this.db.get<Row>('SELECT * FROM payroll_runs WHERE period_id=?',[periodId]);
    if(!run) return null;
    const items=await this.db.all<Row>('SELECT i.*,e.code,e.first_name,e.last_name FROM payroll_run_items i JOIN employees e ON e.id=i.employee_id WHERE i.run_id=? ORDER BY e.code',[Number(run.id)]);
    return { ...run,items:items.map(item=>({...item,detail:JSON.parse(String(item.detail_json)),detail_json:undefined})) };
  }
  async history(user:User):Promise<Row[]> {
    if(!['PAYROLL','ADMIN'].includes(user.role)) throw new ForbiddenException();
    return this.db.all(`SELECT r.id,r.period_id,r.status,r.created_at,r.approved_at,r.published_at,p.label,p.start_date,p.end_date,
      (SELECT COUNT(*) FROM payroll_run_items i WHERE i.run_id=r.id) AS people_count,
      (SELECT COALESCE(SUM(i.net),0) FROM payroll_run_items i WHERE i.run_id=r.id AND i.kind<>'SERVICIOS_PROFESIONALES') AS employee_net,
      (SELECT COALESCE(SUM(i.net),0) FROM payroll_run_items i WHERE i.run_id=r.id AND i.kind='SERVICIOS_PROFESIONALES') AS professional_fees
      FROM payroll_runs r JOIN payroll_periods p ON p.id=r.period_id ORDER BY p.start_date DESC`);
  }
  async generate(user:User,periodId:number) {
    this.payroll(user);
    const period=await this.period(periodId);
    if(['Procesado','Pagado'].includes(String(period.status))) throw new ConflictException('Período cerrado');
    const existing=await this.db.get<Row>('SELECT id,status FROM payroll_runs WHERE period_id=?',[periodId]);
    if(existing&&existing.status!=='Borrador') throw new ConflictException('El cálculo ya está en revisión o aprobado');
    if(await this.db.get('SELECT id FROM pay_records WHERE period_id=? AND status=?',[periodId,'Publicado'])) throw new ConflictException('Existen recibos publicados en el período');
    const people=await this.db.all<Row>("SELECT id,code,first_name,last_name,hire_date FROM employees WHERE status='Activo' AND hire_date<=? ORDER BY id",[String(period.end_date)]);
    if(!people.length) throw new BadRequestException('No hay empleados activos en el período');
    const calculated:Row[]=[];
    for(const person of people) {
      const employeeId=Number(person.id);
      const conditions=await this.db.all<Row>('SELECT * FROM pay_conditions WHERE employee_id=? AND effective_from<=? AND (effective_to IS NULL OR effective_to>=?) ORDER BY effective_from',[employeeId,String(period.end_date),String(period.start_date)]);
      if(!conditions.length) throw new BadRequestException(`${person.code}: falta condición de pago`);
      const workDays=days(String(period.start_date)>String(person.hire_date)?String(period.start_date):String(person.hire_date),String(period.end_date));
      const conditionAt=(d:string)=>conditions.find(c=>String(c.effective_from)<=d&&(c.effective_to==null||String(c.effective_to)>=d));
      if(workDays.some(d=>!conditionAt(d))) throw new BadRequestException(`${person.code}: hay días sin condición de pago vigente`);
      const kinds=[...new Set(workDays.map(d=>String(conditionAt(d)!.kind)))];
      if(kinds.length!==1) throw new BadRequestException(`${person.code}: no se puede mezclar nómina y servicios profesionales en el mismo período`);
      const kind=kinds[0];
      const sheet=await this.db.get<Row>('SELECT * FROM timesheets WHERE period_id=? AND employee_id=?',[periodId,employeeId]);
      const entries=sheet?.status==='Aprobada' ? await this.db.all<Row>('SELECT work_date,hours FROM time_entries WHERE timesheet_id=?',[Number(sheet.id)]) : [];
      if(kind!=='SALARIO_MENSUAL'&&sheet?.status!=='Aprobada') throw new BadRequestException(`${person.code}: requiere hoja de tiempo aprobada`);
      const leave=await this.db.all<Row>(`SELECT r.start_date,r.end_date,r.hours,t.pay_treatment FROM leave_requests r JOIN leave_types t ON t.id=r.leave_type_id WHERE r.employee_id=? AND r.status='Aprobada' AND r.start_date<=? AND r.end_date>=?`,[employeeId,String(period.end_date),String(period.start_date)]);
      let baseRaw=0,approvedHours=0,paidLeave=0,unpaidLeave=0;
      for(const d of workDays) {
        const c=conditionAt(d)!;
        const dayLeaves=leave.filter(l=>String(l.start_date)<=d&&String(l.end_date)>=d);
        const paid=dayLeaves.filter(l=>l.pay_treatment==='Pagada').reduce((sum,l)=>sum+Number(l.hours)/days(String(l.start_date),String(l.end_date)).length,0);
        const unpaid=dayLeaves.filter(l=>l.pay_treatment==='No pagada').reduce((sum,l)=>sum+Number(l.hours)/days(String(l.start_date),String(l.end_date)).length,0);
        paidLeave+=paid;unpaidLeave+=unpaid;
        if(paid+unpaid>Number(c.daily_hours)) throw new BadRequestException(`${person.code}: las ausencias exceden la jornada diaria`);
        const worked=entries.filter(e=>e.work_date===d).reduce((sum,e)=>sum+Number(e.hours),0);
        approvedHours+=worked;
        if(kind==='SALARIO_MENSUAL') baseRaw+=Number(c.amount)/monthDays(d)*(1-unpaid/Number(c.daily_hours));
        else baseRaw+=(worked+(kind==='TARIFA_HORA'?paid:0))*Number(c.amount);
      }
      const baseCents=cents(baseRaw);
      if(baseCents<0) throw new BadRequestException(`${person.code}: ausencia no pagada excede la jornada`);
      const adjustments=await this.db.all<Row>('SELECT kind,amount,reason FROM pay_adjustments WHERE period_id=? AND employee_id=?',[periodId,employeeId]);
      const sum=(k:string)=>adjustments.filter(a=>a.kind===k).reduce((s,a)=>s+cents(Number(a.amount)),0);
      const bonuses=sum('BONO'), additions=sum('AJUSTE_POSITIVO'), deductions=sum('DEDUCCION'), taxes=sum('IMPUESTO');
      const gross=baseCents+bonuses+additions;
      const net=gross-deductions-taxes;
      if(net<0) throw new BadRequestException(`${person.code}: deducciones superiores al bruto`);
      calculated.push({employee_id:employeeId,kind,base_amount:cash(baseCents),approved_hours:approvedHours,paid_leave_hours:paidLeave,unpaid_leave_hours:unpaidLeave,bonuses:cash(bonuses),adjustments:cash(additions),deductions:cash(deductions+taxes),gross:cash(gross),net:cash(net),detail_json:JSON.stringify({conditions:conditions.map(c=>({id:c.id,kind:c.kind,amount:c.amount,effective_from:c.effective_from,effective_to:c.effective_to})),adjustments,manual_taxes:cash(taxes),manual_deductions:cash(deductions),professional_services:kind==='SERVICIOS_PROFESIONALES'})});
    }
    await this.db.transaction(async tx=>{
      let runId=Number(existing?.id||0);
      if(runId) await tx.run('DELETE FROM payroll_run_items WHERE run_id=?',[runId]);
      else runId=await tx.run('INSERT INTO payroll_runs (period_id,status,created_by,created_at) VALUES (?,?,?,?)',[periodId,'Borrador',user.id,new Date().toISOString()]);
      for(const item of calculated) await tx.run('INSERT INTO payroll_run_items (run_id,employee_id,kind,base_amount,approved_hours,paid_leave_hours,unpaid_leave_hours,bonuses,adjustments,deductions,gross,net,detail_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',[runId,Number(item.employee_id),String(item.kind),Number(item.base_amount),Number(item.approved_hours),Number(item.paid_leave_hours),Number(item.unpaid_leave_hours),Number(item.bonuses),Number(item.adjustments),Number(item.deductions),Number(item.gross),Number(item.net),String(item.detail_json)]);
    });
    await this.log(user,'GENERAR_BORRADORES_MASIVOS',periodId);
    return this.run(user,periodId);
  }
  async submit(user:User,periodId:number) {
    this.payroll(user);const run=await this.run(user,periodId);
    if(!run||run.status!=='Borrador') throw new ConflictException('Genere primero los borradores');
    await this.db.run('UPDATE payroll_runs SET status=?,submitted_at=? WHERE id=?',['En revisión',new Date().toISOString(),Number(run.id)]);
    await this.log(user,'ENVIAR_CALCULO_A_APROBACION',periodId);return this.run(user,periodId);
  }
  async approve(user:User,periodId:number,approve:boolean) {
    this.reviewer(user);const run=await this.run(user,periodId);
    if(!run||run.status!=='En revisión') throw new ConflictException('No hay cálculo pendiente de aprobación');
    if(Number(run.created_by)===user.id) throw new ForbiddenException('No puedes aprobar tu propio cálculo');
    await this.db.run('UPDATE payroll_runs SET status=?,approved_by=?,approved_at=? WHERE id=?',[approve?'Aprobado':'Borrador',approve?user.id:null,approve?new Date().toISOString():null,Number(run.id)]);
    await this.log(user,approve?'APROBAR_CALCULO_NOMINA':'DEVOLVER_CALCULO_NOMINA',periodId);return this.run(user,periodId);
  }
  async publish(user:User,periodId:number) {
    this.payroll(user);const run=await this.run(user,periodId);
    if(!run||run.status!=='Aprobado') throw new ConflictException('El cálculo requiere aprobación previa');
    const period=await this.period(periodId);
    if(['Procesado','Pagado'].includes(String(period.status))) throw new ConflictException('El período ya está cerrado');
    await this.db.transaction(async tx=>{
      const locked=await tx.get<Row>(this.db.isMysql?'SELECT status FROM payroll_runs WHERE id=? FOR UPDATE':'SELECT status FROM payroll_runs WHERE id=?',[Number(run.id)]);
      if(locked?.status!=='Aprobado') throw new ConflictException('El cálculo ya cambió');
      for(const item of run.items as Row[]) {
        if(item.kind==='SERVICIOS_PROFESIONALES') continue;
        const previous=await tx.get<Row>('SELECT id,status,version FROM pay_records WHERE period_id=? AND employee_id=?',[periodId,Number(item.employee_id)]);
        if(previous?.status==='Publicado') throw new ConflictException('Ya existe un recibo publicado');
        const detail=item.detail as Record<string,unknown>;
        const taxes=Number(detail.manual_taxes||0),otherDeductions=Number(detail.manual_deductions||0);
        const earnings=JSON.stringify([{name:'Base calculada',amount:item.base_amount},{name:'Bonos',amount:item.bonuses},{name:'Ajustes',amount:item.adjustments}]);
        const taxItems=JSON.stringify(taxes?[{name:'Impuestos capturados',amount:taxes}]:[]);
        const deductionItems=JSON.stringify(otherDeductions?[{name:'Deducciones capturadas',amount:otherDeductions}]:[]);
        const now=new Date().toISOString();
        if(previous) await tx.run('UPDATE pay_records SET gross=?,taxes=?,deductions=?,net=?,earnings_json=?,taxes_json=?,deductions_json=?,status=?,source_note=?,version=?,updated_at=?,updated_by=? WHERE id=?',[Number(item.gross),taxes,otherDeductions,Number(item.net),earnings,taxItems,deductionItems,'Publicado','Cálculo por período aprobado',Number(previous.version)+1,now,user.id,Number(previous.id)]);
        else await tx.run('INSERT INTO pay_records (period_id,employee_id,currency,gross,taxes,deductions,net,earnings_json,taxes_json,deductions_json,status,source_note,updated_at,updated_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[periodId,Number(item.employee_id),'GTQ',Number(item.gross),taxes,otherDeductions,Number(item.net),earnings,taxItems,deductionItems,'Publicado','Cálculo por período aprobado',now,user.id]);
      }
      await tx.run('UPDATE payroll_runs SET status=?,published_at=? WHERE id=?',['Publicado',new Date().toISOString(),Number(run.id)]);
      await tx.run('UPDATE payroll_periods SET status=?,updated_at=? WHERE id=?',['Procesado',new Date().toISOString(),periodId]);
    });
    await this.log(user,'PUBLICAR_CALCULO_NOMINA',periodId);return this.run(user,periodId);
  }
}
