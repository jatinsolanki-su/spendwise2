/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserPreferences {
  id?: number;
  user_id?: number;
  theme: 'light' | 'dark' | 'system';
  currency: string;
  date_format: string;
  notification_budget_alerts: boolean;
}

export type AccountType = 'cash' | 'savings' | 'current' | 'credit' | 'investment' | 'other';

export interface Account {
  id: number;
  user_id: number;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color: string;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type CategoryType = 'income' | 'expense';

export interface Category {
  id: number;
  user_id: number;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  account_id: number;
  category_id: number;
  type: 'income' | 'expense';
  title: string;
  amount: number;
  date: string;
  description?: string | null;
  notes?: string | null;
  category_name?: string;
  category_color?: string;
  category_icon?: string;
  account_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Budget {
  id: number;
  user_id: number;
  category_id: number;
  month: string;
  limit_amount: number;
  spent: number;
  remaining: number;
  percentage: number;
  category_name?: string;
  category_color?: string;
  category_icon?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AnalyticsOverview {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  savingsRate: number;
  transactionCount: number;
  accountCount: number;
  month: string;
}

export interface MonthlyTrend {
  month: string;
  label: string;
  income: number;
  expenses: number;
  net: number;
}

export interface CategoryBreakdown {
  month: string;
  total: number;
  items: Array<{
    categoryId: number;
    name: string;
    color: string;
    icon: string;
    amount: number;
    percentage: number;
  }>;
}
