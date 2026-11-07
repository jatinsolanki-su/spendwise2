/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Spendwise 2.0 Repository & Business Logic Services
 * Executes native MySQL queries when MySQL is active, with seamless local relational fallback.
 */

import { isMySqlActive, getPool } from './db.js';
import { localStore } from './localSqlStore.js';

// --- User Service ---
export const UserService = {
  async findByEmail(email: string) {
    if (isMySqlActive) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        'SELECT * FROM users WHERE email = ? LIMIT 1',
        [email.toLowerCase()]
      );
      return rows[0] || null;
    }
    return localStore.getUserByEmail(email) || null;
  },

  async findById(id: number) {
    if (isMySqlActive) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        'SELECT id, name, email, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
        [id]
      );
      return rows[0] || null;
    }
    const u = localStore.getUserById(id);
    if (!u) return null;
    const { password_hash, reset_token, reset_token_expires, ...safe } = u;
    return safe;
  },

  async create(name: string, email: string, passwordHash: string) {
    if (isMySqlActive) {
      const pool = getPool()!;
      const [result]: any = await pool.query(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
        [name, email.toLowerCase(), passwordHash]
      );
      const newUserId = result.insertId;

      // Seed default user preferences
      await pool.query(
        'INSERT INTO user_preferences (user_id, theme, currency, date_format) VALUES (?, "light", "USD", "YYYY-MM-DD")',
        [newUserId]
      );

      // Seed starter categories
      const starterCategories = [
        ['Food & Dining', 'expense', '#087F5B', 'utensils'],
        ['Transportation', 'expense', '#099268', 'car'],
        ['Housing & Utilities', 'expense', '#2B8A3E', 'home'],
        ['Entertainment', 'expense', '#37B24D', 'film'],
        ['Shopping', 'expense', '#20C997', 'shopping-bag'],
        ['Health & Medical', 'expense', '#12B886', 'heart-pulse'],
        ['Salary', 'income', '#087F5B', 'briefcase'],
        ['Investments', 'income', '#2B8A3E', 'trending-up'],
        ['Freelance', 'income', '#37B24D', 'laptop'],
      ];

      for (const [catName, catType, color, icon] of starterCategories) {
        await pool.query(
          'INSERT INTO categories (user_id, name, type, color, icon) VALUES (?, ?, ?, ?, ?)',
          [newUserId, catName, catType, color, icon]
        );
      }

      // Seed primary operational account with 0.00 balance
      await pool.query(
        'INSERT INTO accounts (user_id, name, type, balance, currency, color) VALUES (?, "Main Checking Account", "current", 0.00, "USD", "#087F5B")',
        [newUserId]
      );

      return { id: newUserId, name, email: email.toLowerCase() };
    }

    const u = localStore.createUser(name, email, passwordHash);
    return { id: u.id, name: u.name, email: u.email };
  },

  async updateProfile(id: number, fields: { name?: string; email?: string }) {
    if (isMySqlActive) {
      const pool = getPool()!;
      const sets: string[] = [];
      const values: any[] = [];
      if (fields.name) {
        sets.push('name = ?');
        values.push(fields.name);
      }
      if (fields.email) {
        sets.push('email = ?');
        values.push(fields.email.toLowerCase());
      }
      if (sets.length > 0) {
        values.push(id);
        await pool.query(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, values);
      }
      return this.findById(id);
    }
    const u = localStore.updateUser(id, fields);
    const { password_hash, ...safe } = u;
    return safe;
  },

  async updatePassword(id: number, passwordHash: string) {
    if (isMySqlActive) {
      const pool = getPool()!;
      await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);
      return true;
    }
    localStore.updateUser(id, { password_hash: passwordHash });
    return true;
  },

  async setResetToken(email: string, token: string, expires: Date) {
    if (isMySqlActive) {
      const pool = getPool()!;
      await pool.query(
        'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?',
        [token, expires, email.toLowerCase()]
      );
      return true;
    }
    const user = localStore.getUserByEmail(email);
    if (!user) return false;
    localStore.updateUser(user.id, {
      reset_token: token,
      reset_token_expires: expires.toISOString(),
    });
    return true;
  },

  async findByResetToken(token: string) {
    if (isMySqlActive) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW() LIMIT 1',
        [token]
      );
      return rows[0] || null;
    }
    const now = new Date().toISOString();
    const user = localStore.getUserByEmail('') || null; // search in memory
    const found = (localStore as any).data.users.find(
      (u: any) => u.reset_token === token && u.reset_token_expires && u.reset_token_expires > now
    );
    return found || null;
  },
};

