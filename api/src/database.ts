import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import mysql, { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { scryptSync, randomBytes } from 'node:crypto';
import { mysqlMvpSchema, sqliteMvpSchema, mysqlMvpExtras, sqliteMvpExtras } from './mvp-schema';
import { mysqlSelectionSchema, sqliteSelectionSchema } from './selection-schema';
import { mysqlPayrollCalcSchema, sqlitePayrollCalcSchema } from './payroll-calc-schema';

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
  `CREATE TABLE IF NOT EXISTS payroll_periods (
    id INTEGER PRIMARY KEY AUTOINCREMENT, label TEXT NOT NULL, start_date TEXT NOT NULL,
    end_date TEXT NOT NULL, submit_deadline TEXT NOT NULL, pay_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Abierto', created_by INTEGER REFERENCES users(id),
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS timesheets (
    id INTEGER PRIMARY KEY AUTOINCREMENT, period_id INTEGER NOT NULL REFERENCES payroll_periods(id),
    employee_id INTEGER NOT NULL REFERENCES employees(id), status TEXT NOT NULL DEFAULT 'Borrador',
    review_comment TEXT, submitted_at TEXT, reviewed_at TEXT, reviewed_by INTEGER REFERENCES users(id),
    UNIQUE(period_id, employee_id)
  )`,
  `CREATE TABLE IF NOT EXISTS time_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT, timesheet_id INTEGER NOT NULL REFERENCES timesheets(id),
    work_date TEXT NOT NULL, hours REAL NOT NULL, note TEXT, updated_at TEXT NOT NULL,
    UNIQUE(timesheet_id, work_date)
  )`,
  `CREATE TABLE IF NOT EXISTS pay_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT, period_id INTEGER NOT NULL REFERENCES payroll_periods(id),
    employee_id INTEGER NOT NULL REFERENCES employees(id), currency TEXT NOT NULL DEFAULT 'GTQ',
    gross REAL NOT NULL, taxes REAL NOT NULL, deductions REAL NOT NULL, net REAL NOT NULL,
    earnings_json TEXT NOT NULL, taxes_json TEXT NOT NULL, deductions_json TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Borrador', source_note TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL, updated_by INTEGER REFERENCES users(id),
    UNIQUE(period_id, employee_id)
  )`,
  `CREATE TABLE IF NOT EXISTS payroll_issues (
    id INTEGER PRIMARY KEY AUTOINCREMENT, employee_id INTEGER NOT NULL REFERENCES employees(id),
    period_id INTEGER NOT NULL REFERENCES payroll_periods(id), pay_record_id INTEGER REFERENCES pay_records(id),
    message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'Pendiente', response TEXT,
    created_at TEXT NOT NULL, resolved_at TEXT, resolved_by INTEGER REFERENCES users(id)
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
  `CREATE TABLE IF NOT EXISTS payroll_periods (
    id INT AUTO_INCREMENT PRIMARY KEY, label VARCHAR(100) NOT NULL, start_date VARCHAR(10) NOT NULL,
    end_date VARCHAR(10) NOT NULL, submit_deadline VARCHAR(10) NOT NULL, pay_date VARCHAR(10) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Abierto', created_by INT, updated_at VARCHAR(30) NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS timesheets (
    id INT AUTO_INCREMENT PRIMARY KEY, period_id INT NOT NULL, employee_id INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Borrador', review_comment TEXT, submitted_at VARCHAR(30),
    reviewed_at VARCHAR(30), reviewed_by INT, UNIQUE KEY unique_timesheet (period_id, employee_id),
    FOREIGN KEY (period_id) REFERENCES payroll_periods(id), FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS time_entries (
    id INT AUTO_INCREMENT PRIMARY KEY, timesheet_id INT NOT NULL, work_date VARCHAR(10) NOT NULL,
    hours DECIMAL(5,2) NOT NULL, note TEXT, updated_at VARCHAR(30) NOT NULL,
    UNIQUE KEY unique_day (timesheet_id, work_date), FOREIGN KEY (timesheet_id) REFERENCES timesheets(id)
  )`,
  `CREATE TABLE IF NOT EXISTS pay_records (
    id INT AUTO_INCREMENT PRIMARY KEY, period_id INT NOT NULL, employee_id INT NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'GTQ', gross DECIMAL(12,2) NOT NULL,
    taxes DECIMAL(12,2) NOT NULL, deductions DECIMAL(12,2) NOT NULL, net DECIMAL(12,2) NOT NULL,
    earnings_json TEXT NOT NULL, taxes_json TEXT NOT NULL, deductions_json TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Borrador', source_note VARCHAR(255) NOT NULL,
    version INT NOT NULL DEFAULT 1, updated_at VARCHAR(30) NOT NULL, updated_by INT,
    UNIQUE KEY unique_receipt (period_id, employee_id), FOREIGN KEY (period_id) REFERENCES payroll_periods(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id), FOREIGN KEY (updated_by) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS payroll_issues (
    id INT AUTO_INCREMENT PRIMARY KEY, employee_id INT NOT NULL, period_id INT NOT NULL,
    pay_record_id INT, message TEXT NOT NULL, status VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    response TEXT, created_at VARCHAR(30) NOT NULL, resolved_at VARCHAR(30), resolved_by INT,
    FOREIGN KEY (employee_id) REFERENCES employees(id), FOREIGN KEY (period_id) REFERENCES payroll_periods(id),
    FOREIGN KEY (pay_record_id) REFERENCES pay_records(id), FOREIGN KEY (resolved_by) REFERENCES users(id)
  )`,
];

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private sqlite?: DatabaseSync;
  private pool?: Pool;
  private transactionOpen = false;
  private transactionTail: Promise<void> = Promise.resolve();
  get isMysql(): boolean { return Boolean(this.pool); }

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
    await this.migrate();
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

  private async migrate(): Promise<void> {
    const mysqlMode = Boolean(this.pool);
    const ddl = mysqlMode ? [
      `CREATE TABLE IF NOT EXISTS schema_migrations (version INT PRIMARY KEY, applied_at VARCHAR(30) NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS catalog_options (id INT AUTO_INCREMENT PRIMARY KEY, category VARCHAR(30) NOT NULL, name VARCHAR(140) NOT NULL, active TINYINT(1) NOT NULL DEFAULT 1, UNIQUE KEY uq_catalog (category,name))`,
      `CREATE TABLE IF NOT EXISTS employee_code_config (id INT PRIMARY KEY, prefix VARCHAR(20) NOT NULL, separator VARCHAR(5) NOT NULL, digits INT NOT NULL, next_number BIGINT NOT NULL)`,
    ] : [
      `CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS catalog_options (id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT NOT NULL, name TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, UNIQUE(category,name))`,
      `CREATE TABLE IF NOT EXISTS employee_code_config (id INTEGER PRIMARY KEY CHECK(id=1), prefix TEXT NOT NULL, separator TEXT NOT NULL, digits INTEGER NOT NULL, next_number INTEGER NOT NULL)`,
    ];
    for (const sql of ddl) await this.executeDdl(sql);
    if(!(await this.hasColumn('users','auth_version'))) await this.executeDdl(`ALTER TABLE users ADD COLUMN auth_version ${mysqlMode?'INT':'INTEGER'} NOT NULL DEFAULT 1`);
    if(!(await this.hasColumn('users','can_modify_catalogs'))) await this.executeDdl(`ALTER TABLE users ADD COLUMN can_modify_catalogs ${mysqlMode?'TINYINT(1)':'INTEGER'} NOT NULL DEFAULT 0`);
    const applied = await this.get<{version:number}>('SELECT version FROM schema_migrations WHERE version=1');
    if (!applied) {
      for (const [field, category] of Object.entries({job_title:'job_title',area:'area',service_line:'service_line',office:'office',employment_type:'employment_type'})) {
        for (const table of ['employees','employment_history']) {
          const column = `${field}_id`;
          if (!(await this.hasColumn(table,column))) {
            await this.executeDdl(`ALTER TABLE ${table} ADD COLUMN ${column} ${mysqlMode ? 'INT' : 'INTEGER REFERENCES catalog_options(id)'}`);
          }
          if(mysqlMode) {
            const constraint=`fk_${table}_${column}`;
            const existing=await this.get('SELECT 1 FROM information_schema.table_constraints WHERE table_schema=DATABASE() AND table_name=? AND constraint_name=?',[table,constraint]);
            if(!existing) await this.executeDdl(`ALTER TABLE ${table} ADD CONSTRAINT ${constraint} FOREIGN KEY (${column}) REFERENCES catalog_options(id)`);
          }
        }
        const values = await this.all<{name:string}>(`SELECT DISTINCT ${field} AS name FROM employees WHERE ${field} IS NOT NULL AND ${field}<>''`);
        for (const value of values) {
          if(!(await this.get('SELECT id FROM catalog_options WHERE category=? AND name=?',[category,value.name])))
            await this.run('INSERT INTO catalog_options (category,name,active) VALUES (?,?,1)', [category,value.name]);
          const option = await this.get<{id:number}>('SELECT id FROM catalog_options WHERE category=? AND name=?',[category,value.name]);
          for (const table of ['employees','employment_history']) await this.run(`UPDATE ${table} SET ${field}_id=? WHERE ${field}=?`,[option!.id,value.name]);
        }
      }
      await this.run('INSERT INTO schema_migrations (version,applied_at) VALUES (?,?)',[1,new Date().toISOString()]);
    }
    if (!(await this.get('SELECT id FROM employee_code_config WHERE id=1'))) {
      const max = await this.get<{n:number}>('SELECT COALESCE(MAX(id),0) AS n FROM employees');
      await this.run('INSERT INTO employee_code_config (id,prefix,separator,digits,next_number) VALUES (1,?,?,?,?)',['EMP','-',4,Number(max?.n || 0)+1]);
    }
    if (!(await this.get('SELECT version FROM schema_migrations WHERE version=2'))) {
      for (const sql of mysqlMode ? mysqlMvpSchema : sqliteMvpSchema) await this.executeDdl(sql);
      await this.run('INSERT INTO schema_migrations (version,applied_at) VALUES (?,?)',[2,new Date().toISOString()]);
    }
    if (!(await this.get('SELECT version FROM schema_migrations WHERE version=3'))) {
      for (const [table,column] of [['vacancies','questions_json'],['applications','answers_json']]) {
        if(!(await this.hasColumn(table,column))) await this.executeDdl(`ALTER TABLE ${table} ADD COLUMN ${column} ${mysqlMode?'TEXT':'TEXT'}`);
      }
      await this.run('INSERT INTO schema_migrations (version,applied_at) VALUES (?,?)',[3,new Date().toISOString()]);
    }
    if (!(await this.get('SELECT version FROM schema_migrations WHERE version=4'))) {
      for (const sql of mysqlMode ? mysqlMvpExtras : sqliteMvpExtras) await this.executeDdl(sql);
      await this.run('INSERT INTO schema_migrations (version,applied_at) VALUES (?,?)',[4,new Date().toISOString()]);
    }
    if (!(await this.get('SELECT version FROM schema_migrations WHERE version=5'))) {
      for (const sql of mysqlMode ? mysqlSelectionSchema : sqliteSelectionSchema) await this.executeDdl(sql);
      await this.run('INSERT INTO schema_migrations (version,applied_at) VALUES (?,?)',[5,new Date().toISOString()]);
    }
    if (!(await this.get('SELECT version FROM schema_migrations WHERE version=6'))) {
      if (!(await this.hasColumn('leave_types','pay_treatment')))
        await this.executeDdl(`ALTER TABLE leave_types ADD COLUMN pay_treatment ${mysqlMode ? "VARCHAR(20) NOT NULL DEFAULT 'Pagada'" : "TEXT NOT NULL DEFAULT 'Pagada'"}`);
      for (const sql of mysqlMode ? mysqlPayrollCalcSchema : sqlitePayrollCalcSchema) await this.executeDdl(sql);
      await this.run('INSERT INTO schema_migrations (version,applied_at) VALUES (?,?)',[6,new Date().toISOString()]);
    }
  }

  private async executeDdl(sql:string):Promise<void> { if (this.pool) await this.pool.query(sql); else this.sqlite!.exec(sql); }
  private async hasColumn(table:string,column:string):Promise<boolean> {
    if (this.pool) return Boolean(await this.get('SELECT 1 FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name=? AND column_name=?',[table,column]));
    return (await this.all<{name:string}>(`PRAGMA table_info(${table})`)).some(row=>row.name===column);
  }

  async transaction<T>(work:(tx:{get:<R extends Row=Row>(sql:string,params?:Param[])=>Promise<R|undefined>;run:(sql:string,params?:Param[])=>Promise<number>})=>Promise<T>):Promise<T> {
    if (this.pool) {
      const connection = await this.pool.getConnection();
      try {
        await connection.beginTransaction();
        const tx = {
          get: async <R extends Row=Row>(sql:string,params:Param[]=[]) => { const [rows]=await connection.execute<RowDataPacket[]>(sql,params); return rows[0] as R|undefined; },
          run: async (sql:string,params:Param[]=[]) => { const [result]=await connection.execute<ResultSetHeader>(sql,params); return result.insertId; },
        };
        const result=await work(tx); await connection.commit(); return result;
      } catch(error) { await connection.rollback(); throw error; } finally { connection.release(); }
    }
    const previous=this.transactionTail;
    let release!:()=>void;
    this.transactionTail=new Promise<void>(resolve=>{ release=resolve; });
    await previous;
    try {
      if (this.transactionOpen) throw new Error('Transacción SQLite anidada');
      this.transactionOpen=true;
      this.sqlite!.exec('BEGIN IMMEDIATE');
      try { const result=await work({get:<R extends Row=Row>(sql:string,params:Param[]=[])=>this.get<R>(sql,params),run:(sql:string,params:Param[]=[])=>this.run(sql,params)}); this.sqlite!.exec('COMMIT'); return result; }
      catch(error) { this.sqlite!.exec('ROLLBACK'); throw error; }
    } finally { this.transactionOpen=false; release(); }
  }

  async onModuleDestroy(): Promise<void> {
    this.sqlite?.close();
    await this.pool?.end();
  }
}
