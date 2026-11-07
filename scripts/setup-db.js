#!/usr/bin/env node
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Spendwise 2.0 Database Setup & Verification Script
 * Reads MySQL configuration from .env or environment variables.
 * Safe to run repeatedly; does not drop existing data.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env if present
const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'spendwise_db';

console.log('====================================================');
console.log(' SPENDWISE 2.0 — DATABASE SETUP & VERIFICATION');
console.log('====================================================');
console.log(`Connecting to MySQL Server:`);
console.log(` - Host: ${DB_HOST}`);
console.log(` - Port: ${DB_PORT}`);
console.log(` - User: ${DB_USER}`);
console.log(` - Target Database: ${DB_NAME}`);
console.log('----------------------------------------------------');

async function setup() {
  let rootConnection;
  try {
    // Step 1: Connect to server without database selection first
    rootConnection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      multipleStatements: true,
    });
    console.log('✓ Successfully connected to MySQL server.');

    // Step 2: Create database if it does not exist
    await rootConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    console.log(`✓ Database \`${DB_NAME}\` verified / created.`);
    await rootConnection.end();

    // Step 3: Connect directly to the spendwise database
    const dbConnection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      multipleStatements: true,
    });

    // Step 4: Read schema file
    const schemaPath = path.resolve(__dirname, '..', 'database', 'database.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Filter out DATABASE creation and USE commands to run cleanly on the target DB
    const statements = schemaSql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'))
      .filter((s) => !s.toUpperCase().startsWith('CREATE DATABASE') && !s.toUpperCase().startsWith('USE '));

    console.log(`Executing table definitions and constraints (${statements.length} statements)...`);
    for (const statement of statements) {
      if (statement.trim()) {
        await dbConnection.query(statement);
      }
    }

    // Step 5: Verify all tables exist
    const [tables] = await dbConnection.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ?
    `, [DB_NAME]);

    const requiredTables = ['users', 'accounts', 'categories', 'transactions', 'budgets', 'user_preferences'];
    const foundTableNames = Array.isArray(tables)
      ? tables.map((t) => (t.TABLE_NAME ? t.TABLE_NAME.toLowerCase() : ''))
      : [];

    console.log('\n--- Verification Summary ---');
    let allFound = true;
    for (const req of requiredTables) {
      if (foundTableNames.includes(req)) {
        console.log(`  [OK] Table \`${req}\` is present.`);
      } else {
        console.error(`  [FAIL] Missing required table \`${req}\`!`);
        allFound = false;
      }
    }

    await dbConnection.end();

    if (!allFound) {
      console.error('\nSetup completed with missing tables. Please review error messages above.');
      process.exit(1);
    }

    console.log('\n====================================================');
    console.log('✓ Spendwise 2.0 database setup completed successfully!');
    console.log('  No existing user data was altered or removed.');
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n[Database Setup Error]:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Troubleshooting: Could not connect to MySQL server. Please ensure:');
      console.error(' 1. MySQL 8 service is started (e.g. net start MySQL or systemctl start mysql)');
      console.error(` 2. Host (${DB_HOST}) and port (${DB_PORT}) are reachable`);
      console.error(' 3. DB_USER and DB_PASSWORD in .env match your local MySQL credentials');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Troubleshooting: Access denied for MySQL user. Check DB_USER and DB_PASSWORD in .env.');
    }
    process.exit(1);
  }
}

setup();