// --- Preferences Service ---
export const PreferencesService = {
  async get(userId: number) {
    if (isMySqlActive) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        'SELECT * FROM user_preferences WHERE user_id = ? LIMIT 1',
        [userId]
      );
      if (rows[0]) return rows[0];
      await pool.query(
        'INSERT INTO user_preferences (user_id, theme, currency, date_format) VALUES (?, "light", "USD", "YYYY-MM-DD")',
        [userId]
      );
      return { user_id: userId, theme: 'light', currency: 'USD', date_format: 'YYYY-MM-DD', notification_budget_alerts: true };
    }
    return localStore.getPreferences(userId);
  },

  async update(userId: number, fields: any) {
    if (isMySqlActive) {
      const pool = getPool()!;
      const sets: string[] = [];
      const values: any[] = [];
      if (fields.theme !== undefined) { sets.push('theme = ?'); values.push(fields.theme); }
      if (fields.currency !== undefined) { sets.push('currency = ?'); values.push(fields.currency); }
      if (fields.date_format !== undefined) { sets.push('date_format = ?'); values.push(fields.date_format); }
      if (fields.notification_budget_alerts !== undefined) { sets.push('notification_budget_alerts = ?'); values.push(fields.notification_budget_alerts); }
      if (sets.length > 0) {
        values.push(userId);
        await pool.query(`UPDATE user_preferences SET ${sets.join(', ')} WHERE user_id = ?`, values);
      }
      return this.get(userId);
    }
    return localStore.updatePreferences(userId, fields);
  },
};

// --- Accounts Service ---
export const AccountService = {
  async getAll(userId: number) {
    if (isMySqlActive) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        'SELECT * FROM accounts WHERE user_id = ? ORDER BY created_at ASC',
        [userId]
      );
      return rows;
    }
    return localStore.getAccounts(userId);
  },

  async getById(id: number, userId: number) {
    if (isMySqlActive) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        'SELECT * FROM accounts WHERE id = ? AND user_id = ? LIMIT 1',
        [id, userId]
      );
      return rows[0] || null;
    }
    return localStore.getAccountById(id, userId) || null;
  },

  async create(userId: number, data: any) {
    if (isMySqlActive) {
      const pool = getPool()!;
      const [result]: any = await pool.query(
        'INSERT INTO accounts (user_id, name, type, balance, currency, color, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, data.name, data.type || 'current', data.balance || 0, data.currency || 'USD', data.color || '#087F5B', data.notes || null]
      );
      return this.getById(result.insertId, userId);
    }
    return localStore.createAccount(userId, data);
  },

  async update(id: number, userId: number, data: any) {
    if (isMySqlActive) {
      const pool = getPool()!;
      const sets: string[] = [];
      const values: any[] = [];
      if (data.name !== undefined) { sets.push('name = ?'); values.push(data.name); }
      if (data.type !== undefined) { sets.push('type = ?'); values.push(data.type); }
      if (data.balance !== undefined) { sets.push('balance = ?'); values.push(data.balance); }
      if (data.currency !== undefined) { sets.push('currency = ?'); values.push(data.currency); }
      if (data.color !== undefined) { sets.push('color = ?'); values.push(data.color); }
      if (data.notes !== undefined) { sets.push('notes = ?'); values.push(data.notes); }
      if (sets.length > 0) {
        values.push(id, userId);
        await pool.query(`UPDATE accounts SET ${sets.join(', ')} WHERE id = ? AND user_id = ?`, values);
      }
      return this.getById(id, userId);
    }
    return localStore.updateAccount(id, userId, data);
  },

  async delete(id: number, userId: number) {
    if (isMySqlActive) {
      const pool = getPool()!;
      // Check if transactions exist
      const [txs] = await pool.query<any[]>(
        'SELECT id FROM transactions WHERE account_id = ? AND user_id = ? LIMIT 1',
        [id, userId]
      );
      if (txs.length > 0) {
        throw new Error('Cannot delete account with existing transactions. Please reassign or delete transactions first.');
      }
      await pool.query('DELETE FROM accounts WHERE id = ? AND user_id = ?', [id, userId]);
      return true;
    }
    localStore.deleteAccount(id, userId);
    return true;
  },
};

