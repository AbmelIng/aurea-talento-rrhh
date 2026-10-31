import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type Role = 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN' | 'ADMIN';
export interface User { id: number; employee_id: number; email: string; role: Role; last_login?: string; }
export interface Employee {
  id: number; code: string; first_name: string; last_name: string; preferred_name?: string | null;
  work_email: string; personal_email?: string | null; phone?: string | null; address?: string | null;
  emergency_name?: string | null; emergency_phone?: string | null; birth_date?: string | null;
  dpi?: string | null; nit?: string | null; igss?: string | null; hire_date: string;
  job_title: string; area: string; service_line?: string | null; office: string;
  employment_type: string; status: string; manager_id?: number | null;
  manager_first_name?: string | null; manager_last_name?: string | null; role?: Role;
}
export interface ChangeRequest { id: number; employee_id: number; field: string; proposed_value: string; previous_value?: string | null; status: string; created_at: string; first_name?: string; last_name?: string; }
export interface JobHistory { id: number; job_title: string; area: string; service_line?: string; office: string; employment_type: string; status: string; effective_date: string; }
export interface AccessLevel { role: Role; label: string; total: number; }
export interface Account { company: string; country: string; package: string; users: number; }
export interface AuditEntry { id: number; action: string; employee_id?: number; details: string; created_at: string; }

@Injectable({ providedIn: 'root' })
export class ApiService {
  readonly user = signal<User | null>(null);
  private readonly base = 'http://127.0.0.1:3000/api';
  private token = sessionStorage.getItem('aurea_demo_token') || '';
  constructor(private readonly http: HttpClient) {}

  private async request<T>(method: 'GET' | 'POST' | 'PATCH', path: string, body?: unknown): Promise<T> {
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
    sessionStorage.setItem('aurea_demo_token', this.token);
    this.user.set(result.user);
    return result.user;
  }
  logout(): void { this.token = ''; sessionStorage.removeItem('aurea_demo_token'); this.user.set(null); }

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
  audit(): Promise<AuditEntry[]> { return this.request('GET', '/settings/audit'); }
}
