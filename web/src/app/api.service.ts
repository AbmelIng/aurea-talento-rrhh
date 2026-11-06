import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type Role = 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN' | 'ADMIN' | 'PAYROLL' | 'PARTNER' | 'LEGAL' | 'COMPLIANCE';
export interface User { id: number; employee_id: number; email: string; role: Role; can_modify_catalogs:number; last_login?: string; }
export interface Employee {
  id: number; code: string; first_name: string; last_name: string; preferred_name?: string | null;
  work_email: string; personal_email?: string | null; phone?: string | null; address?: string | null;
  emergency_name?: string | null; emergency_phone?: string | null; birth_date?: string | null;
  dpi?: string | null; nit?: string | null; igss?: string | null; hire_date: string;
  job_title: string; area: string; service_line?: string | null; office: string;
  job_title_id?:number|null;area_id?:number|null;service_line_id?:number|null;office_id?:number|null;employment_type_id?:number|null;
  employment_type: string; status: string; manager_id?: number | null;
  manager_first_name?: string | null; manager_last_name?: string | null; role?: Role;
  can_modify_catalogs?:number;
}
export interface ChangeRequest { id: number; employee_id: number; field: string; proposed_value: string; previous_value?: string | null; status: string; created_at: string; first_name?: string; last_name?: string; }
export interface JobHistory { id: number; job_title: string; area: string; service_line?: string; office: string; employment_type: string; status: string; effective_date: string; }
export interface AccessLevel { role: Role; label: string; total: number; }
export interface Account { company: string; country: string; package: string; users: number; }
export interface AuditEntry { id: number; action: string; employee_id?: number; details: string; created_at: string; }
export interface PayrollPeriod { id: number; label: string; start_date: string; end_date: string; submit_deadline: string; pay_date: string; status: string; }
export interface TimeEntry { id: number; work_date: string; hours: number; note?: string; engagement_id?:number|null;engagement_name?:string|null; }
export interface AuditClient {id:number;code:string;name:string;tax_id?:string;address?:string;offices?:string;contact_name?:string;phone?:string;email?:string;active:number;}
export interface Engagement {id:number;client_id:number;client_code:string;client_name:string;name:string;audit_type:string;fiscal_period:string;start_date:string;end_date:string;my_start_date?:string;my_end_date?:string;location:string;address?:string;offices?:string;contact_name?:string;phone?:string;email?:string;partner_id:number;manager_id:number;status:string;team?:EngagementAssignment[];}
export interface EngagementAssignment {id:number;employee_id:number;first_name:string;last_name:string;code:string;team_role:string;start_date:string;end_date:string;planned_hours:number;registered_hours:number;approved_hours:number;arrival_instructions?:string;}
export interface Timesheet { period: PayrollPeriod; sheet: { id?: number; employee_id: number; period_id: number; status: string; review_comment?: string }; entries: TimeEntry[]; total_hours: number; }
export interface ReviewSheet { id: number; period_id: number; employee_id: number; status: string; period_label: string; first_name: string; last_name: string; code: string; total_hours: number; }
export interface PayItem { name: string; amount: number; }
export interface PayReceipt { id: number; employee_id: number; period_id: number; first_name: string; last_name: string; code: string; period_label: string; start_date: string; end_date: string; pay_date: string; currency: string; gross: number; taxes: number; deductions: number; net: number; earnings: PayItem[]; tax_items: PayItem[]; deduction_items: PayItem[]; status: string; source_note: string; version: number; }
export interface PayrollIssue { id: number; employee_id: number; period_id: number; pay_record_id?: number; first_name: string; last_name: string; period_label: string; message: string; status: string; response?: string; created_at: string; }
export interface CatalogOption { id:number; category:string; name:string; active:number; }
export interface FormOptions { catalogs:Record<string,CatalogOption[]>; statuses:string[]; roles:Role[]; requestFields:string[]; }
export interface CodeConfig { id:number;prefix:string;separator:string;digits:number;next_number:number; }
export interface PayCondition { id:number;employee_id:number;kind:'SALARIO_MENSUAL'|'TARIFA_HORA'|'SERVICIOS_PROFESIONALES';amount:number;daily_hours:number;effective_from:string;effective_to:string|null; }
export interface PayAdjustment { id:number;employee_id:number;period_id:number;kind:string;amount:number;reason:string;first_name:string;last_name:string; }
export interface PayrollRunItem { id:number;employee_id:number;code:string;first_name:string;last_name:string;kind:string;base_amount:number;approved_hours:number;paid_leave_hours:number;unpaid_leave_hours:number;bonuses:number;adjustments:number;deductions:number;gross:number;net:number;detail:{conditions:PayCondition[];adjustments:PayAdjustment[];manual_taxes:number;manual_deductions:number;professional_services:boolean}; }
export interface PayrollRun { id:number;period_id:number;status:string;created_by:number;created_at:string;approved_by?:number;items:PayrollRunItem[]; }
export interface PayrollRunHistory { id:number;period_id:number;status:string;label:string;start_date:string;end_date:string;people_count:number;employee_net:number;professional_fees:number;created_at:string;approved_at?:string;published_at?:string; }

