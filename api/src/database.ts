import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import mysql, { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { scryptSync, randomBytes } from 'node:crypto';

export type Param = string | number | null;
export type Row = Record<string, unknown>;

const sqliteSchema = [
  `CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL, last_name TEXT NOT NULL, preferred_name TEXT,
    work_email TEXT NOT NULL UNIQUE, personal_email TEXT, phone TEXT, address TEXT,
    emergency_name TEXT, emergency_phone TEXT, birth_date TEXT, dpi TEXT UNIQUE,
    nit TEXT UNIQUE, igss TEXT UNIQUE, hire_date TEXT NOT NULL,
    job_title TEXT NOT NULL, area TEXT NOT NULL, service_line TEXT,
    office TEXT NOT NULL, employment_type TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'Activo',
    manager_id INTEGER REFERENCES employees(id)
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, employee_id INTEGER NOT NULL UNIQUE REFERENCES employees(id),
    email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, role TEXT NOT NULL,
    last_login TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS change_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT, employee_id INTEGER NOT NULL REFERENCES employees(id),
    field TEXT NOT NULL, proposed_value TEXT NOT NULL, previous_value TEXT,
    status TEXT NOT NULL DEFAULT 'Pendiente', created_at TEXT NOT NULL,
    resolved_at TEXT, resolved_by INTEGER REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT, actor_user_id INTEGER NOT NULL REFERENCES users(id),
    employee_id INTEGER REFERENCES employees(id), action TEXT NOT NULL,
    details TEXT NOT NULL, created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS employment_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT, employee_id INTEGER NOT NULL REFERENCES employees(id),
    job_title TEXT NOT NULL, area TEXT NOT NULL, service_line TEXT, office TEXT NOT NULL,
    employment_type TEXT NOT NULL, status TEXT NOT NULL, manager_id INTEGER REFERENCES employees(id),
    effective_date TEXT NOT NULL, recorded_at TEXT NOT NULL, recorded_by INTEGER REFERENCES users(id)
  )`,
];

const mysqlSchema = [
  `CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY, code VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL, preferred_name VARCHAR(100),
    work_email VARCHAR(190) NOT NULL UNIQUE, personal_email VARCHAR(190), phone VARCHAR(30), address VARCHAR(255),
    emergency_name VARCHAR(190), emergency_phone VARCHAR(30), birth_date VARCHAR(10), dpi CHAR(13) UNIQUE,
    nit VARCHAR(20) UNIQUE, igss VARCHAR(30) UNIQUE, hire_date VARCHAR(10) NOT NULL,
    job_title VARCHAR(140) NOT NULL, area VARCHAR(100) NOT NULL, service_line VARCHAR(100),
    office VARCHAR(100) NOT NULL, employment_type VARCHAR(80) NOT NULL, status VARCHAR(20) NOT NULL DEFAULT 'Activo',
    manager_id INT NULL, FOREIGN KEY (manager_id) REFERENCES employees(id), INDEX idx_manager (manager_id), INDEX idx_status (status)
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY, employee_id INT NOT NULL UNIQUE,
    email VARCHAR(190) NOT NULL UNIQUE, password_hash VARCHAR(200) NOT NULL, role VARCHAR(30) NOT NULL,
    last_login VARCHAR(30), FOREIGN KEY (employee_id) REFERENCES employees(id)
  )`,
  `CREATE TABLE IF NOT EXISTS change_requests (
    id INT AUTO_INCREMENT PRIMARY KEY, employee_id INT NOT NULL,
    field VARCHAR(80) NOT NULL, proposed_value TEXT NOT NULL, previous_value TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Pendiente', created_at VARCHAR(30) NOT NULL,
    resolved_at VARCHAR(30), resolved_by INT,
    FOREIGN KEY (employee_id) REFERENCES employees(id), FOREIGN KEY (resolved_by) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY, actor_user_id INT NOT NULL,
    employee_id INT, action VARCHAR(80) NOT NULL, details TEXT NOT NULL, created_at VARCHAR(30) NOT NULL,
    FOREIGN KEY (actor_user_id) REFERENCES users(id), FOREIGN KEY (employee_id) REFERENCES employees(id),
    INDEX idx_audit_employee (employee_id)
  )`,
  `CREATE TABLE IF NOT EXISTS employment_history (
    id INT AUTO_INCREMENT PRIMARY KEY, employee_id INT NOT NULL,
    job_title VARCHAR(140) NOT NULL, area VARCHAR(100) NOT NULL, service_line VARCHAR(100),
    office VARCHAR(100) NOT NULL, employment_type VARCHAR(80) NOT NULL, status VARCHAR(20) NOT NULL,
    manager_id INT, effective_date VARCHAR(10) NOT NULL, recorded_at VARCHAR(30) NOT NULL,
    recorded_by INT, FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (manager_id) REFERENCES employees(id), FOREIGN KEY (recorded_by) REFERENCES users(id)
  )`,
];

const demoEmployees = [
  ['A-001', 'Valeria', 'Cifuentes', 'valeria@demo.local', 'Socia directora', 'Dirección', 'Dirección', null],
  ['A-002', 'María', 'López', 'maria@demo.local', 'Administradora de RR. HH.', 'Recursos Humanos', 'Administración', 1],
  ['A-003', 'Carlos', 'Méndez', 'carlos@demo.local', 'Gerente de auditoría', 'Auditoría externa', 'Auditoría', 1],
  ['A-004', 'Ana', 'Pérez', 'ana@demo.local', 'Auditora junior', 'Auditoría externa', 'Auditoría', 3],
  ['A-005', 'Diego', 'Morales', 'diego@demo.local', 'Auditor junior', 'Auditoría externa', 'Auditoría', 3],
  ['A-006', 'Lucía', 'Herrera', 'lucia@demo.local', 'Consultora fiscal', 'Impuestos', 'Consultoría', 1],
] as const;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private sqlite?: DatabaseSync;
  private pool?: Pool;

  async initialize(): Promise<void> {
    if (process.env.DB_DRIVER === 'mysql') {
      this.pool = mysql.createPool({
        host: process.env.MYSQL_HOST || '127.0.0.1', port: Number(process.env.MYSQL_PORT || 3306),
        user: process.env.MYSQL_USER || 'aurea', password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE || 'aurea_talento', waitForConnections: true,
        connectionLimit: 5,
      });
      for (const sql of mysqlSchema) await this.pool.query(sql);
    } else {
      const file = resolve(process.env.SQLITE_FILE || 'data/aurea-talento.sqlite');
      mkdirSync(dirname(file), { recursive: true });
      this.sqlite = new DatabaseSync(file);
      this.sqlite.exec('PRAGMA foreign_keys = ON');
      for (const sql of sqliteSchema) this.sqlite.exec(sql);
    }
    await this.seed();
  }

  async all<T extends Row = Row>(sql: string, params: Param[] = []): Promise<T[]> {
    if (this.pool) { const [rows] = await this.pool.execute<RowDataPacket[]>(sql, params); return rows as T[]; }
    return this.sqlite!.prepare(sql).all(...params) as T[];
  }
  async get<T extends Row = Row>(sql: string, params: Param[] = []): Promise<T | undefined> {
    if (this.pool) return (await this.all<T>(sql, params))[0];
    return this.sqlite!.prepare(sql).get(...params) as T | undefined;
  }
  async run(sql: string, params: Param[] = []): Promise<number> {
    if (this.pool) { const [result] = await this.pool.execute<ResultSetHeader>(sql, params); return result.insertId; }
    return Number(this.sqlite!.prepare(sql).run(...params).lastInsertRowid);
  }

  private async seed(): Promise<void> {
    const existing = await this.get<{ n: number }>('SELECT COUNT(*) AS n FROM users');
    if (Number(existing?.n) > 0) return;
    const ids: number[] = [];
    for (const person of demoEmployees) {
      ids.push(await this.run(
        `INSERT INTO employees (code,first_name,last_name,work_email,hire_date,job_title,area,service_line,office,employment_type,status,manager_id,phone)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [person[0], person[1], person[2], person[3], '2024-01-15', person[4], person[5], person[6], 'Ciudad de Guatemala', 'Plazo indefinido', 'Activo', person[7] === null ? null : ids[person[7] - 1], '+502 5555-0100'],
      ));
    }
    const roles = ['ADMIN', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE', 'EMPLOYEE', 'EMPLOYEE'];
    for (let i = 0; i < ids.length; i++) {
      await this.run('INSERT INTO users (employee_id,email,password_hash,role) VALUES (?,?,?,?)',
        [ids[i], demoEmployees[i][3], hashPassword('Demo2026!'), roles[i]]);
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.sqlite?.close();
    await this.pool?.end();
  }
}
