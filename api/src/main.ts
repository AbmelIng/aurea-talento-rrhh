import 'reflect-metadata';
import { Body, Controller, Get, Module, Param, Patch, Post, Query, Req, BadRequestException } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { NestFactory } from '@nestjs/core';
import { AuthenticatedRequest, AuthService, Public, SessionGuard } from './auth';
import { DatabaseService } from './database';
import { PeopleService } from './people.service';

function idParam(value: string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) throw new BadRequestException('Identificador inválido');
  return id;
}

@Controller('api')
class ApiController {
  constructor(private readonly auth: AuthService, private readonly people: PeopleService) {}

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

  @Get('settings/audit')
  audit(@Req() req: AuthenticatedRequest) { return this.people.auditLog(req.user); }
}

@Module({
  controllers: [ApiController],
  providers: [DatabaseService, AuthService, PeopleService, { provide: APP_GUARD, useClass: SessionGuard }],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: { origin: [process.env.WEB_ORIGIN || 'http://localhost:4200', 'http://127.0.0.1:4200'] } });
  await app.get(DatabaseService).initialize();
  const port = Number(process.env.PORT || 3000);
  await app.listen(port, '127.0.0.1');
  console.log(`API local disponible en http://localhost:${port}/api`);
}

bootstrap().catch(error => { console.error(error); process.exitCode = 1; });