// --- Categories Service ---
export const CategoryService = {
  async getAll(userId: number, type?: 'income' | 'expense') {
    if (isMySqlActive) {
      const pool = getPool()!;
      let sql = 'SELECT * FROM categories WHERE user_id = ?';
      const params: any[] = [userId];
      if (type) {
        sql += ' AND type = ?';
        params.push(type);
      }
      sql += ' ORDER BY name ASC';
      const [rows] = await pool.query<any[]>(sql, params);
      return rows;
    }
    return localStore.getCategories(userId, type);
  },

  async getById(id: number, userId: number) {
    if (isMySqlActive) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        'SELECT * FROM categories WHERE id = ? AND user_id = ? LIMIT 1',
        [id, userId]
      );
      return rows[0] || null;
    }
    return localStore.getCategoryById(id, userId) || null;
  },

  async create(userId: number, data: any) {
    if (isMySqlActive) {
      const pool = getPool()!;
      const [result]: any = await pool.query(
        'INSERT INTO categories (user_id, name, type, color, icon) VALUES (?, ?, ?, ?, ?)',
        [userId, data.name, data.type || 'expense', data.color || '#087F5B', data.icon || 'tag']
      );
      return this.getById(result.insertId, userId);
    }
    return localStore.createCategory(userId, data);
  },

  async update(id: number, userId: number, data: any) {
    if (isMySqlActive) {
      const pool = getPool()!;
      const sets: string[] = [];
      const values: any[] = [];
      if (data.name !== undefined) { sets.push('name = ?'); values.push(data.name); }
      if (data.type !== undefined) { sets.push('type = ?'); values.push(data.type); }
      if (data.color !== undefined) { sets.push('color = ?'); values.push(data.color); }
      if (data.icon !== undefined) { sets.push('icon = ?'); values.push(data.icon); }
      if (sets.length > 0) {
        values.push(id, userId);
        await pool.query(`UPDATE categories SET ${sets.join(', ')} WHERE id = ? AND user_id = ?`, values);
      }
      return this.getById(id, userId);
    }
    return localStore.updateCategory(id, userId, data);
  },

  async delete(id: number, userId: number) {
    if (isMySqlActive) {
      const pool = getPool()!;
      const [txs] = await pool.query<any[]>(
        'SELECT id FROM transactions WHERE category_id = ? AND user_id = ? LIMIT 1',
        [id, userId]
      );
      if (txs.length > 0) {
        throw new Error('Cannot delete category with associated transactions. Please reassign transactions first.');
      }
      await pool.query('DELETE FROM categories WHERE id = ? AND user_id = ?', [id, userId]);
      await pool.query('DELETE FROM budgets WHERE category_id = ? AND user_id = ?', [id, userId]);
      return true;
    }
    localStore.deleteCategory(id, userId);
    return true;
  },
};

