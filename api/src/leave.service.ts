import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from './auth';
import { DatabaseService, Row } from './database';

const hr=(user:User)=>['HR_ADMIN','ADMIN'].includes(user.role);
const validDate=(value:unknown):value is string=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(`${value}T12:00:00Z`));

@Injectable()
export class LeaveService {
  constructor(private readonly db:DatabaseService) {}
  async types():Promise<Row[]> { return this.db.all('SELECT * FROM leave_types ORDER BY name'); }
  async addType(user:User,name:string):Promise<Row[]> {
    if(!hr(user)) throw new ForbiddenException('Solo RR. HH. administra tipos de ausencia');
    if(typeof name!=='string'||!name.trim()||name.length>100) throw new BadRequestException('Nombre inválido');
    await this.db.run('INSERT INTO leave_types (name) VALUES (?)',[name.trim()]); return this.types();
  }
  async balance(user:User,employeeId?:number):Promise<Row[]> {
    const id=employeeId||user.employee_id;
    if(id!==user.employee_id&&!hr(user)) throw new ForbiddenException('Sin acceso a este saldo');
    return this.db.all('SELECT t.id AS leave_type_id,t.name,t.unit,t.active,COALESCE(b.available_hours,0) AS available_hours FROM leave_types t LEFT JOIN leave_balances b ON b.leave_type_id=t.id AND b.employee_id=? ORDER BY t.name',[id]);
  }
  async setBalance(user:User,employeeId:number,typeId:number,hours:number):Promise<Row[]> {
    if(!hr(user)) throw new ForbiddenException('Solo RR. HH. ajusta saldos');
    if(!Number.isFinite(hours)||hours<0||hours>100000) throw new BadRequestException('Saldo inválido');
    if(!(await this.db.get('SELECT id FROM employees WHERE id=?',[employeeId]))||!(await this.db.get('SELECT id FROM leave_types WHERE id=? AND active=1',[typeId]))) throw new BadRequestException('Empleado o tipo inexistente');
    const existing=await this.db.get('SELECT employee_id FROM leave_balances WHERE employee_id=? AND leave_type_id=?',[employeeId,typeId]);
    if(existing) await this.db.run('UPDATE leave_balances SET available_hours=? WHERE employee_id=? AND leave_type_id=?',[hours,employeeId,typeId]);
    else await this.db.run('INSERT INTO leave_balances (employee_id,leave_type_id,available_hours) VALUES (?,?,?)',[employeeId,typeId,hours]);
    return this.balance(user,employeeId);
  }
  async list(user:User,employeeId?:number):Promise<Row[]> {
    let where='WHERE r.employee_id=?'; let params=[employeeId||user.employee_id];
    if(employeeId&&employeeId!==user.employee_id&&!hr(user)) {
      if(user.role!=='MANAGER'||!(await this.db.get('SELECT id FROM employees WHERE id=? AND manager_id=?',[employeeId,user.employee_id]))) throw new ForbiddenException('Sin acceso a estas solicitudes');
    }
    if(hr(user)&&!employeeId) {where='';params=[];}
    return this.db.all(`SELECT r.*,t.name AS type_name,e.first_name,e.last_name FROM leave_requests r JOIN leave_types t ON t.id=r.leave_type_id JOIN employees e ON e.id=r.employee_id ${where} ORDER BY r.id DESC`,params);
  }
  async create(user:User,input:Record<string,unknown>):Promise<Row> {
    const employeeId=input.employee_id&&hr(user)?Number(input.employee_id):user.employee_id;
    if(employeeId!==user.employee_id&&!hr(user)) throw new ForbiddenException('Sin permiso');
    const typeId=Number(input.leave_type_id),hours=Number(input.hours);
    if(!Number.isInteger(typeId)||!Number.isFinite(hours)||hours<=0||hours>1000||!validDate(input.start_date)||!validDate(input.end_date)||input.end_date<input.start_date) throw new BadRequestException('Fechas, tipo u horas inválidas');
    if(!(await this.db.get('SELECT id FROM leave_types WHERE id=? AND active=1',[typeId]))) throw new BadRequestException('Tipo de ausencia no disponible');
    if(await this.db.get('SELECT id FROM leave_requests WHERE employee_id=? AND status IN (?,?) AND start_date<=? AND end_date>=?',[employeeId,'Pendiente','Aprobada',input.end_date,input.start_date])) throw new ConflictException('Ya hay una ausencia en ese periodo');
    const id=await this.db.run('INSERT INTO leave_requests (employee_id,leave_type_id,start_date,end_date,hours,note,created_at) VALUES (?,?,?,?,?,?,?)',[employeeId,typeId,input.start_date,input.end_date,hours,typeof input.note==='string'?input.note.slice(0,1000):null,new Date().toISOString()]);
    return (await this.db.get<Row>('SELECT * FROM leave_requests WHERE id=?',[id]))!;
  }
  async queue(user:User):Promise<Row[]> {
    if(!hr(user)&&user.role!=='MANAGER') throw new ForbiddenException('Sin acceso a aprobaciones');
    const where=hr(user)?'':'AND e.manager_id=?';
    return this.db.all(`SELECT r.*,t.name AS type_name,e.first_name,e.last_name FROM leave_requests r JOIN employees e ON e.id=r.employee_id JOIN leave_types t ON t.id=r.leave_type_id WHERE r.status='Pendiente' ${where} ORDER BY r.id`,hr(user)?[]:[user.employee_id]);
  }
  async decide(user:User,id:number,approve:boolean,reason?:string):Promise<Row> {
    const r=await this.db.get<Row>('SELECT r.*,e.manager_id FROM leave_requests r JOIN employees e ON e.id=r.employee_id WHERE r.id=?',[id]);
    if(!r) throw new NotFoundException('Solicitud no encontrada');
    if(!hr(user)&&!(user.role==='MANAGER'&&Number(r.manager_id)===user.employee_id)) throw new ForbiddenException('Sin permiso para resolver');
    if(r.status!=='Pendiente') throw new ConflictException('Solicitud ya resuelta');
    await this.db.transaction(async tx=>{
      const current=await tx.get<Row>(`SELECT status FROM leave_requests WHERE id=?${this.db.isMysql?' FOR UPDATE':''}`,[id]);
      if(current?.status!=='Pendiente') throw new ConflictException('Solicitud ya resuelta');
      if(approve) {
        const b=await tx.get<{available_hours:number}>(`SELECT available_hours FROM leave_balances WHERE employee_id=? AND leave_type_id=?${this.db.isMysql?' FOR UPDATE':''}`,[Number(r.employee_id),Number(r.leave_type_id)]);
        if(!b||Number(b.available_hours)<Number(r.hours)) throw new ConflictException('Saldo insuficiente');
        await tx.run('UPDATE leave_balances SET available_hours=available_hours-? WHERE employee_id=? AND leave_type_id=?',[Number(r.hours),Number(r.employee_id),Number(r.leave_type_id)]);
      }
      await tx.run('UPDATE leave_requests SET status=?,decision_note=?,decided_by=?,decided_at=? WHERE id=?',[approve?'Aprobada':'Rechazada',reason?.slice(0,1000)||null,user.id,new Date().toISOString(),id]);
    });
    return (await this.db.get<Row>('SELECT * FROM leave_requests WHERE id=?',[id]))!;
  }
  async cancel(user:User,id:number):Promise<Row> {
    const r=await this.db.get<Row>('SELECT * FROM leave_requests WHERE id=?',[id]);
    if(!r) throw new NotFoundException('Solicitud no encontrada');
    if(Number(r.employee_id)!==user.employee_id&&!hr(user)) throw new ForbiddenException('Sin permiso');
    if(!['Pendiente','Aprobada'].includes(String(r.status))) throw new ConflictException('No se puede cancelar');
    if(r.status==='Aprobada'&&String(r.start_date)<new Date().toISOString().slice(0,10)&&!hr(user)) throw new ConflictException('Solicita a RR. HH. la corrección de una ausencia pasada');
    await this.db.transaction(async tx=>{
      const current=await tx.get<Row>(`SELECT status FROM leave_requests WHERE id=?${this.db.isMysql?' FOR UPDATE':''}`,[id]);
      if(!['Pendiente','Aprobada'].includes(String(current?.status))) throw new ConflictException('Solicitud ya resuelta');
      if(r.status==='Aprobada') await tx.run('UPDATE leave_balances SET available_hours=available_hours+? WHERE employee_id=? AND leave_type_id=?',[Number(r.hours),Number(r.employee_id),Number(r.leave_type_id)]);
      await tx.run('UPDATE leave_requests SET status=?,decided_by=?,decided_at=? WHERE id=?',['Cancelada',user.id,new Date().toISOString(),id]);
    });
    return (await this.db.get<Row>('SELECT * FROM leave_requests WHERE id=?',[id]))!;
  }
  async out(user:User):Promise<Row[]> {
    if(!['MANAGER','HR_ADMIN','ADMIN'].includes(user.role)) throw new ForbiddenException('Sin acceso a ausencias del equipo');
    const where=hr(user)?'':'AND e.manager_id=?';
    return this.db.all(`SELECT e.id,e.first_name,e.last_name,r.start_date,r.end_date FROM leave_requests r JOIN employees e ON e.id=r.employee_id WHERE r.status='Aprobada' AND r.end_date>=? ${where} ORDER BY r.start_date`,hr(user)?[new Date().toISOString().slice(0,10)]:[new Date().toISOString().slice(0,10),user.employee_id]);
  }
}
