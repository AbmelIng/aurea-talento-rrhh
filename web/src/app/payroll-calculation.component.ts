import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, Employee, PayAdjustment, PayCondition, PayrollPeriod, PayrollRun, PayrollRunHistory } from './api.service';

@Component({
  selector:'app-payroll-calculation',
  imports:[CommonModule,FormsModule],
  template:`
    <section class="calc-page">
      <p class="eyebrow">NÓMINA · CÁLCULO POR PERÍODO</p><h1>Condiciones y borradores</h1>
      <p>Los salarios y las tarifas se calculan en quetzales. Los servicios profesionales se muestran como honorarios separados y no generan boleta salarial.</p>
      @if (error()) { <div class="message error" role="alert">{{error()}}</div> }
      @if (notice()) { <div class="message success" role="status">{{notice()}}</div> }
      @if (busy()) { <p>Procesando…</p> }
      @if (isPayroll) {
        <section class="card"><h2>Condición de pago por persona</h2>
          <div class="grid">
            <label>Persona<select [(ngModel)]="employeeId" (ngModelChange)="loadConditions()">@for(e of employees();track e.id){<option [ngValue]="e.id">{{e.code}} · {{e.first_name}} {{e.last_name}}</option>}</select></label>
            <label>Modalidad<select [(ngModel)]="condition.kind"><option value="SALARIO_MENSUAL">Salario mensual</option><option value="TARIFA_HORA">Tarifa por hora</option><option value="SERVICIOS_PROFESIONALES">Servicios profesionales por hora</option></select></label>
            <label>Importe en GTQ<input type="number" min="0.01" step="0.01" [(ngModel)]="condition.amount"></label>
            <label>Horas de jornada diaria<input type="number" min="0.25" max="24" step="0.25" [(ngModel)]="condition.daily_hours"></label>
            <label>Vigente desde<input type="date" [(ngModel)]="condition.effective_from"></label>
            <label>Vigente hasta (opcional)<input type="date" [(ngModel)]="condition.effective_to"></label>
          </div><button type="button" (click)="saveCondition()" [disabled]="busy()">Guardar condición</button>
          <div class="scroll"><table><thead><tr><th>Modalidad</th><th>Importe</th><th>Vigencia</th><th>Acción</th></tr></thead><tbody>
            @for(c of conditions();track c.id){<tr><td>{{label(c.kind)}}</td><td>Q {{c.amount | number:'1.2-2'}}</td><td>{{c.effective_from}} a {{c.effective_to || 'sin cierre'}}</td><td>@if(!c.effective_to){<input type="date" [(ngModel)]="closeDates[c.id]" aria-label="Último día de vigencia"><button type="button" (click)="closeCondition(c)">Cerrar vigencia</button>}</td></tr>}
          </tbody></table></div>
        </section>
      }
      <section class="card"><h2>Período y vista previa</h2><label>Período<select [(ngModel)]="periodId" (ngModelChange)="loadPeriod()">@for(p of periods();track p.id){<option [ngValue]="p.id">{{p.label}} · {{p.start_date}} a {{p.end_date}}</option>}</select></label>
        @if(isPayroll){
          <h3>Bono o ajuste</h3><div class="grid">
            <label>Persona<select [(ngModel)]="adjustment.employee_id">@for(e of employees();track e.id){<option [ngValue]="e.id">{{e.code}} · {{e.first_name}} {{e.last_name}}</option>}</select></label>
            <label>Tipo<select [(ngModel)]="adjustment.kind"><option value="BONO">Bono</option><option value="AJUSTE_POSITIVO">Ajuste positivo</option><option value="DEDUCCION">Deducción</option><option value="IMPUESTO">Impuesto ingresado por Nómina</option></select></label>
            <label>Importe GTQ<input type="number" min="0.01" step="0.01" [(ngModel)]="adjustment.amount"></label>
            <label>Motivo o fuente<input [(ngModel)]="adjustment.reason"></label>
          </div><button type="button" (click)="saveAdjustment()" [disabled]="busy() || !periodId">Registrar ajuste</button>
          <div class="adjustments">@for(a of adjustments();track a.id){<p>{{a.first_name}} {{a.last_name}} · {{a.kind}} · Q {{a.amount | number:'1.2-2'}} · {{a.reason}}</p>}</div>
          <div class="actions"><button type="button" (click)="generate()" [disabled]="busy() || !periodId">Generar / recalcular todos los borradores</button>@if(run()?.status==='Borrador'){<button type="button" (click)="submit()" [disabled]="busy()">Enviar a aprobación</button>}@if(run()?.status==='Aprobado'){<button type="button" (click)="publish()" [disabled]="busy()">Publicar boletas aprobadas</button>}</div>
        }
        @if(run();as r){<p class="run-status"><b>Estado:</b> {{r.status}} · {{r.items.length}} personas · Preparado por usuario {{r.created_by}}</p>
          @if(isAdmin && r.status==='En revisión'){<div class="actions"><button type="button" (click)="approve(true)" [disabled]="busy() || r.created_by===api.user()?.id">Aprobar cálculo</button><button type="button" (click)="approve(false)" [disabled]="busy()">Devolver a borrador</button></div>}
          <div class="scroll"><table><thead><tr><th>Persona</th><th>Condición</th><th>Horas aprobadas</th><th>Ausencia pagada</th><th>Ausencia no pagada</th><th>Base</th><th>Bonos</th><th>Ajustes</th><th>Deducciones</th><th>Bruto</th><th>Neto</th></tr></thead><tbody>
          @for(i of r.items;track i.id){<tr><td>{{i.code}} · {{i.first_name}} {{i.last_name}}</td><td>{{label(i.kind)}}</td><td>{{i.approved_hours | number:'1.2-2'}}</td><td>{{i.paid_leave_hours | number:'1.2-2'}}</td><td>{{i.unpaid_leave_hours | number:'1.2-2'}}</td><td>Q {{i.base_amount | number:'1.2-2'}}</td><td>Q {{i.bonuses | number:'1.2-2'}}</td><td>Q {{i.adjustments | number:'1.2-2'}}</td><td>Q {{i.deductions | number:'1.2-2'}}</td><td>Q {{i.gross | number:'1.2-2'}}</td><td>Q {{i.net | number:'1.2-2'}}</td></tr>}
          </tbody></table></div>
          <p>Impuestos y deducciones se capturan como ajustes. Este módulo no determina obligaciones tributarias ni realiza transferencias bancarias.</p>
        } @else {<p>Aún no hay un cálculo generado para este período.</p>}
      </section>
      <section class="card"><h2>Historial de cálculos y pagos</h2><p>Los períodos publicados conservan el detalle calculado y las boletas de empleados. Seleccione uno para consultar su vista previa histórica.</p>
        <div class="scroll"><table><thead><tr><th>Período</th><th>Estado</th><th>Personas</th><th>Neto de empleados</th><th>Honorarios profesionales</th><th></th></tr></thead><tbody>
          @for(h of history();track h.id){<tr><td>{{h.label}}</td><td>{{h.status}}</td><td>{{h.people_count}}</td><td>Q {{h.employee_net | number:'1.2-2'}}</td><td>Q {{h.professional_fees | number:'1.2-2'}}</td><td><button type="button" (click)="viewHistory(h.period_id)">Ver detalle</button></td></tr>}
        </tbody></table></div>
      </section>
      @if(isAdmin){<section class="card"><h2>Tratamiento de ausencias</h2><p>Defina si cada tipo de ausencia conserva el pago. El valor inicial es «Pagada».</p><div class="grid">@for(t of leaveTypes();track t.id){<label>{{t.name}}<select [ngModel]="t.pay_treatment" (ngModelChange)="setLeaveTreatment(t.id,$event)"><option>Pagada</option><option>No pagada</option></select></label>}</div></section>}
    </section>`,
  styles:[`:host{display:block}.calc-page{max-width:1320px;margin:auto}.calc-page h1{font:700 36px Georgia,serif;margin:6px 0}.calc-page h2{font:700 23px Georgia,serif}.calc-page p{color:#665b49}.eyebrow{font-size:11px;font-weight:800;letter-spacing:.15em;color:#98721b}.card{background:white;border:1px solid #e4d7b5;border-radius:12px;padding:24px;margin:22px 0}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px;margin:18px 0}label{display:grid;gap:6px;font-size:12px;font-weight:700}input,select{padding:10px;border:1px solid #d4c7aa;border-radius:6px;width:100%;min-width:0}button{background:#d8b54c;color:#231b0a;border:1px solid #9e7b23;border-radius:7px;padding:9px 13px;font-weight:700;cursor:pointer}button:disabled{opacity:.5}.actions{display:flex;gap:10px;flex-wrap:wrap;margin:16px 0}.scroll{overflow-x:auto;margin-top:20px}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border-bottom:1px solid #e5dbc7;text-align:left;padding:10px;white-space:nowrap}.adjustments{max-height:160px;overflow:auto}.adjustments p{font-size:12px;margin:5px 0}.message{padding:12px;border-radius:6px;margin:12px 0}.error{background:#ffe6e1;color:#7b261c}.success{background:#e8f3e8;color:#245326}.run-status{background:#faf3dc;padding:10px;border-radius:6px}@media(max-width:750px){.grid{grid-template-columns:1fr}.card{padding:16px}}`],
})
export class PayrollCalculationComponent implements OnInit {
  readonly api=inject(ApiService);
  readonly periods=signal<PayrollPeriod[]>([]);readonly employees=signal<Employee[]>([]);readonly conditions=signal<PayCondition[]>([]);
  readonly adjustments=signal<PayAdjustment[]>([]);readonly run=signal<PayrollRun|null>(null);readonly leaveTypes=signal<{id:number;name:string;pay_treatment:string}[]>([]);
  readonly history=signal<PayrollRunHistory[]>([]);
  readonly busy=signal(false);readonly error=signal('');readonly notice=signal('');
  periodId=0;employeeId=0;closeDates:Record<number,string>={};
  condition:{kind:PayCondition['kind'];amount:number;daily_hours:number;effective_from:string;effective_to:string}={kind:'SALARIO_MENSUAL',amount:0,daily_hours:8,effective_from:'',effective_to:''};
  adjustment={employee_id:0,kind:'BONO',amount:0,reason:''};
  get isPayroll(){return this.api.user()?.role==='PAYROLL';}get isAdmin(){return this.api.user()?.role==='ADMIN';}
  async ngOnInit(){try{this.periods.set(await this.api.periods());this.history.set(await this.api.payrollRunHistory());this.periodId=this.periods()[0]?.id||0;if(this.isPayroll){this.employees.set(await this.api.payrollEmployees());this.employeeId=this.employees()[0]?.id||0;this.adjustment.employee_id=this.employeeId;await this.loadConditions();}if(this.isAdmin)this.leaveTypes.set(await this.api.request('GET','/leave/types'));await this.loadPeriod();}catch(e){this.showError(e);}}
  label(kind:string){return {SALARIO_MENSUAL:'Salario mensual',TARIFA_HORA:'Tarifa por hora',SERVICIOS_PROFESIONALES:'Servicios profesionales'}[kind as PayCondition['kind']]||kind;}
  private showError(e:unknown){this.error.set(e instanceof Error?e.message:String(e));this.busy.set(false);}
  private async execute(action:()=>Promise<void>,message:string){this.error.set('');this.notice.set('');this.busy.set(true);try{await action();this.notice.set(message);}catch(e){this.showError(e);}finally{this.busy.set(false);}}
  async loadConditions(){if(this.employeeId)this.conditions.set(await this.api.payConditions(this.employeeId));}
  async loadPeriod(){if(!this.periodId){this.run.set(null);return;}try{this.run.set(await this.api.payrollRun(this.periodId));if(this.isPayroll)this.adjustments.set(await this.api.payAdjustments(this.periodId));}catch(e){this.showError(e);}}
  async viewHistory(periodId:number){this.periodId=periodId;await this.loadPeriod();window.scrollTo({top:0,behavior:'smooth'});}
  saveCondition(){return this.execute(async()=>{await this.api.addPayCondition({employee_id:this.employeeId,...this.condition,effective_to:this.condition.effective_to||null});await this.loadConditions();},'Condición de pago registrada.');}
  closeCondition(c:PayCondition){return this.execute(async()=>{await this.api.closePayCondition(c.id,this.closeDates[c.id]);await this.loadConditions();},'Vigencia cerrada.');}
  saveAdjustment(){return this.execute(async()=>{await this.api.addPayAdjustment({period_id:this.periodId,...this.adjustment});this.adjustments.set(await this.api.payAdjustments(this.periodId));},'Ajuste registrado. Recalcule el borrador para incluirlo.');}
  generate(){return this.execute(async()=>{this.run.set(await this.api.generatePayrollRun(this.periodId));this.history.set(await this.api.payrollRunHistory());},'Borradores calculados. Revise los importes antes de enviar.');}
  submit(){return this.execute(async()=>{this.run.set(await this.api.submitPayrollRun(this.periodId));this.history.set(await this.api.payrollRunHistory());},'Cálculo enviado a aprobación.');}
  approve(approve:boolean){return this.execute(async()=>{this.run.set(await this.api.approvePayrollRun(this.periodId,approve));this.history.set(await this.api.payrollRunHistory());},approve?'Cálculo aprobado.':'Cálculo devuelto.');}
  publish(){return this.execute(async()=>{this.run.set(await this.api.publishPayrollRun(this.periodId));this.history.set(await this.api.payrollRunHistory());},'Boletas de empleados publicadas. Los honorarios permanecen separados.');}
  setLeaveTreatment(id:number,pay_treatment:string){return this.execute(async()=>{this.leaveTypes.set(await this.api.request('PATCH',`/leave/types/${id}/pay-treatment`,{pay_treatment}));},'Tratamiento actualizado. Recalcule cualquier borrador afectado.');}
}
