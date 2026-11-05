import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { User } from './auth';
import { DatabaseService, Row } from './database';

const hr=(user:User)=>['HR_ADMIN','ADMIN'].includes(user.role);
const name=(value:unknown,label:string,max=140)=>{
  if(typeof value!=='string'||!value.trim()||value.length>max) throw new BadRequestException(`${label}: valor inválido`);
  return value.trim();
};
const date=(value:unknown)=>{
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new BadRequestException('Fecha inválida');
  return value;
};
const directory=()=>resolve(process.env.UPLOAD_DIR||'data/uploads');

@Injectable()
export class RecordsService {
  constructor(private readonly db:DatabaseService) {}
  private async employee(user:User,id:number):Promise<void> {
    const row=await this.db.get<Row>('SELECT id,manager_id FROM employees WHERE id=?',[id]);
    if(!row) throw new NotFoundException('Empleado no encontrado');
    if(id!==user.employee_id&&!hr(user)&&!(user.role==='MANAGER'&&Number(row.manager_id)===user.employee_id)) throw new ForbiddenException('Sin acceso a este expediente');
  }
  async benefitCatalog():Promise<Row[]> { return this.db.all('SELECT * FROM benefits ORDER BY name'); }
  async addBenefit(user:User,input:Record<string,unknown>):Promise<Row[]> {
    if(!hr(user)) throw new ForbiddenException('Solo RR. HH. administra beneficios');
    await this.db.run('INSERT INTO benefits (name,description) VALUES (?,?)',[name(input.name,'Beneficio'),typeof input.description==='string'?input.description.slice(0,1000):null]);
    return this.benefitCatalog();
  }
  async benefits(user:User,id:number):Promise<Row[]> {
    await this.employee(user,id);
    return this.db.all('SELECT eb.*,b.name,b.description FROM employee_benefits eb JOIN benefits b ON b.id=eb.benefit_id WHERE eb.employee_id=? ORDER BY eb.effective_date DESC',[id]);
  }
  async assignBenefit(user:User,id:number,input:Record<string,unknown>):Promise<Row[]> {
    if(!hr(user)) throw new ForbiddenException('Solo RR. HH. asigna beneficios'); await this.employee(user,id);
    const benefitId=Number(input.benefit_id), employeeCost=Number(input.employee_cost||0), companyCost=Number(input.company_cost||0);
    if(!Number.isInteger(benefitId)||!Number.isFinite(employeeCost)||employeeCost<0||!Number.isFinite(companyCost)||companyCost<0||!(await this.db.get('SELECT id FROM benefits WHERE id=? AND active=1',[benefitId]))) throw new BadRequestException('Beneficio o importes inválidos');
    await this.db.run('INSERT INTO employee_benefits (employee_id,benefit_id,effective_date,coverage,employee_cost,company_cost) VALUES (?,?,?,?,?,?)',[id,benefitId,date(input.effective_date),typeof input.coverage==='string'?input.coverage.slice(0,140):null,employeeCost,companyCost]);
    return this.benefits(user,id);
  }
  async documents(user:User,id:number):Promise<Row[]> {
    await this.employee(user,id);
    const where=hr(user)?'':'AND visible_to_employee=1';
    return this.db.all(`SELECT id,employee_id,category,title,file_name,visible_to_employee,uploaded_at FROM employee_documents WHERE employee_id=? ${where} ORDER BY uploaded_at DESC`,[id]);
  }
  async uploadDocument(user:User,id:number,input:Record<string,unknown>):Promise<Row[]> {
    await this.employee(user,id);
    if(!hr(user)&&id!==user.employee_id) throw new ForbiddenException('Solo puedes subir tus documentos');
    const filename=name(input.file_name,'Archivo',255),base64=name(input.base64,'Archivo',7_000_000);
    if(!/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) throw new BadRequestException('Archivo inválido');
    const data=Buffer.from(base64,'base64');
    if(data.length<100||data.length>5*1024*1024||!(/\.pdf$/i.test(filename)&&data.subarray(0,4).toString()==='%PDF'||/\.docx$/i.test(filename)&&data.subarray(0,2).toString()==='PK'||/\.doc$/i.test(filename)&&data.subarray(0,4).toString('hex')==='d0cf11e0')) throw new BadRequestException('PDF, DOC o DOCX de hasta 5 MB requerido');
    const key=randomUUID(); await mkdir(directory(),{recursive:true}); await writeFile(resolve(directory(),key),data,{flag:'wx'});
    try { await this.db.run('INSERT INTO employee_documents (employee_id,category,title,file_name,storage_name,visible_to_employee,uploaded_by,uploaded_at) VALUES (?,?,?,?,?,?,?,?)',[id,name(input.category,'Categoría',80),name(input.title,'Título'),filename,key,id===user.employee_id||hr(user)&&input.visible_to_employee?1:0,user.id,new Date().toISOString()]); }
    catch(error){await unlink(resolve(directory(),key)).catch(()=>{});throw error;}
    return this.documents(user,id);
  }
  async download(user:User,id:number):Promise<{name:string;data:string}> {
    const doc=await this.db.get<Row>('SELECT * FROM employee_documents WHERE id=?',[id]);
    if(!doc) throw new NotFoundException('Documento no encontrado'); await this.employee(user,Number(doc.employee_id));
    if(!hr(user)&&!doc.visible_to_employee) throw new ForbiddenException('Documento restringido');
    return {name:String(doc.file_name),data:(await readFile(resolve(directory(),String(doc.storage_name)))).toString('base64')};
  }
  async trainingCatalog():Promise<Row[]> {return this.db.all('SELECT * FROM trainings ORDER BY title');}
  async addTraining(user:User,input:Record<string,unknown>):Promise<Row[]> {
    if(!hr(user)) throw new ForbiddenException('Solo RR. HH. administra capacitación');
    await this.db.run('INSERT INTO trainings (title,description) VALUES (?,?)',[name(input.title,'Título'),typeof input.description==='string'?input.description.slice(0,1000):null]);return this.trainingCatalog();
  }
  async trainings(user:User,id:number):Promise<Row[]> {
    await this.employee(user,id);
    return this.db.all('SELECT a.*,t.title,t.description FROM training_assignments a JOIN trainings t ON t.id=a.training_id WHERE a.employee_id=? ORDER BY a.id DESC',[id]);
  }
  async assignTraining(user:User,id:number,input:Record<string,unknown>):Promise<Row[]> {
    if(!hr(user)) throw new ForbiddenException('Solo RR. HH. asigna capacitaciones'); await this.employee(user,id);
    const trainingId=Number(input.training_id);
    if(!Number.isInteger(trainingId)||!(await this.db.get('SELECT id FROM trainings WHERE id=? AND active=1',[trainingId]))) throw new BadRequestException('Capacitación inválida');
    await this.db.run('INSERT INTO training_assignments (training_id,employee_id,due_date) VALUES (?,?,?)',[trainingId,id,input.due_date?date(input.due_date):null]);return this.trainings(user,id);
  }
  async completeTraining(user:User,id:number):Promise<Row> {
    const assignment=await this.db.get<Row>('SELECT * FROM training_assignments WHERE id=?',[id]);
    if(!assignment) throw new NotFoundException('Capacitación no encontrada');await this.employee(user,Number(assignment.employee_id));
    if(!hr(user)&&assignment.employee_id!==user.employee_id) throw new ForbiddenException('Sin permiso');
    if(assignment.status==='Completada') throw new ConflictException('Ya completada');
    await this.db.run('UPDATE training_assignments SET status=?,completed_on=? WHERE id=?',['Completada',new Date().toISOString().slice(0,10),id]);
    return (await this.db.get<Row>('SELECT * FROM training_assignments WHERE id=?',[id]))!;
  }
  async onboarding(user:User,id:number):Promise<Row[]> { await this.employee(user,id); return this.db.all('SELECT * FROM onboarding_tasks WHERE employee_id=? ORDER BY id',[id]); }
  async addTask(user:User,id:number,input:Record<string,unknown>):Promise<Row[]> {
    if(!hr(user)) throw new ForbiddenException('Solo RR. HH. crea tareas de incorporación');await this.employee(user,id);
    const role=name(input.assignee_role,'Responsable',30);
    if(!['EMPLOYEE','MANAGER','HR_ADMIN'].includes(role)) throw new BadRequestException('Responsable inválido');
    await this.db.run('INSERT INTO onboarding_tasks (employee_id,title,assignee_role,created_at) VALUES (?,?,?,?)',[id,name(input.title,'Tarea',200),role,new Date().toISOString()]);
    return this.onboarding(user,id);
  }
  async completeTask(user:User,id:number):Promise<Row> {
    const task=await this.db.get<Row>('SELECT t.*,e.manager_id FROM onboarding_tasks t JOIN employees e ON e.id=t.employee_id WHERE t.id=?',[id]);
    if(!task) throw new NotFoundException('Tarea no encontrada');
    const allowed=hr(user)||task.assignee_role==='EMPLOYEE'&&Number(task.employee_id)===user.employee_id||task.assignee_role==='MANAGER'&&Number(task.manager_id)===user.employee_id;
    if(!allowed) throw new ForbiddenException('Tarea asignada a otro responsable');
    if(task.status==='Completada') throw new ConflictException('Ya completada');
    await this.db.run('UPDATE onboarding_tasks SET status=?,completed_at=? WHERE id=?',['Completada',new Date().toISOString(),id]);
    return (await this.db.get<Row>('SELECT * FROM onboarding_tasks WHERE id=?',[id]))!;
  }
}
