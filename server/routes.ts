/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Spendwise 2.0 REST API Routes
 */

import { Router, Response } from 'express';
import crypto from 'crypto';
import {
  requireAuth,
  AuthenticatedRequest,
  hashPassword,
  comparePassword,
  generateToken,
  setAuthCookie,
  clearAuthCookie,
} from './auth.js';
import {
  UserService,
  PreferencesService,
  AccountService,
  CategoryService,
  TransactionService,
  BudgetService,
  AnalyticsService,
} from './services.js';
import { isMySqlActive } from './db.js';
import { isSmtpConfigured, sendPasswordResetEmail } from './mail.js';

export const apiRouter = Router();

// --- Health / Status Endpoint ---
apiRouter.get('/health', async (req, res) => {
  res.json({
    status: 'ok',
    version: '2.0.0',
    database: isMySqlActive ? 'MySQL 8+ (Active Pool)' : 'Spendwise Local Relational Store (Data directory: ./data)',
    isMySqlActive,
    isSmtpConfigured: isSmtpConfigured(),
    timestamp: new Date().toISOString(),
  });
});

// GET /api/auth/features
apiRouter.get('/auth/features', (req, res) => {
  res.json({
    emailPasswordResetAvailable: isSmtpConfigured(),
  });
});

// ============================================================
// AUTHENTICATION ROUTES
// ============================================================

// POST /api/auth/register
apiRouter.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Please enter your full name.' });
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const existingUser = await UserService.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const passwordHash = await hashPassword(password);
    const user = await UserService.create(name.trim(), email.trim(), passwordHash);

    const token = generateToken({ id: user.id, email: user.email, name: user.name });
    setAuthCookie(res, token);

    const preferences = await PreferencesService.get(user.id);

    return res.status(201).json({
      message: 'Registration successful',
      user: { id: user.id, name: user.name, email: user.email },
      preferences,
      token,
    });
  } catch (err: any) {
    console.error('[Register Error]:', err);
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// POST /api/auth/login
apiRouter.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await UserService.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken({ id: user.id, email: user.email, name: user.name });
    setAuthCookie(res, token);

    const preferences = await PreferencesService.get(user.id);

    return res.json({
      message: 'Sign in successful',
      user: { id: user.id, name: user.name, email: user.email },
      preferences,
      token,
    });
  } catch (err: any) {
    console.error('[Login Error]:', err);
    return res.status(500).json({ error: 'An unexpected error occurred during sign in.' });
  }
});

// POST /api/auth/logout
apiRouter.post('/auth/logout', (req, res) => {
  clearAuthCookie(res);
  return res.json({ message: 'Successfully signed out.' });
});

// GET /api/auth/me
apiRouter.get('/auth/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await UserService.findById(req.user!.id);
    if (!user) {
      clearAuthCookie(res);
      return res.status(404).json({ error: 'User not found.' });
    }
    const preferences = await PreferencesService.get(user.id);
    return res.json({ user, preferences });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/forgot-password
apiRouter.post('/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    // Gracefully handle absent SMTP configuration
    if (!isSmtpConfigured()) {
      return res.status(503).json({
        error: 'Password recovery via email is currently unavailable because email delivery (SMTP) is not configured on this server. Please contact your system administrator.',
        emailDeliveryAvailable: false,
      });
    }

    const user = await UserService.findByEmail(email.trim());
    if (user) {
      const resetToken = crypto.randomBytes(24).toString('hex');
      const expires = new Date(Date.now() + 3600000); // 1 hour

      await UserService.setResetToken(user.email, resetToken, expires);

      // Dispatch real email via nodemailer
      try {
        await sendPasswordResetEmail({
          toEmail: user.email,
          resetToken,
          userName: user.name,
        });
      } catch (mailErr: any) {
        console.error('[Forgot Password Mail Error]:', mailErr.message);
        return res.status(500).json({ error: 'Failed to send password reset email. Please try again later.' });
      }
    }

    // Security best practice: Never reveal if email exists, and never expose reset tokens in response
    return res.json({
      message: 'If an account exists with that email address, password reset instructions have been sent.',
      emailDeliveryAvailable: true,
    });
  } catch (err: any) {
    console.error('[Forgot Password Exception]:', err);
    return res.status(500).json({ error: 'An unexpected error occurred while processing password recovery.' });
  }
});