// --- Transactions Service ---
export const TransactionService = {
  async getAll(userId: number, filters?: any) {
    if (isMySqlActive) {
      const pool = getPool()!;
      let whereClauses = ['t.user_id = ?'];
      const params: any[] = [userId];

      if (filters?.search) {
        whereClauses.push('(t.title LIKE ? OR t.description LIKE ?)');
        const term = `%${filters.search}%`;
        params.push(term, term);
      }
      if (filters?.startDate) {
        whereClauses.push('t.date >= ?');
        params.push(filters.startDate);
      }
      if (filters?.endDate) {
        whereClauses.push('t.date <= ?');
        params.push(filters.endDate);
      }
      if (filters?.categoryId) {
        whereClauses.push('t.category_id = ?');
        params.push(Number(filters.categoryId));
      }
      if (filters?.accountId) {
        whereClauses.push('t.account_id = ?');
        params.push(Number(filters.accountId));
      }
      if (filters?.type) {
        whereClauses.push('t.type = ?');
        params.push(filters.type);
      }

      const whereSql = whereClauses.join(' AND ');

      // Total count
      const [countResult]: any = await pool.query(
        `SELECT COUNT(*) as total FROM transactions t WHERE ${whereSql}`,
        params
      );
      const total = countResult[0]?.total || 0;

      // Sorting
      const sortField = filters?.sortField === 'amount' ? 't.amount' : 't.date';
      const sortOrder = filters?.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      // Pagination
      const page = parseInt(filters?.page || '1', 10);
      const limit = parseInt(filters?.limit || '20', 10);
      const offset = (page - 1) * limit;

      const sql = `
        SELECT t.*, 
               c.name as category_name, c.color as category_color, c.icon as category_icon,
               a.name as account_name
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN accounts a ON t.account_id = a.id
        WHERE ${whereSql}
        ORDER BY ${sortField} ${sortOrder}, t.id DESC
        LIMIT ? OFFSET ?
      `;

      const [rows] = await pool.query<any[]>(sql, [...params, limit, offset]);

      return {
        transactions: rows,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      };
    }
    return localStore.getTransactions(userId, filters);
  },

  async getById(id: number, userId: number) {
    if (isMySqlActive) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        `SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon, a.name as account_name
         FROM transactions t
         LEFT JOIN categories c ON t.category_id = c.id
         LEFT JOIN accounts a ON t.account_id = a.id
         WHERE t.id = ? AND t.user_id = ? LIMIT 1`,
        [id, userId]
      );
      return rows[0] || null;
    }
    return localStore.getTransactionById(id, userId) || null;
  },

  async create(userId: number, data: any) {
    if (isMySqlActive) {
      const pool = getPool()!;
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        // Validate account ownership
        const [accRows]: any = await connection.query(
          'SELECT id, balance FROM accounts WHERE id = ? AND user_id = ?',
          [data.account_id, userId]
        );
        if (accRows.length === 0) throw new Error('Account not found or unauthorized');

        // Validate category ownership
        const [catRows]: any = await connection.query(
          'SELECT id FROM categories WHERE id = ? AND user_id = ?',
          [data.category_id, userId]
        );
        if (catRows.length === 0) throw new Error('Category not found or unauthorized');

        const amount = Number(data.amount);
        if (isNaN(amount) || amount <= 0) throw new Error('Amount must be positive');

        const [res]: any = await connection.query(
          `INSERT INTO transactions (user_id, account_id, category_id, type, title, amount, date, description, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            data.account_id,
            data.category_id,
            data.type,
            data.title.trim(),
            amount,
            data.date,
            data.description || null,
            data.notes || null,
          ]
        );

        // Update account balance
        const balanceDelta = data.type === 'income' ? amount : -amount;
        await connection.query(
          'UPDATE accounts SET balance = balance + ? WHERE id = ?',
          [balanceDelta, data.account_id]
        );

        await connection.commit();
        connection.release();
        return this.getById(res.insertId, userId);
      } catch (err) {
        await connection.rollback();
        connection.release();
        throw err;
      }
    }
    return localStore.createTransaction(userId, data);
  },

  async update(id: number, userId: number, data: any) {
    if (isMySqlActive) {
      const pool = getPool()!;
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        const [existing]: any = await connection.query(
          'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
          [id, userId]
        );
        if (existing.length === 0) throw new Error('Transaction not found');
        const oldTx = existing[0];

        // Revert old impact on account
        const oldDelta = oldTx.type === 'income' ? -oldTx.amount : oldTx.amount;
        await connection.query(
          'UPDATE accounts SET balance = balance + ? WHERE id = ?',
          [oldDelta, oldTx.account_id]
        );

        // Calculate new values
        const newAccountId = data.account_id ?? oldTx.account_id;
        const newCategoryId = data.category_id ?? oldTx.category_id;
        const newType = data.type ?? oldTx.type;
        const newAmount = data.amount !== undefined ? Number(data.amount) : Number(oldTx.amount);
        const newTitle = data.title !== undefined ? data.title.trim() : oldTx.title;
        const newDate = data.date ?? oldTx.date;
        const newDescription = data.description !== undefined ? data.description : oldTx.description;
        const newNotes = data.notes !== undefined ? data.notes : oldTx.notes;

        await connection.query(
          `UPDATE transactions 
           SET account_id = ?, category_id = ?, type = ?, title = ?, amount = ?, date = ?, description = ?, notes = ?
           WHERE id = ? AND user_id = ?`,
          [newAccountId, newCategoryId, newType, newTitle, newAmount, newDate, newDescription, newNotes, id, userId]
        );

        // Apply new impact to account
        const newDelta = newType === 'income' ? newAmount : -newAmount;
        await connection.query(
          'UPDATE accounts SET balance = balance + ? WHERE id = ?',
          [newDelta, newAccountId]
        );

        await connection.commit();
        connection.release();
        return this.getById(id, userId);
      } catch (err) {
        await connection.rollback();
        connection.release();
        throw err;
      }
    }
    return localStore.updateTransaction(id, userId, data);
  },

  async delete(id: number, userId: number) {
    if (isMySqlActive) {
      const pool = getPool()!;
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        const [existing]: any = await connection.query(
          'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
          [id, userId]
        );
        if (existing.length === 0) throw new Error('Transaction not found');
        const tx = existing[0];

        // Revert balance
        const balanceDelta = tx.type === 'income' ? -tx.amount : tx.amount;
        await connection.query(
          'UPDATE accounts SET balance = balance + ? WHERE id = ?',
          [balanceDelta, tx.account_id]
        );

        await connection.query('DELETE FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);

        await connection.commit();
        connection.release();
        return true;
      } catch (err) {
        await connection.rollback();
        connection.release();
        throw err;
      }
    }
    localStore.deleteTransaction(id, userId);
    return true;
  },
};

// --- Budgets Service ---
export const BudgetService = {
  async getAll(userId: number, month?: string) {
    const targetMonth = month || new Date().toISOString().slice(0, 7);
    if (isMySqlActive) {
      const pool = getPool()!;
      const sql = `
        SELECT b.*, 
               c.name as category_name, c.color as category_color, c.icon as category_icon,
               COALESCE((
                 SELECT SUM(t.amount) 
                 FROM transactions t 
                 WHERE t.category_id = b.category_id 
                   AND t.user_id = b.user_id 
                   AND t.type = 'expense' 
                   AND DATE_FORMAT(t.date, '%Y-%m') = b.month
               ), 0) as spent
        FROM budgets b
        JOIN categories c ON b.category_id = c.id
        WHERE b.user_id = ? AND b.month = ?
        ORDER BY b.limit_amount DESC
      `;
      const [rows]: any = await pool.query(sql, [userId, targetMonth]);
      return rows.map((b: any) => {
        const spent = Number(b.spent) || 0;
        const limit = Number(b.limit_amount) || 0;
        const remaining = Math.round((limit - spent) * 100) / 100;
        const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;
        return {
          ...b,
          spent,
          remaining,
          percentage,
        };
      });
    }
    return localStore.getBudgets(userId, targetMonth);
  },

  async getById(id: number, userId: number) {
    if (isMySqlActive) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        'SELECT * FROM budgets WHERE id = ? AND user_id = ? LIMIT 1',
        [id, userId]
      );
      return rows[0] || null;
    }
    return localStore.getBudgetById(id, userId) || null;
  },

  async create(userId: number, data: any) {
    if (isMySqlActive) {
      const pool = getPool()!;
      const [res]: any = await pool.query(
        'INSERT INTO budgets (user_id, category_id, month, limit_amount) VALUES (?, ?, ?, ?)',
        [userId, data.category_id, data.month, data.limit_amount]
      );
      return this.getById(res.insertId, userId);
    }
    return localStore.createBudget(userId, data);
  },

  async update(id: number, userId: number, data: any) {
    if (isMySqlActive) {
      const pool = getPool()!;
      const sets: string[] = [];
      const values: any[] = [];
      if (data.limit_amount !== undefined) { sets.push('limit_amount = ?'); values.push(data.limit_amount); }
      if (data.month !== undefined) { sets.push('month = ?'); values.push(data.month); }
      if (data.category_id !== undefined) { sets.push('category_id = ?'); values.push(data.category_id); }
      if (sets.length > 0) {
        values.push(id, userId);
        await pool.query(`UPDATE budgets SET ${sets.join(', ')} WHERE id = ? AND user_id = ?`, values);
      }
      return this.getById(id, userId);
    }
    return localStore.updateBudget(id, userId, data);
  },

  async delete(id: number, userId: number) {
    if (isMySqlActive) {
      const pool = getPool()!;
      await pool.query('DELETE FROM budgets WHERE id = ? AND user_id = ?', [id, userId]);
      return true;
    }
    localStore.deleteBudget(id, userId);
    return true;
  },
};

// --- Analytics Service ---
export const AnalyticsService = {
  async getOverview(userId: number, month?: string) {
    const targetMonth = month || new Date().toISOString().slice(0, 7);
    if (isMySqlActive) {
      const pool = getPool()!;
      // Total balance across user accounts
      const [accResult]: any = await pool.query(
        'SELECT COALESCE(SUM(balance), 0) as totalBalance, COUNT(*) as accountCount FROM accounts WHERE user_id = ?',
        [userId]
      );
      const totalBalance = Number(accResult[0]?.totalBalance) || 0;
      const accountCount = Number(accResult[0]?.accountCount) || 0;

      // Month totals
      const [txResult]: any = await pool.query(
        `SELECT 
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as totalIncome,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as totalExpenses,
          COUNT(*) as transactionCount
         FROM transactions 
         WHERE user_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?`,
        [userId, targetMonth]
      );

      const totalIncome = Number(txResult[0]?.totalIncome) || 0;
      const totalExpenses = Number(txResult[0]?.totalExpenses) || 0;
      const transactionCount = Number(txResult[0]?.transactionCount) || 0;
      const savings = Math.max(0, totalIncome - totalExpenses);
      const savingsRate = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;

      return {
        totalBalance: Math.round(totalBalance * 100) / 100,
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        savings: Math.round(savings * 100) / 100,
        savingsRate,
        transactionCount,
        accountCount,
        month: targetMonth,
      };
    }
    return localStore.getOverview(userId, targetMonth);
  },

  async getMonthly(userId: number, monthsCount = 6) {
    if (isMySqlActive) {
      const pool = getPool()!;
      const sql = `
        SELECT 
          DATE_FORMAT(date, '%Y-%m') as month,
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expenses
        FROM transactions
        WHERE user_id = ?
        GROUP BY DATE_FORMAT(date, '%Y-%m')
        ORDER BY month DESC
        LIMIT ?
      `;
      const [rows]: any = await pool.query(sql, [userId, monthsCount]);
      return rows.reverse().map((r: any) => ({
        month: r.month,
        label: new Date(`${r.month}-01`).toLocaleString('en-US', { month: 'short', year: '2-digit' }),
        income: Number(r.income),
        expenses: Number(r.expenses),
        net: Number(r.income) - Number(r.expenses),
      }));
    }
    return localStore.getMonthlyAnalytics(userId, monthsCount);
  },

  async getCategories(userId: number, month?: string, type: 'expense' | 'income' = 'expense') {
    const targetMonth = month || new Date().toISOString().slice(0, 7);
    if (isMySqlActive) {
      const pool = getPool()!;
      const sql = `
        SELECT 
          c.id as categoryId,
          c.name,
          c.color,
          c.icon,
          COALESCE(SUM(t.amount), 0) as amount
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = ? AND t.type = ? AND DATE_FORMAT(t.date, '%Y-%m') = ?
        GROUP BY c.id
        ORDER BY amount DESC
      `;
      const [rows]: any = await pool.query(sql, [userId, type, targetMonth]);
      const total = rows.reduce((sum: number, r: any) => sum + Number(r.amount), 0);
      const items = rows.map((r: any) => {
        const amt = Number(r.amount);
        const pct = total > 0 ? Math.round((amt / total) * 100) : 0;
        return {
          categoryId: r.categoryId,
          name: r.name,
          color: r.color,
          icon: r.icon,
          amount: Math.round(amt * 100) / 100,
          percentage: pct,
        };
      });
      return {
        month: targetMonth,
        total: Math.round(total * 100) / 100,
        items,
      };
    }
    return localStore.getCategoryAnalytics(userId, targetMonth, type);
  },
};
