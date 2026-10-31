import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccessLevel, Account, ApiService, AuditEntry, ChangeRequest, Employee, JobHistory, Role } from './api.service';

type Page = 'me' | 'people' | 'profile' | 'new' | 'settings' | 'requests';
type ProfileTab = 'personal' | 'job';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  readonly page = signal<Page>('me');
  readonly tab = signal<ProfileTab>('personal');
  readonly me = signal<Employee | null>(null);
  readonly selected = signal<Employee | null>(null);
  readonly profile = computed(() => this.page() === 'me' ? this.me() : this.selected());
  readonly employees = signal<Employee[]>([]);
  readonly managers = signal<Employee[]>([]);
  readonly history = signal<JobHistory[]>([]);
  readonly requests = signal<ChangeRequest[]>([]);
  readonly account = signal<Account | null>(null);
  readonly levels = signal<AccessLevel[]>([]);
  readonly audit = signal<AuditEntry[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  readonly credential = signal<{ email: string; password: string } | null>(null);
  readonly canSeePeople = computed(() => ['MANAGER', 'HR_ADMIN', 'ADMIN'].includes(this.api.user()?.role || ''));
  readonly canManage = computed(() => ['HR_ADMIN', 'ADMIN'].includes(this.api.user()?.role || ''));
  readonly isAdmin = computed(() => this.api.user()?.role === 'ADMIN');
  readonly isOwnProfile = computed(() => this.profile()?.id === this.api.user()?.employee_id);
  search = '';
  status = 'Activo';
  chosenRoles: Record<number, Role> = {};
  requestField = 'first_name';

  readonly demoAccounts = [
    { label: 'Empleado', email: 'ana@demo.local', initials: 'AP' },
    { label: 'Gerente', email: 'carlos@demo.local', initials: 'CM' },
    { label: 'RR. HH.', email: 'maria@demo.local', initials: 'ML' },
    { label: 'Administrador', email: 'valeria@demo.local', initials: 'VC' },
  ];
  readonly roleOptions: { value: Role; label: string }[] = [
    { value: 'EMPLOYEE', label: 'Empleado' }, { value: 'MANAGER', label: 'Gerente' },
    { value: 'HR_ADMIN', label: 'RR. HH.' }, { value: 'ADMIN', label: 'Administrador total' },
  ];
  readonly requestFields = [
    { value: 'first_name', label: 'Primer nombre' }, { value: 'last_name', label: 'Apellido' },
    { value: 'birth_date', label: 'Fecha de nacimiento' }, { value: 'dpi', label: 'DPI' },
    { value: 'nit', label: 'NIT' }, { value: 'igss', label: 'Afiliación IGSS' },
  ];

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]], password: ['', Validators.required],
  });
  readonly selfForm = this.fb.nonNullable.group({
    preferred_name: [''], personal_email: ['', Validators.email], phone: [''],
    address: [''], emergency_name: [''], emergency_phone: [''],
  });
  readonly requestForm = this.fb.nonNullable.group({ proposed_value: ['', Validators.required] });
  readonly employeeForm = this.fb.nonNullable.group({
    code: ['', Validators.required], first_name: ['', Validators.required], last_name: ['', Validators.required],
    work_email: ['', [Validators.required, Validators.email]], phone: [''],
    hire_date: ['', Validators.required], job_title: ['', Validators.required], area: ['', Validators.required],
    service_line: [''], office: ['Ciudad de Guatemala', Validators.required],
    employment_type: ['Plazo indefinido'], manager_id: [0],
  });
  readonly editForm = this.fb.nonNullable.group({
    first_name: ['', Validators.required], last_name: ['', Validators.required],
    preferred_name: [''], work_email: ['', [Validators.required, Validators.email]],
    personal_email: ['', Validators.email], phone: [''], address: [''],
    emergency_name: [''], emergency_phone: [''], birth_date: [''],
    dpi: [''], nit: [''], igss: [''], hire_date: ['', Validators.required],
    job_title: ['', Validators.required], area: ['', Validators.required], service_line: [''],
    office: ['', Validators.required], employment_type: [''], status: ['Activo'], manager_id: [0],
  });

  async ngOnInit(): Promise<void> {
    if (await this.api.restore()) await this.loadMe();
  }

  roleName(role?: string): string { return this.roleOptions.find(item => item.value === role)?.label || 'Empleado'; }
  fullName(employee?: Employee | null): string { return employee ? `${employee.first_name} ${employee.last_name}` : ''; }
  initials(employee?: Employee | null): string { return employee ? `${employee.first_name[0]}${employee.last_name[0]}`.toUpperCase() : 'AT'; }
  private fail(error: unknown): void { this.error.set(error instanceof Error ? error.message : 'Ocurrió un error'); this.loading.set(false); }
  private resetMessages(): void { this.error.set(''); this.notice.set(''); }

  async login(): Promise<void> {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.resetMessages(); this.loading.set(true);
    try {
      const { email, password } = this.loginForm.getRawValue();
      await this.api.login(email, password);
      this.loginForm.controls.password.setValue('');
      await this.loadMe();
      this.loading.set(false);
    } catch (error) { this.fail(error); }
  }
  fillDemo(email: string): void { this.loginForm.setValue({ email, password: 'Demo2026!' }); }
  logout(): void {
    this.api.logout(); this.me.set(null); this.selected.set(null); this.page.set('me');
    this.resetMessages(); this.credential.set(null);
  }
  async loadMe(): Promise<void> {
    this.me.set(await this.api.me());
    const employee = this.me()!;
    this.selfForm.reset({
      preferred_name: employee.preferred_name || '', personal_email: employee.personal_email || '',
      phone: employee.phone || '', address: employee.address || '',
      emergency_name: employee.emergency_name || '', emergency_phone: employee.emergency_phone || '',
    });
    this.page.set('me'); this.tab.set('personal');
    this.requests.set(await this.api.requests());
  }
  async openMe(): Promise<void> {
    this.resetMessages(); this.credential.set(null); this.loading.set(true);
    try { await this.loadMe(); this.loading.set(false); } catch (error) { this.fail(error); }
  }
  async openPeople(): Promise<void> {
    this.resetMessages(); this.credential.set(null); this.loading.set(true);
    try { this.employees.set(await this.api.employees(this.search, this.status)); this.page.set('people'); this.loading.set(false); }
    catch (error) { this.fail(error); }
  }
  async openProfile(id: number): Promise<void> {
    this.resetMessages(); this.loading.set(true);
    try {
      const employee = await this.api.employee(id);
      this.selected.set(employee);
      this.history.set(await this.api.history(id));
      if (this.canManage()) this.managers.set(await this.api.employees('', 'Todos'));
      this.editForm.reset({
        first_name: employee.first_name, last_name: employee.last_name, preferred_name: employee.preferred_name || '',
        work_email: employee.work_email, personal_email: employee.personal_email || '',
        phone: employee.phone || '', address: employee.address || '', emergency_name: employee.emergency_name || '',
        emergency_phone: employee.emergency_phone || '', birth_date: employee.birth_date || '',
        dpi: employee.dpi || '', nit: employee.nit || '', igss: employee.igss || '',
        hire_date: employee.hire_date, job_title: employee.job_title, area: employee.area,
        service_line: employee.service_line || '', office: employee.office,
        employment_type: employee.employment_type, status: employee.status,
        manager_id: employee.manager_id || 0,
      });
      this.page.set('profile'); this.tab.set('personal'); this.loading.set(false);
    } catch (error) { this.fail(error); }
  }
  async openNew(): Promise<void> {
    if (!this.canManage()) return;
    this.resetMessages(); this.credential.set(null); this.loading.set(true);
    try {
      this.managers.set(await this.api.employees('', 'Todos'));
      this.employeeForm.reset({ office: 'Ciudad de Guatemala', employment_type: 'Plazo indefinido', manager_id: 0 });
      this.page.set('new'); this.loading.set(false);
    } catch (error) { this.fail(error); }
  }
  async openRequests(): Promise<void> {
    if (!this.canManage()) return;
    this.resetMessages(); this.loading.set(true);
    try { this.requests.set(await this.api.requests()); this.page.set('requests'); this.loading.set(false); }
    catch (error) { this.fail(error); }
  }
  async openSettings(): Promise<void> {
    if (!this.isAdmin()) return;
    this.resetMessages(); this.loading.set(true);
    try {
      const [account, levels, people, audit] = await Promise.all([
        this.api.account(), this.api.levels(), this.api.employees('', 'Todos'), this.api.audit(),
      ]);
      this.account.set(account); this.levels.set(levels); this.employees.set(people); this.audit.set(audit);
      this.chosenRoles = Object.fromEntries(people.map(person => [person.id, person.role || 'EMPLOYEE']));
      this.page.set('settings'); this.loading.set(false);
    } catch (error) { this.fail(error); }
  }

  async saveSelf(): Promise<void> {
    if (this.selfForm.invalid) { this.selfForm.markAllAsTouched(); return; }
    this.resetMessages(); this.loading.set(true);
    try { this.me.set(await this.api.updateMe(this.selfForm.getRawValue())); this.notice.set('Tus datos de contacto se guardaron.'); this.loading.set(false); }
    catch (error) { this.fail(error); }
  }
  async submitChange(): Promise<void> {
    if (this.requestForm.invalid) { this.requestForm.markAllAsTouched(); return; }
    this.resetMessages(); this.loading.set(true);
    try {
      await this.api.requestChange(this.requestField, this.requestForm.getRawValue().proposed_value);
      this.requests.set(await this.api.requests()); this.requestForm.reset();
      this.notice.set('Solicitud enviada a RR. HH.'); this.loading.set(false);
    } catch (error) { this.fail(error); }
  }
  async createEmployee(): Promise<void> {
    if (this.employeeForm.invalid) { this.employeeForm.markAllAsTouched(); return; }
    this.resetMessages(); this.loading.set(true);
    try {
      const values = this.employeeForm.getRawValue();
      const result = await this.api.createEmployee({ ...values, manager_id: values.manager_id || null });
      this.credential.set({ email: result.employee.work_email, password: result.temporaryPassword });
      await this.openProfile(result.employee.id);
      this.notice.set('Empleado creado. Copia la clave temporal antes de salir de esta pantalla.');
      this.loading.set(false);
    } catch (error) { this.fail(error); }
  }
  async saveEmployee(): Promise<void> {
    if (!this.selected() || this.editForm.invalid) { this.editForm.markAllAsTouched(); return; }
    this.resetMessages(); this.loading.set(true);
    try {
      const values = this.editForm.getRawValue();
      const current = this.selected()!;
      const changes: Record<string, unknown> = Object.fromEntries(Object.entries(values).filter(([field, value]) =>
        String(value ?? '') !== String((current as unknown as Record<string, unknown>)[field] ?? '')
      ));
      if (!Object.keys(changes).length) { this.notice.set('No hay cambios por guardar.'); this.loading.set(false); return; }
      if ('manager_id' in changes) changes['manager_id'] = values.manager_id || null;
      const updated = await this.api.updateEmployee(current.id, changes);
      this.selected.set(updated); this.history.set(await this.api.history(updated.id));
      if (updated.id === this.me()?.id) this.me.set(updated);
      this.notice.set('Expediente actualizado y cambio registrado.'); this.loading.set(false);
    } catch (error) { this.fail(error); }
  }
  async resolveRequest(id: number, approve: boolean): Promise<void> {
    this.resetMessages(); this.loading.set(true);
    try { await this.api.resolveRequest(id, approve); this.requests.set(await this.api.requests()); this.notice.set(approve ? 'Cambio aprobado.' : 'Cambio rechazado.'); this.loading.set(false); }
    catch (error) { this.fail(error); }
  }
  async changeRole(employeeId: number): Promise<void> {
    this.resetMessages(); this.loading.set(true);
    try {
      await this.api.changeRole(employeeId, this.chosenRoles[employeeId]);
      this.levels.set(await this.api.levels()); this.employees.set(await this.api.employees('', 'Todos'));
      this.audit.set(await this.api.audit()); this.notice.set('Nivel de acceso actualizado.'); this.loading.set(false);
    } catch (error) { this.fail(error); }
  }
}
