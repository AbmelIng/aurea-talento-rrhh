import { CanActivate, ExecutionContext, Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';
import { DatabaseService, Row } from './database';

export interface User extends Row { id: number; employee_id: number; email: string; role: string; password_hash: string; }
export type AuthenticatedRequest = Request & { user: User };
export const Public = () => SetMetadata('public', true);

@Injectable()
export class AuthService {
  private readonly secret = process.env.APP_SECRET || randomBytes(32).toString('hex');
  constructor(private readonly db: DatabaseService) {}

  async login(email: string, password: string): Promise<{ token: string; user: Omit<User, 'password_hash'> }> {
    const user = await this.db.get<User>('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    const [salt, saved] = user?.password_hash.split(':') ?? [];
    const candidate = salt ? scryptSync(password, salt, 64) : Buffer.alloc(64);
    if (!user || !saved || !timingSafeEqual(candidate, Buffer.from(saved, 'hex'))) throw new UnauthorizedException('Credenciales incorrectas');
    const exp = Math.floor(Date.now() / 1000) + 8 * 60 * 60;
    const payload = Buffer.from(JSON.stringify({ uid: user.id, exp })).toString('base64url');
    const signature = createHmac('sha256', this.secret).update(payload).digest('base64url');
    await this.db.run('UPDATE users SET last_login = ? WHERE id = ?', [new Date().toISOString(), user.id]);
    const { password_hash: _hidden, ...safeUser } = user;
    return { token: `${payload}.${signature}`, user: safeUser };
  }

  async fromToken(token: string): Promise<User> {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) throw new UnauthorizedException('Sesión inválida');
    const expected = createHmac('sha256', this.secret).update(payload).digest('base64url');
    if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new UnauthorizedException('Sesión inválida');
    let parsed: { uid: number; exp: number };
    try { parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')); }
    catch { throw new UnauthorizedException('Sesión inválida'); }
    if (!Number.isInteger(parsed.uid) || parsed.exp < Date.now() / 1000) throw new UnauthorizedException('Sesión vencida');
    const user = await this.db.get<User>('SELECT * FROM users WHERE id = ?', [parsed.uid]);
    if (!user) throw new UnauthorizedException('Usuario no disponible');
    return user;
  }
}

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly auth: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.reflector.getAllAndOverride<boolean>('public', [context.getHandler(), context.getClass()])) return true;
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) throw new UnauthorizedException('Inicia sesión');
    req.user = await this.auth.fromToken(token);
    return true;
  }
}
