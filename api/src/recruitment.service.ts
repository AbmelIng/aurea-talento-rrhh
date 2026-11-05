import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { User } from './auth';
import { DatabaseService, Row } from './database';

const now = () => new Date().toISOString();
const text = (value: unknown, label: string, max = 255): string => {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new BadRequestException(`${label}: valor inválido`);
  return value.trim();
};
const date = (value: unknown, label: string): string => {
  const result = text(value, label, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result) || Number.isNaN(Date.parse(`${result}T12:00:00Z`))) throw new BadRequestException(`${label}: fecha inválida`);
  return result;
};
const canManage = (user: User) => ['HR_ADMIN','ADMIN'].includes(user.role);
const fileDir = () => resolve(process.env.UPLOAD_DIR || 'data/uploads');
type VacancyQuestion={id:string;title:string;type:'short'|'yesno'|'choice';required:boolean;options?:string[]};
function questions(raw:unknown):VacancyQuestion[] {
  if(!Array.isArray(raw)||raw.length>20) throw new BadRequestException('Máximo 20 preguntas');
  return raw.map((q:unknown,i:number)=>{
    if(!q||typeof q!=='object') throw new BadRequestException('Pregunta inválida');
    const item=q as Record<string,unknown>,type=item.type;
    if(!['short','yesno','choice'].includes(String(type))) throw new BadRequestException('Tipo de pregunta inválido');
    const options=type==='choice'?item.options:[];
    if(type==='choice'&&(!Array.isArray(options)||options.length<2||options.length>10||options.some(x=>typeof x!=='string'||!x.trim()||x.length>100))) throw new BadRequestException('Opciones inválidas');
    return {id:`q${i+1}`,title:text(item.title,'Pregunta',250),type:type as VacancyQuestion['type'],required:item.required===true,options:type==='choice'?options as string[]:[]};
  });
}

