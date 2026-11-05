import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccessLevel, Account, ApiService, AuditEntry, ChangeRequest, Employee, JobHistory, Role, PayrollPeriod, Timesheet, ReviewSheet, PayReceipt, PayrollIssue, CatalogOption, FormOptions, CodeConfig } from './api.service';
import { CareersComponent } from './careers.component';
import { RecruitmentComponent } from './recruitment.component';
import { LeaveComponent } from './leave.component';
import { RecordsComponent } from './records.component';

type Page = 'me' | 'people' | 'profile' | 'new' | 'settings' | 'requests' | 'time' | 'payments' | 'review' | 'payroll' | 'recruitment' | 'leave' | 'records';
type ProfileTab = 'personal' | 'job';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CareersComponent, RecruitmentComponent, LeaveComponent, RecordsComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  readonly publicCareers = window.location.pathname.startsWith('/empleos');
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
  readonly periods = signal<PayrollPeriod[]>([]);
  readonly timesheet = signal<Timesheet | null>(null);
  readonly reviewSheets = signal<ReviewSheet[]>([]);
  readonly receipts = signal<PayReceipt[]>([]);
  readonly selectedReceipt = signal<PayReceipt | null>(null);
  readonly payrollPeople = signal<Employee[]>([]);
  readonly issues = signal<PayrollIssue[]>([]);
  readonly formOptions = signal<FormOptions | null>(null);
  readonly catalogs = signal<CatalogOption[]>([]);
  readonly codeConfig = signal<CodeConfig | null>(null);
  codeDraft:CodeConfig={id:1,prefix:'EMP',separator:'-',digits:4,next_number:1};
  readonly catalogCategories=[
    {value:'job_title',label:'Puestos'},{value:'area',label:'Áreas y departamentos'},
    {value:'service_line',label:'Líneas de servicio'},{value:'office',label:'Sedes'},
    {value:'employment_type',label:'Tipos de contratación'},
  ];
  newCatalogNames:Record<string,string>={};
  readonly loading = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  readonly credential = signal<{ email: string; password: string } | null>(null);
  readonly canSeePeople = computed(() => ['MANAGER', 'HR_ADMIN', 'ADMIN'].includes(this.api.user()?.role || ''));
  readonly canManage = computed(() => ['HR_ADMIN', 'ADMIN'].includes(this.api.user()?.role || ''));
  readonly isAdmin = computed(() => this.api.user()?.role === 'ADMIN');
  readonly canManageCatalogs = computed(() => this.isAdmin() || !!this.api.user()?.can_modify_catalogs);
  readonly isPayroll = computed(() => this.api.user()?.role === 'PAYROLL');
  readonly canReviewTime = computed(() => ['MANAGER', 'PAYROLL'].includes(this.api.user()?.role || ''));
  readonly isOwnProfile = computed(() => this.profile()?.id === this.api.user()?.employee_id);
  search = '';
  status = 'Activo';
  chosenRoles: Record<number, Role> = {};
  chosenCatalogPermissions:Record<number,boolean>={};
  requestField = 'first_name';
  selectedPeriodId = 0;
  payrollEmployeeId = 0;
  reviewComment: Record<number, string> = {};
  issueResponse: Record<number, string> = {};
  periodStatus = 'Abierto';
  readonly periodStatuses = ['Abierto', 'En revisión', 'Bloqueado', 'Procesado', 'Pagado'];

  readonly roleOptions: { value: Role; label: string }[] = [
    { value: 'EMPLOYEE', label: 'Empleado' }, { value: 'MANAGER', label: 'Gerente' },
    { value: 'HR_ADMIN', label: 'RR. HH.' }, { value: 'ADMIN', label: 'Administrador total' },
    { value: 'PAYROLL', label: 'Nómina' },
  ];
  readonly requestFieldLabels = [
    { value: 'first_name', label: 'Primer nombre' }, { value: 'last_name', label: 'Apellido' },
    { value: 'birth_date', label: 'Fecha de nacimiento' }, { value: 'dpi', label: 'DPI' },
    { value: 'nit', label: 'NIT' }, { value: 'igss', label: 'Afiliación IGSS' },
  ];

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]], password: ['', Validators.required],
  });
  readonly passwordForm=this.fb.nonNullable.group({current:['',Validators.required],next:['',[Validators.required,Validators.minLength(12)]]});
  readonly selfForm = this.fb.nonNullable.group({
    preferred_name: [''], personal_email: ['', Validators.email], phone: [''],
    address: [''], emergency_name: [''], emergency_phone: [''],
  });
  readonly requestForm = this.fb.nonNullable.group({ proposed_value: ['', Validators.required] });
  readonly employeeForm = this.fb.nonNullable.group({
    first_name: ['', Validators.required], last_name: ['', Validators.required],
    work_email: ['', [Validators.required, Validators.email]], phone: [''],
    hire_date: ['', Validators.required], job_title_id: [0, Validators.min(1)], area_id: [0, Validators.min(1)],
    service_line_id: [0, Validators.min(1)], office_id: [0, Validators.min(1)],
    employment_type_id: [0, Validators.min(1)], manager_id: [0],
  });
  readonly editForm = this.fb.nonNullable.group({
    first_name: ['', Validators.required], last_name: ['', Validators.required],
    preferred_name: [''], work_email: ['', [Validators.required, Validators.email]],
    personal_email: ['', Validators.email], phone: [''], address: [''],
    emergency_name: [''], emergency_phone: [''], birth_date: [''],
    dpi: [''], nit: [''], igss: [''], hire_date: ['', Validators.required],
    job_title_id: [0, Validators.min(1)], area_id: [0, Validators.min(1)], service_line_id: [0, Validators.min(1)],
    office_id: [0, Validators.min(1)], employment_type_id: [0, Validators.min(1)], status: ['Activo'], manager_id: [0],
  });
  readonly timeForm = this.fb.nonNullable.group({ work_date: ['', Validators.required], hours: [8, [Validators.required, Validators.min(0.25), Validators.max(24)]], note: [''] });
  readonly periodForm = this.fb.nonNullable.group({ label: ['', Validators.required], start_date: ['', Validators.required], end_date: ['', Validators.required], submit_deadline: ['', Validators.required], pay_date: ['', Validators.required] });
  readonly payForm = this.fb.nonNullable.group({ gross: [0, [Validators.required, Validators.min(0)]], taxes: [0, [Validators.required, Validators.min(0)]], deductions: [0, [Validators.required, Validators.min(0)]], source_note: ['', Validators.required] });
  readonly issueForm = this.fb.nonNullable.group({ message: ['', [Validators.required, Validators.minLength(10)]] });

  async ngOnInit(): Promise<void> {
    if (this.publicCareers) return;
    if (await this.api.restore()) await this.loadMe();
  }
  openRecruitment():void { this.resetMessages(); this.page.set('recruitment'); }
  openLeave():void { this.resetMessages(); this.page.set('leave'); }
  openRecords():void { this.resetMessages(); this.page.set('records'); }

  roleName(role?: string): string { return this.roleOptions.find(item => item.value === role)?.label || 'Empleado'; }
  catalogItems(category:string):CatalogOption[] { return this.formOptions()?.catalogs[category] || []; }
  requestFields():{value:string;label:string}[] { return (this.formOptions()?.requestFields || []).map(value=>({value,label:this.requestFieldLabels.find(item=>item.value===value)?.label||value})); }
  codePreview():string { const c=this.codeDraft; return `${c.prefix}${c.separator}${String(c.next_number).padStart(Number(c.digits)||1,'0')}`; }
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
  logout(): void {
    this.api.logout(); this.me.set(null); this.selected.set(null); this.page.set('me');
    this.resetMessages(); this.credential.set(null);
  }
  async loadMe(): Promise<void> {
    this.formOptions.set(await this.api.formOptions());
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
        hire_date: employee.hire_date, job_title_id: employee.job_title_id || 0, area_id: employee.area_id || 0,
        service_line_id: employee.service_line_id || 0, office_id: employee.office_id || 0,
        employment_type_id: employee.employment_type_id || 0, status: employee.status,
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
      this.formOptions.set(await this.api.formOptions());
      this.employeeForm.reset({ manager_id: 0 });
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
    if (!this.canManageCatalogs()) return;
    this.resetMessages(); this.loading.set(true);
    try {
      if(!this.isAdmin()) {
        this.catalogs.set(await this.api.catalogs());
        this.page.set('settings'); this.loading.set(false); return;
      }
      const [account, levels, people, audit, catalogs, codeConfig] = await Promise.all([
        this.api.account(), this.api.levels(), this.api.employees('', 'Todos'), this.api.audit(), this.api.catalogs(), this.api.codeConfig(),
      ]);
      this.account.set(account); this.levels.set(levels); this.employees.set(people); this.audit.set(audit);
      this.catalogs.set(catalogs); this.codeConfig.set(codeConfig);
      this.codeDraft={...codeConfig};
      this.chosenRoles = Object.fromEntries(people.map(person => [person.id, person.role || 'EMPLOYEE']));
      this.chosenCatalogPermissions=Object.fromEntries(people.map(person=>[person.id,!!person.can_modify_catalogs]));
      this.page.set('settings'); this.loading.set(false);
    } catch (error) { this.fail(error); }
  }

  private async loadPeriods(): Promise<void> {
    const periods = await this.api.periods();
    this.periods.set(periods);
    if (!periods.some(period => period.id === this.selectedPeriodId)) this.selectedPeriodId = periods[0]?.id || 0;
  }
  async openTime(): Promise<void> {
    this.resetMessages(); this.loading.set(true);
    try {
      await this.loadPeriods();
      this.timesheet.set(this.selectedPeriodId ? await this.api.timesheet(this.selectedPeriodId) : null);
      this.page.set('time'); this.loading.set(false);
    } catch (error) { this.fail(error); }
  }
  async openPayments(): Promise<void> {
    this.resetMessages(); this.loading.set(true);
    try {
      await this.loadPeriods();
      this.receipts.set(await this.api.receipts()); this.issues.set(await this.api.issues());
      this.selectedReceipt.set(null); this.page.set('payments'); this.loading.set(false);
    } catch (error) { this.fail(error); }
  }
  async openReview(): Promise<void> {
    if (!this.canReviewTime()) return;
    this.resetMessages(); this.loading.set(true);
    try { this.reviewSheets.set(await this.api.reviewQueue()); this.page.set('review'); this.loading.set(false); }
    catch (error) { this.fail(error); }
  }
  async openPayroll(): Promise<void> {
    if (!this.isPayroll()) return;
    this.resetMessages(); this.loading.set(true);
    try {
      await this.loadPeriods(); this.periodStatus = this.periods().find(period => period.id === this.selectedPeriodId)?.status || 'Abierto';
      this.payrollPeople.set(await this.api.payrollEmployees());
      if (!this.payrollEmployeeId) this.payrollEmployeeId = this.payrollPeople()[0]?.id || 0;
      await this.loadPayrollReceipts(); this.issues.set(await this.api.issues());
      this.page.set('payroll'); this.loading.set(false);
    } catch (error) { this.fail(error); }
  }
  async loadPayrollReceipts(): Promise<void> {
    if (!this.payrollEmployeeId) { this.receipts.set([]); return; }
    this.receipts.set(await this.api.receipts(this.payrollEmployeeId));
    const current = this.receipts().find(receipt => receipt.period_id === this.selectedPeriodId);
    this.payForm.reset(current && current.status === 'Borrador' ? {
      gross: current.gross, taxes: current.taxes, deductions: current.deductions, source_note: current.source_note,
    } : { gross: 0, taxes: 0, deductions: 0, source_note: '' });
  }
  async selectPayrollPeriod(periodId: number): Promise<void> {
    this.selectedPeriodId = Number(periodId);
    this.periodStatus = this.periods().find(period => period.id === this.selectedPeriodId)?.status || 'Abierto';
    try { await this.loadPayrollReceipts(); } catch (error) { this.fail(error); }
  }
  currentPeriod(): PayrollPeriod | undefined { return this.periods().find(period => period.id === this.selectedPeriodId); }
  currentManagedReceipt(): PayReceipt | undefined { return this.receipts().find(receipt => receipt.period_id === this.selectedPeriodId); }
  async saveTime(): Promise<void> {
    if (this.timeForm.invalid) { this.timeForm.markAllAsTouched(); return; }
    this.resetMessages(); this.loading.set(true);
    try {
      this.timesheet.set(await this.api.saveTimeEntry({ period_id: this.selectedPeriodId, ...this.timeForm.getRawValue() }));
      this.timeForm.reset({ work_date: '', hours: 8, note: '' });
      this.notice.set('Horas guardadas en el borrador.'); this.loading.set(false);
    } catch (error) { this.fail(error); }
  }
  async submitTime(): Promise<void> {
    this.resetMessages(); this.loading.set(true);
    try { this.timesheet.set(await this.api.submitTimesheet(this.selectedPeriodId)); this.notice.set('Hoja enviada a revisión.'); this.loading.set(false); }
    catch (error) { this.fail(error); }
  }
  async reviewTime(sheet: ReviewSheet, approve: boolean): Promise<void> {
    this.resetMessages(); this.loading.set(true);
    try {
      await this.api.reviewTimesheet(sheet.id, approve, this.reviewComment[sheet.id] || '');
      this.reviewSheets.set(await this.api.reviewQueue());
      this.notice.set(approve ? 'Hoja aprobada.' : 'Hoja devuelta para corrección.'); this.loading.set(false);
    } catch (error) { this.fail(error); }
  }
  async createPeriod(): Promise<void> {
    if (this.periodForm.invalid) { this.periodForm.markAllAsTouched(); return; }
    this.resetMessages(); this.loading.set(true);
    try {
      const period = await this.api.createPeriod(this.periodForm.getRawValue());
      await this.loadPeriods(); this.selectedPeriodId = period.id; this.periodForm.reset();
      this.notice.set('Periodo creado.'); this.loading.set(false);
    } catch (error) { this.fail(error); }
  }
  async changePeriodStatus(): Promise<void> {
    this.resetMessages(); this.loading.set(true);
    try { await this.api.updatePeriod(this.selectedPeriodId, { status: this.periodStatus }); await this.loadPeriods(); this.notice.set('Estado del periodo actualizado.'); this.loading.set(false); }
    catch (error) { this.fail(error); }
  }
  async savePay(): Promise<void> {
    if (this.payForm.invalid) { this.payForm.markAllAsTouched(); return; }
    this.resetMessages(); this.loading.set(true);
    try {
      await this.api.saveReceipt({ period_id: this.selectedPeriodId, employee_id: this.payrollEmployeeId, ...this.payForm.getRawValue() });
      await this.loadPayrollReceipts(); this.notice.set('Recibo guardado como borrador.'); this.loading.set(false);
    } catch (error) { this.fail(error); }
  }
  async publishPay(receiptId: number): Promise<void> {
    this.resetMessages(); this.loading.set(true);
    try { await this.api.publishReceipt(receiptId); await this.loadPayrollReceipts(); this.notice.set('Recibo publicado para el empleado.'); this.loading.set(false); }
    catch (error) { this.fail(error); }
  }
  async openReceipt(receiptId: number): Promise<void> {
    this.resetMessages(); this.loading.set(true);
    try { this.selectedReceipt.set(await this.api.receipt(receiptId)); this.loading.set(false); }
    catch (error) { this.fail(error); }
  }
  printReceipt(): void { window.print(); }
  yearNet(): number { return this.receipts().filter(receipt => receipt.status === 'Publicado').reduce((sum, receipt) => sum + Number(receipt.net), 0); }
  async reportIssue(): Promise<void> {
    if (this.issueForm.invalid) { this.issueForm.markAllAsTouched(); return; }
    this.resetMessages(); this.loading.set(true);
    try {
      await this.api.reportIssue({ period_id: this.selectedReceipt()?.period_id || this.selectedPeriodId,
        pay_record_id: this.selectedReceipt()?.id || undefined, message: this.issueForm.getRawValue().message });
      this.issues.set(await this.api.issues()); this.issueForm.reset();
      this.notice.set('Diferencia enviada a Nómina.'); this.loading.set(false);
    } catch (error) { this.fail(error); }
  }
  async resolvePayrollIssue(issueId: number): Promise<void> {
    this.resetMessages(); this.loading.set(true);
    try { await this.api.resolveIssue(issueId, this.issueResponse[issueId] || ''); this.issues.set(await this.api.issues()); this.notice.set('Reporte resuelto.'); this.loading.set(false); }
    catch (error) { this.fail(error); }
  }

  async saveSelf(): Promise<void> {
    if (this.selfForm.invalid) { this.selfForm.markAllAsTouched(); return; }
    this.resetMessages(); this.loading.set(true);
    try { this.me.set(await this.api.updateMe(this.selfForm.getRawValue())); this.notice.set('Tus datos de contacto se guardaron.'); this.loading.set(false); }
    catch (error) { this.fail(error); }
  }
  async savePassword():Promise<void> {
    if(this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    this.resetMessages();
    try { const {current,next}=this.passwordForm.getRawValue(); await this.api.changePassword(current,next); this.api.logout(); this.me.set(null); this.passwordForm.reset(); this.notice.set('Contraseña cambiada. Inicia sesión de nuevo.'); }
    catch(error) { this.fail(error); }
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
        !(field.endsWith('_id') && !value && !(current as unknown as Record<string, unknown>)[field]) &&
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
  async changeCatalogPermission(employeeId:number):Promise<void> {
    this.resetMessages();
    try { await this.api.changeCatalogPermission(employeeId,!!this.chosenCatalogPermissions[employeeId]); this.employees.set(await this.api.employees('','Todos')); this.notice.set('Permiso de catálogos actualizado.'); }
    catch(error) { this.fail(error); }
  }
  async addCatalog(category:string,name:string):Promise<void> {
    this.resetMessages();
    try { await this.api.createCatalog(category,name); this.catalogs.set(await this.api.catalogs()); this.formOptions.set(await this.api.formOptions()); this.notice.set('Opción creada.'); }
    catch(error) { this.fail(error); }
  }
  async updateCatalog(option:CatalogOption,name:string,active:boolean):Promise<void> {
    this.resetMessages();
    try { await this.api.updateCatalog(option.id,{name,active}); this.catalogs.set(await this.api.catalogs()); this.formOptions.set(await this.api.formOptions()); this.notice.set('Catálogo actualizado.'); }
    catch(error) { this.fail(error); }
  }
  async saveCodeConfig():Promise<void> {
    const value=this.codeDraft;
    this.resetMessages();
    try { const saved=await this.api.updateCodeConfig(value); this.codeConfig.set(saved); this.codeDraft={...saved}; this.notice.set('Formato guardado.'); }
    catch(error) { this.fail(error); }
  }
}
