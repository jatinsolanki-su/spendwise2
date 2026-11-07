/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Spendwise 2.0 Database Connection & Query Execution Layer
 * Uses mysql2/promise connection pool for native SQL queries with automated
 * fallback to local relational engine when MySQL is not running.
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

export let isMySqlActive = false;
let pool: mysql.Pool | null = null;

export async function initDatabaseConnection(): Promise<void> {
  try {
    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      decimalNumbers: true,
    });

    // Test ping
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    isMySqlActive = true;
    console.log(`[Spendwise 2.0 DB] ✓ Connected to MySQL database "${DB_NAME}" at ${DB_HOST}:${DB_PORT}`);
  } catch (err: any) {
    isMySqlActive = false;
    console.warn(`[Spendwise 2.0 DB] ! MySQL server at ${DB_HOST}:${DB_PORT} is offline (${err.code || err.message}).`);
    console.warn(`[Spendwise 2.0 DB] -> Operating in Local Relational Store mode (./data/spendwise_store.json).`);
    console.warn(`[Spendwise 2.0 DB] -> Run 'node scripts/setup-db.js' when your local MySQL service is started.`);
  }
}

/**
 * Execute a native SQL query with parameters
 */
export async function query<T = any>(sql: string, params?: any[]): Promise<[T, any]> {
  if (isMySqlActive && pool) {
    return (await pool.query(sql, params)) as [T, any];
  }
  throw new Error('MySQL is not active. Use typed repository services for unified local/MySQL operations.');
}

export function getPool(): mysql.Pool | null {
  return pool;
}
