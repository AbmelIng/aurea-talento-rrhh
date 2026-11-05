import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from './api.service';

@Component({selector:'app-careers',imports:[CommonModule,FormsModule],styleUrl:'./mvp.css',template:`
<main class="mvp-public">
  <header class="mvp-public-header"><strong>A✦ Aurea Talento</strong><span>Oportunidades profesionales · Guatemala</span><a href="/">Acceso del personal</a></header>
  <div class="mvp-public-body"><p class="mvp-kicker">ÚNETE A LA FIRMA</p><h1>Tu siguiente paso profesional</h1><p>Consulta nuestras vacantes y envía tu postulación.</p>
  @if(error()){<p class="mvp-error" role="alert">{{error()}}</p>}
  @if(sent()){<p class="mvp-success" role="status">Postulación recibida. Guarda el nombre de la vacante para tus consultas.</p>}
  <div class="mvp-grid">
    <section>
      @for(job of jobs();track job.id){<button type="button" class="mvp-card mvp-job" [class.selected]="selected()?.id===job.id" (click)="select(job)"><b>{{job.title}}</b><span>{{job.area}} · {{job.level}} · {{job.municipality}}, {{job.department}}</span><small>{{job.modality}} · {{job.employment_type}} · Hasta {{job.deadline}}</small></button>}
      @if(!jobs().length){<div class="mvp-card">Por el momento no hay vacantes abiertas.</div>}
    </section>
    @if(selected();as job){<section class="mvp-card"><p class="mvp-kicker">VACANTE</p><h2>{{job.title}}</h2><p>{{job.description}}</p><h3>Requisitos</h3><p>{{job.requirements}}</p><hr><h3>Postulación</h3>
      <form (ngSubmit)="apply()" class="mvp-form">
        <label>Nombre completo *<input name="full_name" [(ngModel)]="form.full_name" required></label><label>Correo *<input name="email" type="email" [(ngModel)]="form.email" required></label><label>Teléfono *<input name="phone" [(ngModel)]="form.phone" required></label>
        <label>Departamento de residencia *<input name="department" [(ngModel)]="form.department" required></label><label>Municipio de residencia *<input name="municipality" [(ngModel)]="form.municipality" required></label><label>Formación académica *<input name="education" [(ngModel)]="form.education" required></label>
        <label>Expectativa salarial (GTQ) *<input name="salary" [(ngModel)]="form.salary_expectation" required></label><label>Disponibilidad para iniciar *<input name="available" type="date" [(ngModel)]="form.available_from" required></label><label>¿Cómo te enteraste? *<input name="source" [(ngModel)]="form.source" required></label>
        <label>Currículum PDF, DOC o DOCX (máximo 5 MB) *<input name="cv" type="file" accept=".pdf,.doc,.docx" (change)="chooseFile($event)" required></label>
        @for(q of questions();track q.id){<label>{{q.title}} {{q.required?'*':''}}@if(q.type==='short'){<input [name]="q.id" [(ngModel)]="form.answers[q.id]" [required]="q.required">}@else{<select [name]="q.id" [(ngModel)]="form.answers[q.id]" [required]="q.required"><option value="">Selecciona</option>@for(option of q.type==='yesno'?['Sí','No']:q.options;track option){<option [value]="option">{{option}}</option>}</select>}</label>}
        <label class="mvp-check"><input name="consent_process" type="checkbox" [(ngModel)]="form.consent_process" required>Acepto el tratamiento de mis datos para esta selección.</label>
        <label class="mvp-check"><input name="consent_future" type="checkbox" [(ngModel)]="form.consent_future">Autorizo conservar mis datos para futuras vacantes.</label>
        <button type="submit" class="mvp-button" [disabled]="busy()">{{busy()?'Enviando…':'Enviar postulación'}}</button>
      </form>
    </section>}
  </div></div>
</main>`})
export class CareersComponent implements OnInit {
  readonly api=inject(ApiService);
  readonly jobs=signal<any[]>([]); readonly selected=signal<any|null>(null); readonly error=signal(''); readonly sent=signal(false); readonly busy=signal(false);
  form:any={full_name:'',email:'',phone:'',department:'',municipality:'',education:'',salary_expectation:'',available_from:'',source:'',consent_process:false,consent_future:false,cv_name:'',cv_base64:'',answers:{}};
  questions():any[]{try{return JSON.parse(this.selected()?.questions_json||'[]');}catch{return [];}}
  async ngOnInit(){try{this.jobs.set(await this.api.request<any[]>('GET','/careers'));const id=Number(new URLSearchParams(location.search).get('id'));this.select(this.jobs().find(job=>job.id===id)||this.jobs()[0]||null);}catch(e){this.error.set(String(e));}}
  select(job:any){this.selected.set(job);this.sent.set(false);}
  async chooseFile(event:Event){const file=(event.target as HTMLInputElement).files?.[0];if(!file)return;if(file.size>5*1024*1024){this.error.set('El archivo supera 5 MB');return;}this.form['cv_name']=file.name;this.form['cv_base64']=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]||'');reader.onerror=()=>reject(new Error('No se pudo leer el archivo'));reader.readAsDataURL(file);});}
  async apply(){if(!this.selected()||!this.form['consent_process']||!this.form['cv_base64']){this.error.set('Completa el consentimiento y adjunta tu CV.');return;}this.error.set('');this.busy.set(true);try{await this.api.request('POST',`/careers/${this.selected().id}/apply`,this.form);this.sent.set(true);this.form={full_name:'',email:'',phone:'',department:'',municipality:'',education:'',salary_expectation:'',available_from:'',source:'',consent_process:false,consent_future:false,cv_name:'',cv_base64:'',answers:{}};}catch(e){this.error.set(e instanceof Error?e.message:String(e));}finally{this.busy.set(false);}}
}