@Injectable({ providedIn: 'root' })
export class ApiService {
  readonly user = signal<User | null>(null);
  private readonly base = ['localhost','127.0.0.1'].includes(window.location.hostname)
    ? 'http://127.0.0.1:3001/api' : `${window.location.origin}/api`;
  private token = sessionStorage.getItem('aurea_token') || '';
  constructor(private readonly http: HttpClient) {}

  async request<T>(method: 'GET' | 'POST' | 'PATCH', path: string, body?: unknown): Promise<T> {
    try {
      return await firstValueFrom(this.http.request<T>(method, `${this.base}${path}`, {
        body, headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      }));
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401 && path !== '/auth/login') this.logout();
        const message = error.error?.message;
        throw new Error(Array.isArray(message) ? message.join(', ') : message || (error.status === 0 ? 'No se puede conectar a la API local. Inicia el servidor NestJS.' : 'No se pudo completar la operación.'));
      }
      throw error;
    }
  }

  async restore(): Promise<User | null> {
    if (!this.token) return null;
    try { const user = await this.request<User>('GET', '/auth/me'); this.user.set(user); return user; }
    catch { this.logout(); return null; }
  }
  async login(email: string, password: string): Promise<User> {
    const result = await this.request<{ token: string; user: User }>('POST', '/auth/login', { email, password });
    this.token = result.token;
    sessionStorage.setItem('aurea_token', this.token);
    this.user.set(result.user);
    return result.user;
  }
  changePassword(current:string,next:string):Promise<{changed:boolean}> { return this.request('POST','/auth/password',{current,next}); }
  logout(): void { this.token = ''; sessionStorage.removeItem('aurea_token'); this.user.set(null); }

  formOptions():Promise<FormOptions> { return this.request('GET','/settings/form-options'); }
  catalogs():Promise<CatalogOption[]> { return this.request('GET','/settings/catalogs'); }
  createCatalog(category:string,name:string):Promise<CatalogOption> { return this.request('POST',`/settings/catalogs/${category}`,{name}); }
  updateCatalog(id:number,data:{name?:string;active?:boolean}):Promise<CatalogOption> { return this.request('PATCH',`/settings/catalogs/${id}`,data); }
  codeConfig():Promise<CodeConfig> { return this.request('GET','/settings/employee-codes'); }
  updateCodeConfig(data:CodeConfig):Promise<CodeConfig> { return this.request('PATCH','/settings/employee-codes',data); }

  me(): Promise<Employee> { return this.request('GET', '/employees/me'); }
  employees(search = '', status = 'Activo'): Promise<Employee[]> { return this.request('GET', `/employees?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`); }
  employee(id: number): Promise<Employee> { return this.request('GET', `/employees/${id}`); }
  history(id: number): Promise<JobHistory[]> { return this.request('GET', `/employees/${id}/history`); }
  createEmployee(data: Record<string, unknown>): Promise<{ employee: Employee; temporaryPassword: string }> { return this.request('POST', '/employees', data); }
  updateEmployee(id: number, data: Record<string, unknown>): Promise<Employee> { return this.request('PATCH', `/employees/${id}`, data); }
  updateMe(data: Record<string, unknown>): Promise<Employee> { return this.request('PATCH', '/employees/me', data); }
  requests(): Promise<ChangeRequest[]> { return this.request('GET', '/change-requests'); }
  requestChange(field: string, proposed_value: string): Promise<ChangeRequest> { return this.request('POST', '/change-requests', { field, proposed_value }); }
  resolveRequest(id: number, approve: boolean): Promise<ChangeRequest> { return this.request('PATCH', `/change-requests/${id}`, { approve }); }
  account(): Promise<Account> { return this.request('GET', '/settings/account'); }
  levels(): Promise<AccessLevel[]> { return this.request('GET', '/settings/access-levels'); }
  changeRole(id: number, role: Role): Promise<Employee> { return this.request('PATCH', `/employees/${id}/role`, { role }); }
  changeCatalogPermission(id:number,enabled:boolean):Promise<Employee> { return this.request('PATCH',`/employees/${id}/catalog-permission`,{enabled}); }
  audit(): Promise<AuditEntry[]> { return this.request('GET', '/settings/audit'); }
  periods(): Promise<PayrollPeriod[]> { return this.request('GET', '/payroll/periods'); }
  createPeriod(data: Record<string, unknown>): Promise<PayrollPeriod> { return this.request('POST', '/payroll/periods', data); }
  updatePeriod(id: number, data: Record<string, unknown>): Promise<PayrollPeriod> { return this.request('PATCH', `/payroll/periods/${id}`, data); }
  payrollEmployees(): Promise<Employee[]> { return this.request('GET', '/payroll/employees'); }
  timesheet(periodId: number, employeeId?: number): Promise<Timesheet> { return this.request('GET', `/payroll/timesheet?period=${periodId}${employeeId ? `&employee=${employeeId}` : ''}`); }
  saveTimeEntry(data: Record<string, unknown>): Promise<Timesheet> { return this.request('POST', '/payroll/time-entry', data); }
  submitTimesheet(periodId: number): Promise<Timesheet> { return this.request('POST', '/payroll/timesheet/submit', { period_id: periodId }); }
  reviewQueue(): Promise<ReviewSheet[]> { return this.request('GET', '/payroll/review'); }
  reviewTimesheet(id: number, approve: boolean, comment: string): Promise<Timesheet> { return this.request('PATCH', `/payroll/timesheets/${id}/review`, { approve, comment }); }
  receipts(employeeId?: number): Promise<PayReceipt[]> { return this.request('GET', `/payroll/receipts${employeeId ? `?employee=${employeeId}` : ''}`); }
  receipt(id: number): Promise<PayReceipt> { return this.request('GET', `/payroll/receipts/${id}`); }
  saveReceipt(data: Record<string, unknown>): Promise<PayReceipt> { return this.request('POST', '/payroll/receipts', data); }
  publishReceipt(id: number): Promise<PayReceipt> { return this.request('PATCH', `/payroll/receipts/${id}/publish`, {}); }
  issues(): Promise<PayrollIssue[]> { return this.request('GET', '/payroll/issues'); }
  reportIssue(data: Record<string, unknown>): Promise<PayrollIssue> { return this.request('POST', '/payroll/issues', data); }
  resolveIssue(id: number, response: string): Promise<PayrollIssue> { return this.request('PATCH', `/payroll/issues/${id}`, { response }); }
  clients():Promise<AuditClient[]>{return this.request('GET','/clients');}
  saveClient(data:Record<string,unknown>,id?:number):Promise<AuditClient>{return this.request(id?'PATCH':'POST',id?`/clients/${id}`:'/clients',data);}
  engagements():Promise<Engagement[]>{return this.request('GET','/engagements');}
  engagement(id:number):Promise<Engagement>{return this.request('GET',`/engagements/${id}`);}
  saveEngagement(data:Record<string,unknown>,id?:number):Promise<Engagement>{return this.request(id?'PATCH':'POST',id?`/engagements/${id}`:'/engagements',data);}
  assignEngagement(id:number,data:Record<string,unknown>):Promise<Engagement>{return this.request('POST',`/engagements/${id}/assignments`,data);}
  unassignEngagement(id:number,employeeId:number):Promise<Engagement>{return this.request('PATCH',`/engagements/${id}/assignments/${employeeId}/deactivate`,{});}
  payConditions(employeeId:number):Promise<PayCondition[]> { return this.request('GET',`/payroll/conditions/${employeeId}`); }
  addPayCondition(data:Record<string,unknown>):Promise<PayCondition> { return this.request('POST','/payroll/conditions',data); }
  closePayCondition(id:number,effective_to:string):Promise<PayCondition> { return this.request('PATCH',`/payroll/conditions/${id}/close`,{effective_to}); }
  payAdjustments(periodId:number):Promise<PayAdjustment[]> { return this.request('GET',`/payroll/adjustments/${periodId}`); }
  addPayAdjustment(data:Record<string,unknown>):Promise<PayAdjustment> { return this.request('POST','/payroll/adjustments',data); }
  payrollRun(periodId:number):Promise<PayrollRun|null> { return this.request('GET',`/payroll/runs/${periodId}`); }
  payrollRunHistory():Promise<PayrollRunHistory[]> { return this.request('GET','/payroll/runs'); }
  generatePayrollRun(periodId:number):Promise<PayrollRun> { return this.request('POST',`/payroll/runs/${periodId}/generate`,{}); }
  submitPayrollRun(periodId:number):Promise<PayrollRun> { return this.request('POST',`/payroll/runs/${periodId}/submit`,{}); }
  approvePayrollRun(periodId:number,approve:boolean):Promise<PayrollRun> { return this.request('POST',`/payroll/runs/${periodId}/approve`,{approve}); }
  publishPayrollRun(periodId:number):Promise<PayrollRun> { return this.request('POST',`/payroll/runs/${periodId}/publish`,{}); }
}
