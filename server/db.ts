
/**
 * Spendwise 2.0 Database Connection & Query Execution Layer
 * MySQL-compatible connection using mysql2/promise.
 * Supports secure TiDB TLS connections.
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { localStore } from './localSqlStore.js';

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'spendwise_db';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const DB_SSL_CA = process.env.DB_SSL_CA?.replace(/\\n/g, '\n');

export let isMySqlActive = false;
let pool: mysql.Pool | null = null;

export async function initDatabaseConnection(): Promise<void> {
  try {
    if (IS_PRODUCTION && !DB_SSL_CA) {
      throw new Error('DB_SSL_CA is required in production.');
    }

    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,

      ssl: DB_SSL_CA
        ? {
            ca: DB_SSL_CA,
            rejectUnauthorized: true,
          }
        : undefined,

      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      decimalNumbers: true,
    });

    const connection = await pool.getConnection();

    try {
      await connection.ping();
    } finally {
      connection.release();
    }

    isMySqlActive = true;

    console.log(
      `[Spendwise 2.0 DB] Connected to MySQL database "${DB_NAME}" at ${DB_HOST}:${DB_PORT}`
    );
  } catch (err: any) {
    isMySqlActive = false;

    if (pool) {
      await pool.end().catch(() => {});
      pool = null;
    }

    console.error(
      `[Spendwise 2.0 DB] Connection failed: ${err.code || err.message}`
    );

    if (IS_PRODUCTION) {
      throw err;
    }

    console.warn(
      '[Spendwise 2.0 DB] Operating in Local Relational Store mode.'
    );
    console.warn(
      "[Spendwise 2.0 DB] Start your local MySQL service or use the local development store."
    );
  }
}

/**
 * Execute a native SQL query with parameters.
 */
export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<[T, any]> {
  if (isMySqlActive && pool) {
    return (await pool.query(sql, params)) as [T, any];
  }

  throw new Error(
    'MySQL is not active. Use typed repository services for unified local/MySQL operations.'
  );
}

export function getPool(): mysql.Pool | null {
  return pool;
}
