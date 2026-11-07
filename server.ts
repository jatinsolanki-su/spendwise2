/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Spendwise 2.0 Full-Stack Server Entry Point
 * Express API + Vite Middleware in development
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes.js';
import { initDatabaseConnection } from './server/db.js';
import { COOKIE_SECRET } from './server/auth.js';
import { isSmtpConfigured } from './server/mail.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();

  // Middleware
  app.use(cors({
    origin: true,
    credentials: true,
  }));
  app.use(cookieParser(COOKIE_SECRET));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize DB connection
  await initDatabaseConnection();

  // Mount API Router
  app.use('/api', apiRouter);

  // Vite integration: Dev middleware vs Prod static files
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // Centralized Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[Unhandled Server Error]:', err);
    res.status(500).json({
      error: 'An unexpected internal server error occurred.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(` SPENDWISE 2.0 APPLICATION SERVER RUNNING`);
    console.log(` - Port: ${PORT}`);
    console.log(` - Local URL: http://localhost:${PORT}`);
    console.log(` - Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` - Email Delivery: ${isSmtpConfigured() ? 'SMTP Active' : 'Optional / Disabled (No SMTP variables)'}`);
    console.log(`====================================================`);
  });
}

startServer().catch((err) => {
  console.error('[Fatal Server Startup Error]:', err);
  process.exit(1);
});
