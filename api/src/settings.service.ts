import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService, Row } from './database';
import { User } from './auth';

export const catalogCategories = ['job_title','area','service_line','office','employment_type'] as const;
export type CatalogCategory = typeof catalogCategories[number];
export const employmentStatuses = ['Activo','Inactivo','Suspendido'] as const;
export const accessRoles = ['EMPLOYEE','MANAGER','HR_ADMIN','ADMIN','PAYROLL'] as const;
export const requestFields = ['first_name','last_name','birth_date','dpi','nit','igss'] as const;

@Injectable()
export class SettingsService {
  constructor(private readonly db:DatabaseService) {}
  private admin(user:User):void { if(user.role!=='ADMIN') throw new ForbiddenException('Solo el administrador puede modificar la configuración'); }
  private catalogPermission(user:User):void { if(user.role!=='ADMIN'&&!Number(user.can_modify_catalogs)) throw new ForbiddenException('Sin permiso de modificación de catálogos'); }
  private category(value:string):CatalogCategory {
    if (!catalogCategories.includes(value as CatalogCategory)) throw new BadRequestException('Categoría inválida');
    return value as CatalogCategory;
  }
  async options(category:string, includeInactive=false):Promise<Row[]> {
    this.category(category);
    return this.db.all('SELECT id,category,name,active FROM catalog_options WHERE category=?'+(includeInactive?'':' AND active=1')+' ORDER BY name',[category]);
  }
  async allOptions(user:User):Promise<Row[]> {
    this.catalogPermission(user);
    return this.db.all('SELECT id,category,name,active FROM catalog_options ORDER BY category,name');
  }
  async resolve(category:CatalogCategory, value:unknown):Promise<{id:number;name:string}> {
    const id=Number(value);
    if(!Number.isInteger(id)||id<1) throw new BadRequestException(`Selecciona ${category} del catálogo`);
    const row=await this.db.get<{id:number;name:string;active:number}>('SELECT id,name,active FROM catalog_options WHERE id=? AND category=?',[id,category]);
    if(!row||!Number(row.active)) throw new BadRequestException(`La opción de ${category} no existe o está inactiva`);
    return {id:Number(row.id),name:row.name};
  }
  async create(user:User,category:string,name:unknown):Promise<Row> {
    this.catalogPermission(user); this.category(category);
    const max=category==='job_title'?140:category==='employment_type'?80:100;
    if(typeof name!=='string'||!name.trim()||name.trim().length>max) throw new BadRequestException('Nombre inválido');
    const clean=name.trim();
    if(await this.db.get('SELECT id FROM catalog_options WHERE category=? AND name=?',[category,clean])) throw new ConflictException('La opción ya existe');
    const id=await this.db.run('INSERT INTO catalog_options (category,name,active) VALUES (?,?,1)',[category,clean]);
    return (await this.db.get('SELECT * FROM catalog_options WHERE id=?',[id]))!;
  }
  async update(user:User,id:number,input:{name?:unknown;active?:unknown}):Promise<Row> {
    this.catalogPermission(user);
    const existing=await this.db.get<Row>('SELECT * FROM catalog_options WHERE id=?',[id]);
    if(!existing) throw new NotFoundException('Opción no encontrada');
    if(input.name!==undefined) {
      const category=String(existing.category);
      const max=category==='job_title'?140:category==='employment_type'?80:100;
      if(typeof input.name!=='string'||!input.name.trim()||input.name.trim().length>max) throw new BadRequestException('Nombre inválido');
      const duplicate=await this.db.get('SELECT id FROM catalog_options WHERE category=? AND name=? AND id<>?',[String(existing.category),input.name.trim(),id]);
      if(duplicate) throw new ConflictException('La opción ya existe');
      await this.db.run('UPDATE catalog_options SET name=? WHERE id=?',[input.name.trim(),id]);
      const field=String(existing.category);
      if(catalogCategories.includes(field as CatalogCategory)) await this.db.run(`UPDATE employees SET ${field}=? WHERE ${field}_id=?`,[input.name.trim(),id]);
      // El historial conserva el nombre vigente al momento del cambio.
    }
    if(input.active!==undefined) {
      if(typeof input.active!=='boolean') throw new BadRequestException('Estado inválido');
      await this.db.run('UPDATE catalog_options SET active=? WHERE id=?',[input.active?1:0,id]);
    }
    return (await this.db.get('SELECT * FROM catalog_options WHERE id=?',[id]))!;
  }
  async codeConfig(user:User):Promise<Row> { this.admin(user); return (await this.db.get('SELECT * FROM employee_code_config WHERE id=1'))!; }
  async updateCodeConfig(user:User,input:Record<string,unknown>):Promise<Row> {
    this.admin(user);
    const prefix=String(input.prefix??'').trim(),separator=String(input.separator??'');
    const digits=Number(input.digits),next=Number(input.next_number);
    if(!/^[A-Za-z0-9_-]{1,20}$/.test(prefix)||!/^[^A-Za-z0-9]{0,5}$/.test(separator)||!Number.isInteger(digits)||digits<1||digits>12||!Number.isSafeInteger(next)||next<1||`${prefix}${separator}${String(next).padStart(digits,'0')}`.length>20)
      throw new BadRequestException('Formato de código inválido');
    await this.db.transaction(async tx=>{
      const current=await tx.get<{next_number:number}>('SELECT next_number FROM employee_code_config WHERE id=1'+(process.env.DB_DRIVER==='mysql'?' FOR UPDATE':''));
      if(!current||next<Number(current.next_number)) throw new BadRequestException('No se puede retroceder la numeración');
      await tx.run('UPDATE employee_code_config SET prefix=?,separator=?,digits=?,next_number=? WHERE id=1',[prefix,separator,digits,next]);
    });
    return this.codeConfig(user);
  }
  async formOptions(user:User):Promise<Record<string,unknown>> {
    const catalogs:Record<string,Row[]>={};
    for(const category of catalogCategories) catalogs[category]=await this.options(category,user.role==='ADMIN'||Boolean(Number(user.can_modify_catalogs))||user.role==='HR_ADMIN');
    return {catalogs,statuses:employmentStatuses,roles:accessRoles,requestFields};
  }
}
