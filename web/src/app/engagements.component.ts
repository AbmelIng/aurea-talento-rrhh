import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, AuditClient, Employee, Engagement } from './api.service';

@Component({
  selector: 'app-engagements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="engagements">
      <p class="eyebrow">OPERACIÓN DE AUDITORÍA</p><h1>Mis engagements</h1>
      <p>Consulta los clientes, visitas y equipos de los encargos en los que participas.</p>
      @if (message()) { <p class="success">{{message()}}</p> }
      @if (error()) { <p class="failure">{{error()}}</p> }
      @if (canManage()) {
        <div class="tools"><button (click)="section.set('clients')">Clientes</button><button (click)="section.set('engagements')">Encargos</button><button (click)="section.set('team')" [disabled]="!selected()">Asignar equipo</button></div>
      }
      @if (section() === 'clients' && canManage()) {
        <div class="panel"><h2>Catálogo de clientes</h2>
          <div class="grid">
            <label>Código<input [(ngModel)]="clientForm.code"></label><label>Razón social<input [(ngModel)]="clientForm.name"></label>
            <label>NIT o identificación fiscal<input [(ngModel)]="clientForm.tax_id"></label><label>Dirección<input [(ngModel)]="clientForm.address"></label>
            <label>Sedes<input [(ngModel)]="clientForm.offices"></label><label>Contacto principal<input [(ngModel)]="clientForm.contact_name"></label>
            <label>Teléfono<input [(ngModel)]="clientForm.phone"></label><label>Correo<input type="email" [(ngModel)]="clientForm.email"></label>
            <label>Estado<select [(ngModel)]="clientForm.active"><option [ngValue]="1">Activo</option><option [ngValue]="0">Inactivo</option></select></label>
          </div><button (click)="saveClient()" [disabled]="busy()">Guardar cliente</button>
          <div class="cards">@for (client of clients(); track client.id) { <button class="card" (click)="editClient(client)">{{client.code}} · {{client.name}} <small>{{client.active ? 'Activo' : 'Inactivo'}}</small></button> }</div>
        </div>
      }
      @if (section() === 'engagements' && canManage()) {
        <div class="panel"><h2>{{engagementId ? 'Editar encargo' : 'Nuevo encargo'}}</h2>
          <div class="grid">
            <label>Cliente<select [(ngModel)]="engagementForm.client_id"><option [ngValue]="0">Seleccionar</option>@for(c of activeClients();track c.id){<option [ngValue]="c.id">{{c.code}} · {{c.name}}</option>}</select></label>
            <label>Nombre del encargo<input [(ngModel)]="engagementForm.name"></label><label>Tipo de auditoría<input [(ngModel)]="engagementForm.audit_type"></label>
            <label>Período fiscal auditado<input [(ngModel)]="engagementForm.fiscal_period"></label><label>Fecha inicial<input type="date" [(ngModel)]="engagementForm.start_date"></label>
            <label>Fecha final<input type="date" [(ngModel)]="engagementForm.end_date"></label><label>Ubicación o modalidad<input [(ngModel)]="engagementForm.location"></label>
            <label>Socio<select [(ngModel)]="engagementForm.partner_id"><option [ngValue]="0">Seleccionar</option>@for(p of employees();track p.id){<option [ngValue]="p.id">{{p.first_name}} {{p.last_name}}</option>}</select></label>
            <label>Gerente<select [(ngModel)]="engagementForm.manager_id"><option [ngValue]="0">Seleccionar</option>@for(p of employees();track p.id){<option [ngValue]="p.id">{{p.first_name}} {{p.last_name}}</option>}</select></label>
            <label>Estado<select [(ngModel)]="engagementForm.status"><option>Planificación</option><option>Activo</option><option>Revisión</option><option>Cerrado</option></select></label>
          </div><button (click)="saveEngagement()" [disabled]="busy()">Guardar encargo</button><button class="secondary" (click)="resetEngagement()">Nuevo</button>
        </div>
      }
      @if (section() === 'team' && canManage() && selected()) {
        <div class="panel"><h2>Asignar equipo · {{selected()?.name}}</h2><div class="grid">
          <label>Empleado<select [(ngModel)]="assignmentForm.employee_id"><option [ngValue]="0">Seleccionar</option>@for(p of employees();track p.id){<option [ngValue]="p.id">{{p.first_name}} {{p.last_name}}</option>}</select></label>
          <label>Función<input [(ngModel)]="assignmentForm.team_role" placeholder="Auditor senior"></label>
          <label>Desde<input type="date" [(ngModel)]="assignmentForm.start_date"></label><label>Hasta<input type="date" [(ngModel)]="assignmentForm.end_date"></label>
          <label>Horas planificadas<input type="number" min="0" [(ngModel)]="assignmentForm.planned_hours"></label>
          <label>Instrucciones de llegada o contacto<textarea [(ngModel)]="assignmentForm.arrival_instructions"></textarea></label>
        </div><button (click)="assign()" [disabled]="busy()">Guardar asignación</button></div>
      }
      @if (upcoming().length) {<div class="panel"><h2>Próximas visitas</h2><div class="cards">@for(e of upcoming();track e.id){<button class="card" (click)="show(e.id)"><strong>{{e.my_start_date}} – {{e.my_end_date}}</strong><span>{{e.client_name}} · {{e.name}}</span><small>{{e.address || e.location}}</small></button>}</div></div>}
      <div class="panel"><h2>Encargos disponibles</h2>
        <div class="cards">@for(e of engagements();track e.id){<button class="card" (click)="show(e.id)"><strong>{{e.client_name}}</strong><span>{{e.name}}</span><small>{{e.start_date}} – {{e.end_date}} · {{e.status}}</small></button>} @empty {<p>Aún no tienes engagements asignados.</p>}</div>
      </div>
      @if (selected(); as e) {
        <div class="panel"><h2>{{e.name}}</h2><p><strong>{{e.client_name}}</strong> · {{e.audit_type}} · Período fiscal {{e.fiscal_period}}</p>
          <p>Visita: {{e.start_date}} – {{e.end_date}} · {{e.location}}</p>
          <p>Dirección: {{e.address || 'Por confirmar'}} · Sedes: {{e.offices || 'Por confirmar'}}</p>
          <p>Contacto: {{e.contact_name || 'Por confirmar'}} · {{e.phone || 'Sin teléfono'}} · {{e.email || 'Sin correo'}}</p>
          @if (e.team?.length) {<h3>Equipo y horas</h3><div class="table-wrap"><table><thead><tr><th>Persona</th><th>Función</th><th>Participación</th><th>Planificadas</th><th>Registradas</th><th>Instrucciones</th>@if(canManage()){<th></th>}</tr></thead><tbody>
            @for(a of e.team;track a.id){<tr><td>{{a.first_name}} {{a.last_name}}</td><td>{{a.team_role}}</td><td>{{a.start_date}} – {{a.end_date}}</td><td>{{a.planned_hours}}</td><td>{{a.registered_hours || 0}}</td><td>{{a.arrival_instructions || '—'}}</td>@if(canManage()){<td><button class="secondary" (click)="unassign(a.employee_id)">Retirar</button></td>}</tr>}
          </tbody></table></div>}
        </div>
      }
    </section>`,
  styles: [`
    .engagements{padding:24px;max-width:1400px;margin:auto}.eyebrow{color:#986500;font-weight:700;letter-spacing:.13em}h1{font:700 2.4rem Georgia;margin:.3rem 0}h2{font:700 1.5rem Georgia}h3{font:700 1.1rem Georgia}.panel{background:#fff;border:1px solid #e6d9bd;border-radius:14px;padding:22px;margin:20px 0}.tools,.cards{display:flex;gap:10px;flex-wrap:wrap;margin:16px 0}.cards .card{display:flex;flex-direction:column;align-items:start;min-width:210px;flex:1;text-align:left}.card small{color:#6b5d48}button{background:#f2db9d;border:1px solid #be8b23;border-radius:8px;padding:9px 13px;cursor:pointer;color:#33280e}button.secondary{background:#fff}button:disabled{opacity:.5;cursor:default}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin:18px 0}label{display:flex;flex-direction:column;gap:5px;font-weight:600}input,select,textarea{font:inherit;padding:9px;border:1px solid #c9bca6;border-radius:6px;width:100%;box-sizing:border-box}.success{color:#17623a}.failure{color:#a12020}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #ddd;padding:10px;text-align:left;vertical-align:top}
  `]
})
export class EngagementsComponent implements OnInit {
  private api = inject(ApiService);
  readonly error = signal(''); readonly message = signal(''); readonly busy = signal(false);
  readonly section = signal<'list'|'clients'|'engagements'|'team'>('list');
  readonly clients = signal<AuditClient[]>([]); readonly engagements = signal<Engagement[]>([]);
  readonly employees = signal<Employee[]>([]); readonly selected = signal<Engagement | null>(null);
  engagementId = 0; clientId = 0;
  clientForm = this.blankClient(); engagementForm = this.blankEngagement(); assignmentForm = this.blankAssignment();
  canManage() { return ['ADMIN','HR_ADMIN'].includes(this.api.user()?.role || ''); }
  activeClients() { return this.clients().filter(c => c.active || c.id === this.engagementForm.client_id); }
  upcoming() { const today=new Date().toISOString().slice(0,10);return this.engagements().filter(e=>e.my_start_date&&e.my_end_date&&e.my_end_date>=today&&e.status!=='Cerrado').sort((a,b)=>a.my_start_date!.localeCompare(b.my_start_date!)); }
  async ngOnInit() { await this.reload(); }
  private blankClient() { return {code:'',name:'',tax_id:'',address:'',offices:'',contact_name:'',phone:'',email:'',active:1}; }
  private blankEngagement() { return {client_id:0,name:'',audit_type:'',fiscal_period:'',start_date:'',end_date:'',location:'',partner_id:0,manager_id:0,status:'Planificación'}; }
  private blankAssignment() { return {employee_id:0,team_role:'',start_date:'',end_date:'',planned_hours:0,arrival_instructions:''}; }
  private async run(action:()=>Promise<void>, success:string) { this.error.set('');this.message.set('');this.busy.set(true);try{await action();this.message.set(success);}catch(e){this.error.set(e instanceof Error?e.message:String(e));}finally{this.busy.set(false);} }
  async reload(){await this.run(async()=>{this.engagements.set(await this.api.engagements());if(this.canManage()){const [clients,people]=await Promise.all([this.api.clients(),this.api.employees()]);this.clients.set(clients);this.employees.set(people);}},'');}
  async show(id:number){await this.run(async()=>{const e=await this.api.engagement(id);this.selected.set(e);if(this.canManage()){this.engagementId=e.id;this.engagementForm={client_id:e.client_id,name:e.name,audit_type:e.audit_type,fiscal_period:e.fiscal_period,start_date:e.start_date,end_date:e.end_date,location:e.location,partner_id:e.partner_id,manager_id:e.manager_id,status:e.status};this.assignmentForm={...this.blankAssignment(),start_date:e.start_date,end_date:e.end_date};}},'');}
  editClient(c:AuditClient){this.clientId=c.id;this.clientForm={code:c.code,name:c.name,tax_id:c.tax_id||'',address:c.address||'',offices:c.offices||'',contact_name:c.contact_name||'',phone:c.phone||'',email:c.email||'',active:c.active};}
  async saveClient(){await this.run(async()=>{await this.api.saveClient(this.clientForm,this.clientId||undefined);this.clients.set(await this.api.clients());this.clientId=0;this.clientForm=this.blankClient();},'Cliente guardado.');}
  resetEngagement(){this.engagementId=0;this.engagementForm=this.blankEngagement();}
  async saveEngagement(){await this.run(async()=>{const e=await this.api.saveEngagement(this.engagementForm,this.engagementId||undefined);this.selected.set(e);this.engagementId=e.id;this.engagements.set(await this.api.engagements());},'Encargo guardado.');}
  async assign(){const id=this.selected()?.id;if(!id)return;await this.run(async()=>{this.selected.set(await this.api.assignEngagement(id,this.assignmentForm));this.assignmentForm={...this.blankAssignment(),start_date:this.selected()!.start_date,end_date:this.selected()!.end_date};},'Asignación guardada.');}
  async unassign(employeeId:number){const id=this.selected()?.id;if(!id)return;await this.run(async()=>this.selected.set(await this.api.unassignEngagement(id,employeeId)),'Asignación retirada.');}
}