@Injectable()
export class RecruitmentService {
  constructor(private readonly db: DatabaseService) {}
  private async vacancy(id: number): Promise<Row> {
    const row = await this.db.get<Row>('SELECT v.*, e.first_name AS manager_first_name, e.last_name AS manager_last_name FROM vacancies v JOIN employees e ON e.id=v.hiring_manager_id WHERE v.id=?',[id]);
    if (!row) throw new NotFoundException('Vacante no encontrada');
    return row;
  }
  private visible(user: User, vacancy: Row): void {
    if (!canManage(user) && Number(vacancy.hiring_manager_id) !== user.employee_id) throw new ForbiddenException('Sin acceso a esta vacante');
  }
  async list(user: User): Promise<Row[]> {
    if (!canManage(user) && user.role !== 'MANAGER') throw new ForbiddenException('Sin acceso a reclutamiento');
    const where = canManage(user) ? '' : 'WHERE v.hiring_manager_id=?';
    return this.db.all(`SELECT v.*, (SELECT COUNT(*) FROM applications a WHERE a.vacancy_id=v.id) AS applicants FROM vacancies v ${where} ORDER BY v.id DESC`,canManage(user)?[]:[user.employee_id]);
  }
  async publicList(): Promise<Row[]> {
    return this.db.all('SELECT id,title,area,level,employment_type,municipality,department,modality,description,requirements,deadline,openings,questions_json FROM vacancies WHERE status=? AND deadline>=? ORDER BY id DESC',['Abierta',new Date().toISOString().slice(0,10)]);
  }
  async publicOne(id:number):Promise<Row> {
    const row=await this.vacancy(id);
    if(row.status!=='Abierta' || String(row.deadline)<new Date().toISOString().slice(0,10)) throw new NotFoundException('Vacante no disponible');
    const {id:vacancyId,title,area,level,employment_type,municipality,department,modality,description,requirements,deadline,openings,questions_json}=row;
    return {id:vacancyId,title,area,level,employment_type,municipality,department,modality,description,requirements,deadline,openings,questions_json};
  }
  async setQuestions(user:User,id:number,input:unknown):Promise<Row> {
    if(!canManage(user)) throw new ForbiddenException('Solo RR. HH. configura preguntas');
    const v=await this.vacancy(id);
    if(!['Borrador','Pendiente de aprobación'].includes(String(v.status))) throw new ConflictException('Configura las preguntas antes de publicar');
    await this.db.run('UPDATE vacancies SET questions_json=?,updated_at=? WHERE id=?',[JSON.stringify(questions(input)),now(),id]);
    return this.vacancy(id);
  }
  async create(user:User,input:Record<string,unknown>):Promise<Row> {
    if(!canManage(user)&&user.role!=='MANAGER') throw new ForbiddenException('Sin permiso para solicitar vacantes');
    const manager=canManage(user)?Number(input.hiring_manager_id):user.employee_id;
    if(!Number.isInteger(manager)||manager<1||!(await this.db.get('SELECT id FROM employees WHERE id=?',[manager]))) throw new BadRequestException('Responsable inválido');
    const openings=Number(input.openings||1);
    if(!Number.isInteger(openings)||openings<1||openings>100) throw new BadRequestException('Número de plazas inválido');
    const values=[text(input.title,'Puesto',140),text(input.area,'Área',100),text(input.level,'Nivel',60),text(input.employment_type,'Contratación',80),text(input.municipality,'Municipio',100),text(input.department,'Departamento',100),text(input.modality,'Modalidad',30),text(input.description,'Descripción',10000),text(input.requirements,'Requisitos',10000),date(input.deadline,'Fecha límite')];
    const id=await this.db.run('INSERT INTO vacancies (title,area,level,employment_type,municipality,department,modality,description,requirements,deadline,openings,status,hiring_manager_id,is_new_position,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[...values,openings,'Borrador',manager,input.is_new_position?1:0,user.id,now(),now()]);
    return this.vacancy(id);
  }
  async update(user:User,id:number,input:Record<string,unknown>):Promise<Row> {
    if(!canManage(user)) throw new ForbiddenException('Solo RR. HH. puede editar vacantes');
    const row=await this.vacancy(id);
    if(!['Borrador','Pendiente de aprobación','Aprobada','Abierta','En pausa'].includes(String(row.status))) throw new ConflictException('Vacante cerrada');
    const fields=['title','area','level','employment_type','municipality','department','modality','description','requirements','deadline'] as const;
    const updates:Record<string,string|number>={};
    for(const field of fields) if(input[field]!==undefined) updates[field]=field==='deadline'?date(input[field],'Fecha límite'):text(input[field],field,field==='description'||field==='requirements'?10000:255);
    if(input.openings!==undefined){const openings=Number(input.openings);if(!Number.isInteger(openings)||openings<1||openings>100)throw new BadRequestException('Número de plazas inválido');updates.openings=openings;}
    if(input.is_new_position!==undefined)updates.is_new_position=input.is_new_position?1:0;
    if(!Object.keys(updates).length) throw new BadRequestException('Sin cambios');
    await this.db.run(`UPDATE vacancies SET ${Object.keys(updates).map(field=>`${field}=?`).join(',')},updated_at=?,approved_manager_at=NULL,approved_hr_at=NULL,approved_partner_at=NULL,status=? WHERE id=?`,[...Object.values(updates),now(),'Borrador',id]);
    return this.vacancy(id);
  }
  async transition(user:User,id:number,action:string):Promise<Row> {
    const v=await this.vacancy(id); this.visible(user,v);
    const status=String(v.status);
    if(action==='submit'&&status==='Borrador') await this.db.run('UPDATE vacancies SET status=?,updated_at=? WHERE id=?',['Pendiente de aprobación',now(),id]);
    else if(action==='approve-manager'&&status==='Pendiente de aprobación'&&Number(v.hiring_manager_id)===user.employee_id) await this.db.run('UPDATE vacancies SET approved_manager_at=?,updated_at=? WHERE id=?',[now(),now(),id]);
    else if(action==='approve-hr'&&status==='Pendiente de aprobación'&&canManage(user)) await this.db.run('UPDATE vacancies SET approved_hr_at=?,updated_at=? WHERE id=?',[now(),now(),id]);
    else if(action==='approve-partner'&&status==='Pendiente de aprobación'&&user.role==='ADMIN') await this.db.run('UPDATE vacancies SET approved_partner_at=?,updated_at=? WHERE id=?',[now(),now(),id]);
    else if(action==='publish'&&canManage(user)&&['Pendiente de aprobación','Aprobada'].includes(status)) {
      if(!v.approved_manager_at||!v.approved_hr_at||(v.is_new_position&&!v.approved_partner_at)) throw new ConflictException('Faltan aprobaciones');
      await this.db.run('UPDATE vacancies SET status=?,updated_at=? WHERE id=?',['Abierta',now(),id]);
    } else if(action==='pause'&&canManage(user)&&status==='Abierta') await this.db.run('UPDATE vacancies SET status=?,updated_at=? WHERE id=?',['En pausa',now(),id]);
    else if(action==='reopen'&&canManage(user)&&['En pausa','Cerrada'].includes(status)) await this.db.run('UPDATE vacancies SET status=?,updated_at=? WHERE id=?',['Abierta',now(),id]);
    else if(['close','cancel'].includes(action)&&canManage(user)&&!['Cubierta','Cancelada'].includes(status)) await this.db.run('UPDATE vacancies SET status=?,updated_at=? WHERE id=?',[action==='close'?'Cerrada':'Cancelada',now(),id]);
    else throw new ConflictException('Transición o permiso no permitido');
    const approved=await this.vacancy(id);
    if(approved.status==='Pendiente de aprobación'&&approved.approved_manager_at&&approved.approved_hr_at&&(!approved.is_new_position||approved.approved_partner_at)) await this.db.run('UPDATE vacancies SET status=? WHERE id=?',['Aprobada',id]);
    return this.vacancy(id);
  }
  async channels(user:User,id:number):Promise<Row[]> { this.visible(user,await this.vacancy(id)); return this.db.all('SELECT * FROM vacancy_channels WHERE vacancy_id=? ORDER BY id DESC',[id]); }
  async addChannel(user:User,id:number,body:Record<string,unknown>):Promise<Row[]> {
    if(!canManage(user)) throw new ForbiddenException('Solo RR. HH. registra canales');
    await this.vacancy(id);
    await this.db.run('INSERT INTO vacancy_channels (vacancy_id,channel,published_on) VALUES (?,?,?)',[id,text(body.channel,'Canal',100),date(body.published_on,'Fecha')]);
    return this.channels(user,id);
  }
  async apply(id:number,input:Record<string,unknown>):Promise<{received:boolean}> {
    const vacancy=await this.publicOne(id);
    if(input.consent_process!==true) throw new BadRequestException('Debes aceptar el tratamiento de datos para esta postulación');
    const email=text(input.email,'Correo',190).toLowerCase();
    const configured=questions(vacancy.questions_json?JSON.parse(String(vacancy.questions_json)):[]);
    const supplied=input.answers&&typeof input.answers==='object'&&!Array.isArray(input.answers)?input.answers as Record<string,unknown>:{};
    const answers:Record<string,string>={};
    for(const q of configured){const value=supplied[q.id];if(q.required&&(typeof value!=='string'||!value.trim())) throw new BadRequestException(`Responde: ${q.title}`);if(value!==undefined&&value!==''){if(typeof value!=='string'||value.length>500||q.type==='yesno'&&!['Sí','No'].includes(value)||q.type==='choice'&&!q.options?.includes(value))throw new BadRequestException(`Respuesta inválida: ${q.title}`);answers[q.id]=value;}}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new BadRequestException('Correo inválido');
    if(await this.db.get('SELECT id FROM applications WHERE vacancy_id=? AND email=?',[id,email])) throw new ConflictException('Ya existe una postulación con este correo');
    const cv=text(input.cv_base64,'Currículum',7_000_000);
    if(!/^[A-Za-z0-9+/]+={0,2}$/.test(cv)) throw new BadRequestException('Archivo inválido');
    const data=Buffer.from(cv,'base64');
    const fileName=text(input.cv_name,'Nombre del archivo',255);
    if(data.length<100||data.length>5*1024*1024||!(/\.pdf$/i.test(fileName)&&data.subarray(0,4).toString()==='%PDF'||/\.docx$/i.test(fileName)&&data.subarray(0,2).toString()==='PK'||/\.doc$/i.test(fileName)&&data.subarray(0,4).toString('hex')==='d0cf11e0')) throw new BadRequestException('Adjunta un PDF, DOC o DOCX válido de hasta 5 MB');
    const key=randomUUID(); await mkdir(fileDir(),{recursive:true}); await writeFile(resolve(fileDir(),key),data,{flag:'wx'});
    try {
      await this.db.run('INSERT INTO applications (vacancy_id,full_name,email,phone,municipality,department,education,salary_expectation,available_from,source,cv_file,cv_name,consent_process,consent_future,created_at,updated_at,answers_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[id,text(input.full_name,'Nombre',190),email,text(input.phone,'Teléfono',30),text(input.municipality,'Municipio',100),text(input.department,'Departamento',100),text(input.education,'Formación',255),text(input.salary_expectation,'Expectativa salarial',100),date(input.available_from,'Disponibilidad'),text(input.source,'Fuente',100),key,fileName,1,input.consent_future?1:0,now(),now(),JSON.stringify(answers)]);
    } catch(error) { await unlink(resolve(fileDir(),key)).catch(()=>{}); throw error; }
    return {received:true};
  }
  async applications(user:User,id:number):Promise<Row[]> {
    this.visible(user,await this.vacancy(id));
    return this.db.all('SELECT id,vacancy_id,full_name,email,phone,municipality,department,education,salary_expectation,available_from,source,cv_name,consent_future,stage,discard_reason,created_at,updated_at,answers_json FROM applications WHERE vacancy_id=? ORDER BY id DESC',[id]);
  }
  async advance(user:User,id:number,stage:string,reason?:string):Promise<Row> {
    const a=await this.db.get<Row>('SELECT a.*,v.hiring_manager_id FROM applications a JOIN vacancies v ON v.id=a.vacancy_id WHERE a.id=?',[id]);
    if(!a) throw new NotFoundException('Postulación no encontrada'); this.visible(user,a);
    if(!canManage(user)) throw new ForbiddenException('Solo RR. HH. cambia etapas');
    const stages=['Postulado','Revisión de CV','Preselección','Entrevista con RR. HH.'];
    if(stage==='Descartado') { if(!reason||!['No cumple requisitos','Expectativa salarial','Retiro del candidato','Resultado de evaluación','Independencia','Otros'].includes(reason)) throw new BadRequestException('Selecciona motivo de descarte'); }
    else if(!stages.includes(stage)||Math.abs(stages.indexOf(stage)-stages.indexOf(String(a.stage)))!==1) throw new ConflictException('La etapa debe avanzar o retroceder un paso');
    await this.db.run('UPDATE applications SET stage=?,discard_reason=?,updated_at=? WHERE id=?',[stage,stage==='Descartado'?reason||'Otros':null,now(),id]);
    return (await this.db.get<Row>('SELECT id,vacancy_id,full_name,email,stage,discard_reason,updated_at FROM applications WHERE id=?',[id]))!;
  }
  async cv(user:User,id:number):Promise<{name:string;data:string}> {
    const a=await this.db.get<Row>('SELECT a.*,v.hiring_manager_id FROM applications a JOIN vacancies v ON v.id=a.vacancy_id WHERE a.id=?',[id]);
    if(!a) throw new NotFoundException('Postulación no encontrada'); this.visible(user,a);
    return {name:String(a.cv_name),data:(await readFile(resolve(fileDir(),String(a.cv_file)))).toString('base64')};
  }
}
