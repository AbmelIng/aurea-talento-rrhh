import 'reflect-metadata';
import { Body, Controller, Get, Module, Param, Patch, Post, Query, Req, BadRequestException } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { NestFactory } from '@nestjs/core';
import { AuthenticatedRequest, AuthService, Public, SessionGuard } from './auth';
import { DatabaseService } from './database';
import { PeopleService } from './people.service';
import { PayrollService } from './payroll.service';
import { SettingsService } from './settings.service';
import { MvpController } from './mvp.controller';
import { RecruitmentService } from './recruitment.service';
import { LeaveService } from './leave.service';
import { RecordsService } from './records.service';
import { json } from 'express';

function idParam(value: string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) throw new BadRequestException('Identificador inválido');
  return id;
}

@Controller('api')
class ApiController {
  constructor(private readonly auth: AuthService, private readonly people: PeopleService, private readonly payroll: PayrollService, private readonly settings:SettingsService) {}

  @Get('settings/form-options')
  formOptions(@Req() req:AuthenticatedRequest) { return this.settings.formOptions(req.user); }

  @Get('settings/catalogs')
  catalogs(@Req() req:AuthenticatedRequest) { return this.settings.allOptions(req.user); }

  @Post('settings/catalogs/:category')
  createCatalog(@Req() req:AuthenticatedRequest,@Param('category') category:string,@Body() body:{name?:string}) { return this.settings.create(req.user,category,body?.name); }

  @Patch('settings/catalogs/:id')
  updateCatalog(@Req() req:AuthenticatedRequest,@Param('id') id:string,@Body() body:{name?:string;active?:boolean}) { return this.settings.update(req.user,idParam(id),body); }

  @Get('settings/employee-codes')
  employeeCodes(@Req() req:AuthenticatedRequest) { return this.settings.codeConfig(req.user); }

  @Patch('settings/employee-codes')
  updateEmployeeCodes(@Req() req:AuthenticatedRequest,@Body() body:Record<string,unknown>) { return this.settings.updateCodeConfig(req.user,body); }

  @Public()
  @Post('auth/login')
  login(@Body() body: { email?: string; password?: string }) {
    if (typeof body?.email !== 'string' || typeof body.password !== 'string') throw new BadRequestException('Ingresa correo y contraseña');
    return this.auth.login(body.email, body.password);
  }

  @Get('auth/me')
  async current(@Req() req: AuthenticatedRequest) {
    const { password_hash: _hidden, ...user } = req.user;
    return user;
  }

  @Post('auth/password')
  async changePassword(@Req() req:AuthenticatedRequest,@Body() body:{current?:string;next?:string}) {
    await this.auth.changePassword(req.user,body?.current||'',body?.next||'');
    return {changed:true};
  }

  @Get('employees/me')
  me(@Req() req: AuthenticatedRequest) { return this.people.me(req.user); }

  @Patch('employees/me')
  updateMe(@Req() req: AuthenticatedRequest, @Body() body: Record<string, unknown>) { return this.people.updateSelf(req.user, body); }

  @Get('employees')
  employees(@Req() req: AuthenticatedRequest, @Query('search') search?: string, @Query('status') status?: string) {
    return this.people.list(req.user, search, status);
  }

  @Post('employees')
  createEmployee(@Req() req: AuthenticatedRequest, @Body() body: Record<string, unknown>) { return this.people.create(req.user, body); }

  @Get('employees/:id/history')
  history(@Req() req: AuthenticatedRequest, @Param('id') id: string) { return this.people.history(req.user, idParam(id)); }

  @Get('employees/:id')
  employee(@Req() req: AuthenticatedRequest, @Param('id') id: string) { return this.people.get(req.user, idParam(id)); }

  @Patch('employees/:id')
  updateEmployee(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.people.update(req.user, idParam(id), body);
  }

  @Post('change-requests')
  requestChange(@Req() req: AuthenticatedRequest, @Body() body: { field?: string; proposed_value?: unknown }) {
    return this.people.requestChange(req.user, String(body?.field || ''), body?.proposed_value);
  }

  @Get('change-requests')
  requests(@Req() req: AuthenticatedRequest) { return this.people.requests(req.user); }

  @Patch('change-requests/:id')
  resolveRequest(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: { approve?: boolean }) {
    if (typeof body?.approve !== 'boolean') throw new BadRequestException('Indica aprobar o rechazar');
    return this.people.resolveRequest(req.user, idParam(id), body.approve);
  }

  @Get('settings/account')
  account(@Req() req: AuthenticatedRequest) { return this.people.account(req.user); }

  @Get('settings/access-levels')
  levels(@Req() req: AuthenticatedRequest) { return this.people.levels(req.user); }