// POST /api/auth/reset-password
apiRouter.post('/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Valid token and password (min 6 chars) are required.' });
    }

    const user = await UserService.findByResetToken(token);
    if (!user) {
      return res.status(400).json({ error: 'Reset token is invalid or has expired.' });
    }

    const passwordHash = await hashPassword(newPassword);
    await UserService.updatePassword(user.id, passwordHash);

    // Clear reset token
    await UserService.setResetToken(user.email, '', new Date(0));

    return res.json({ message: 'Password has been successfully updated. You can now sign in.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ============================================================
// PROFILE & PREFERENCES ROUTES
// ============================================================

// GET /api/profile
apiRouter.get('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profile = await UserService.findById(req.user!.id);
    const preferences = await PreferencesService.get(req.user!.id);
    return res.json({ profile, preferences });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/profile
apiRouter.put('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email } = req.body;
    const updated = await UserService.updateProfile(req.user!.id, { name, email });
    return res.json({ message: 'Profile updated successfully', user: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// PUT /api/profile/password
apiRouter.put('/profile/password', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Current password and new password (min 6 characters) are required.' });
    }

    const fullUser = await UserService.findByEmail(req.user!.email);
    if (!fullUser) return res.status(404).json({ error: 'User not found' });

    const isMatch = await comparePassword(currentPassword, fullUser.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password does not match.' });
    }

    const newHash = await hashPassword(newPassword);
    await UserService.updatePassword(req.user!.id, newHash);

    return res.json({ message: 'Password changed successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/preferences
apiRouter.get('/preferences', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const preferences = await PreferencesService.get(req.user!.id);
    return res.json(preferences);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/preferences
apiRouter.put('/preferences', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await PreferencesService.update(req.user!.id, req.body);
    return res.json({ message: 'Preferences updated successfully', preferences: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ============================================================
// ACCOUNTS ROUTES
// ============================================================

// GET /api/accounts
apiRouter.get('/accounts', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const accounts = await AccountService.getAll(req.user!.id);
    return res.json(accounts);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/accounts
apiRouter.post('/accounts', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, type, balance, currency, color, notes } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Account name is required.' });
    }
    const acc = await AccountService.create(req.user!.id, {
      name: name.trim(),
      type: type || 'current',
      balance: Number(balance) || 0,
      currency: currency || 'USD',
      color: color || '#087F5B',
      notes,
    });
    return res.status(201).json(acc);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// PUT /api/accounts/:id
apiRouter.put('/accounts/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const acc = await AccountService.update(id, req.user!.id, req.body);
    return res.json(acc);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// DELETE /api/accounts/:id
apiRouter.delete('/accounts/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await AccountService.delete(id, req.user!.id);
    return res.json({ message: 'Account deleted successfully' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ============================================================
// CATEGORIES ROUTES
// ============================================================

// GET /api/categories
apiRouter.get('/categories', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const type = req.query.type as 'income' | 'expense' | undefined;
    const categories = await CategoryService.getAll(req.user!.id, type);
    return res.json(categories);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/categories
apiRouter.post('/categories', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, type, color, icon } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Category name is required.' });
    }
    const cat = await CategoryService.create(req.user!.id, {
      name: name.trim(),
      type: type || 'expense',
      color: color || '#087F5B',
      icon: icon || 'tag',
    });
    return res.status(201).json(cat);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// PUT /api/categories/:id
apiRouter.put('/categories/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const cat = await CategoryService.update(id, req.user!.id, req.body);
    return res.json(cat);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// DELETE /api/categories/:id
apiRouter.delete('/categories/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await CategoryService.delete(id, req.user!.id);
    return res.json({ message: 'Category deleted successfully' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ============================================================
// TRANSACTIONS ROUTES
// ============================================================

// GET /api/transactions
apiRouter.get('/transactions', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await TransactionService.getAll(req.user!.id, req.query);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/transactions/:id
apiRouter.get('/transactions/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const tx = await TransactionService.getById(id, req.user!.id);
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    return res.json(tx);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/transactions
apiRouter.post('/transactions', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, amount, type, account_id, category_id, date, description, notes } = req.body;
    if (!title || !amount || !type || !account_id || !category_id || !date) {
      return res.status(400).json({ error: 'Title, amount, type, account, category, and date are required.' });
    }

    const tx = await TransactionService.create(req.user!.id, {
      title,
      amount,
      type,
      account_id: Number(account_id),
      category_id: Number(category_id),
      date,
      description,
      notes,
    });
    return res.status(201).json(tx);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// PUT /api/transactions/:id
apiRouter.put('/transactions/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const tx = await TransactionService.update(id, req.user!.id, req.body);
    return res.json(tx);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// DELETE /api/transactions/:id
apiRouter.delete('/transactions/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await TransactionService.delete(id, req.user!.id);
    return res.json({ message: 'Transaction deleted successfully' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ============================================================
// BUDGETS ROUTES
// ============================================================

// GET /api/budgets
apiRouter.get('/budgets', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const month = req.query.month as string | undefined;
    const budgets = await BudgetService.getAll(req.user!.id, month);
    return res.json(budgets);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/budgets
apiRouter.post('/budgets', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category_id, month, limit_amount } = req.body;
    if (!category_id || !month || !limit_amount) {
      return res.status(400).json({ error: 'Category, month, and spending limit are required.' });
    }
    const budget = await BudgetService.create(req.user!.id, {
      category_id: Number(category_id),
      month,
      limit_amount: Number(limit_amount),
    });
    return res.status(201).json(budget);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// PUT /api/budgets/:id
apiRouter.put('/budgets/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const budget = await BudgetService.update(id, req.user!.id, req.body);
    return res.json(budget);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// DELETE /api/budgets/:id
apiRouter.delete('/budgets/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await BudgetService.delete(id, req.user!.id);
    return res.json({ message: 'Budget deleted successfully' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ============================================================
// ANALYTICS ROUTES
// ============================================================

// GET /api/analytics/overview
apiRouter.get('/analytics/overview', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const month = req.query.month as string | undefined;
    const overview = await AnalyticsService.getOverview(req.user!.id, month);
    return res.json(overview);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/monthly
apiRouter.get('/analytics/monthly', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const monthsCount = req.query.monthsCount ? parseInt(req.query.monthsCount as string, 10) : 6;
    const data = await AnalyticsService.getMonthly(req.user!.id, monthsCount);
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/categories
apiRouter.get('/analytics/categories', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const month = req.query.month as string | undefined;
    const type = (req.query.type as 'expense' | 'income') || 'expense';
    const data = await AnalyticsService.getCategories(req.user!.id, month, type);
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