  @Patch('employees/:id/role')
  changeRole(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: { role?: string }) {
    return this.people.changeRole(req.user, idParam(id), String(body?.role || ''));
  }

  @Patch('employees/:id/catalog-permission')
  catalogPermission(@Req() req:AuthenticatedRequest,@Param('id') id:string,@Body() body:{enabled?:boolean}) {
    return this.people.changeCatalogPermission(req.user,idParam(id),body?.enabled as boolean);
  }

  @Get('settings/audit')
  audit(@Req() req: AuthenticatedRequest) { return this.people.auditLog(req.user); }

  @Get('payroll/periods')
  periods() { return this.payroll.periods(); }

  @Post('payroll/periods')
  createPeriod(@Req() req: AuthenticatedRequest, @Body() body: Record<string, unknown>) { return this.payroll.createPeriod(req.user, body); }

  @Patch('payroll/periods/:id')
  updatePeriod(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.payroll.updatePeriod(req.user, idParam(id), body);
  }

  @Get('payroll/employees')
  payrollEmployees(@Req() req: AuthenticatedRequest) { return this.payroll.employees(req.user); }

  @Get('payroll/timesheet')
  timesheet(@Req() req: AuthenticatedRequest, @Query('period') period: string, @Query('employee') employee?: string) {
    return this.payroll.timesheet(req.user, idParam(period), employee ? idParam(employee) : undefined);
  }

  @Post('payroll/time-entry')
  saveTimeEntry(@Req() req: AuthenticatedRequest, @Body() body: Record<string, unknown>) { return this.payroll.saveEntry(req.user, body); }

  @Post('payroll/timesheet/submit')
  submitTimesheet(@Req() req: AuthenticatedRequest, @Body() body: { period_id?: number }) {
    return this.payroll.submit(req.user, idParam(String(body?.period_id)));
  }

  @Get('payroll/review')
  reviewQueue(@Req() req: AuthenticatedRequest) { return this.payroll.reviewQueue(req.user); }

  @Patch('payroll/timesheets/:id/review')
  reviewTimesheet(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: { approve?: boolean; comment?: string }) {
    if (typeof body?.approve !== 'boolean') throw new BadRequestException('Indica aprobar o devolver');
    return this.payroll.review(req.user, idParam(id), body.approve, body.comment);
  }

  @Get('payroll/receipts')
  receipts(@Req() req: AuthenticatedRequest, @Query('employee') employee?: string) {
    return this.payroll.receipts(req.user, employee ? idParam(employee) : undefined);
  }

  @Get('payroll/receipts/:id')
  receipt(@Req() req: AuthenticatedRequest, @Param('id') id: string) { return this.payroll.receipt(req.user, idParam(id)); }

  @Post('payroll/receipts')
  saveReceipt(@Req() req: AuthenticatedRequest, @Body() body: Record<string, unknown>) { return this.payroll.saveReceipt(req.user, body); }

  @Patch('payroll/receipts/:id/publish')
  publishReceipt(@Req() req: AuthenticatedRequest, @Param('id') id: string) { return this.payroll.publish(req.user, idParam(id)); }

  @Get('payroll/issues')
  issues(@Req() req: AuthenticatedRequest) { return this.payroll.issues(req.user); }

  @Post('payroll/issues')
  issue(@Req() req: AuthenticatedRequest, @Body() body: Record<string, unknown>) { return this.payroll.issue(req.user, body); }

  @Patch('payroll/issues/:id')
  resolveIssue(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: { response?: string }) {
    return this.payroll.resolveIssue(req.user, idParam(id), body?.response);
  }
}

@Module({
  controllers: [ApiController, MvpController],
  providers: [DatabaseService, AuthService, PeopleService, PayrollService, SettingsService, RecruitmentService, LeaveService, RecordsService, { provide: APP_GUARD, useClass: SessionGuard }],
})
class AppModule {}

async function bootstrap() {
  if (process.env.NODE_ENV === 'production' && (!process.env.APP_SECRET || process.env.APP_SECRET.length < 32 || !process.env.WEB_ORIGIN))
    throw new Error('Producción requiere APP_SECRET (mínimo 32 caracteres) y WEB_ORIGIN');
  const app = await NestFactory.create(AppModule, { cors: { origin: [process.env.WEB_ORIGIN || 'http://localhost:4201', 'http://127.0.0.1:4201'] } });
  app.use(json({limit:'8mb'}));
  await app.get(DatabaseService).initialize();
  const port = Number(process.env.PORT || 3001);
  await app.listen(port, '127.0.0.1');
  console.log(`API local disponible en http://localhost:${port}/api`);
}

bootstrap().catch(error => { console.error(error); process.exitCode = 1; });
