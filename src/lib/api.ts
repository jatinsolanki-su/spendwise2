/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const API_BASE = '/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorMsg = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (data && data.error) {
        errorMsg = data.error;
      }
    } catch {
      // ignore
    }
    throw new ApiError(response.status, errorMsg);
  }

  // Check if response is 204 or empty
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request<any>('/auth/logout', { method: 'POST' }),
  getMe: () => request<any>('/auth/me'),
  getAuthFeatures: () => request<{ emailPasswordResetAvailable: boolean }>('/auth/features'),
  forgotPassword: (email: string) => request<any>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (data: any) => request<any>('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),

  // Profile & Preferences
  getProfile: () => request<any>('/profile'),
  updateProfile: (data: any) => request<any>('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  updatePassword: (data: any) => request<any>('/profile/password', { method: 'PUT', body: JSON.stringify(data) }),
  getPreferences: () => request<any>('/preferences'),
  updatePreferences: (data: any) => request<any>('/preferences', { method: 'PUT', body: JSON.stringify(data) }),

  // Accounts
  getAccounts: () => request<any[]>('/accounts'),
  createAccount: (data: any) => request<any>('/accounts', { method: 'POST', body: JSON.stringify(data) }),
  updateAccount: (id: number, data: any) => request<any>(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAccount: (id: number) => request<any>(`/accounts/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: (type?: string) => request<any[]>(`/categories${type ? `?type=${type}` : ''}`),
  createCategory: (data: any) => request<any>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: number, data: any) => request<any>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id: number) => request<any>(`/categories/${id}`, { method: 'DELETE' }),

  // Transactions
  getTransactions: (params?: Record<string, any>) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return request<any>(`/transactions${qs}`);
  },
  getTransaction: (id: number) => request<any>(`/transactions/${id}`),
  createTransaction: (data: any) => request<any>('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  updateTransaction: (id: number, data: any) => request<any>(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTransaction: (id: number) => request<any>(`/transactions/${id}`, { method: 'DELETE' }),

  // Budgets
  getBudgets: (month?: string) => request<any[]>(`/budgets${month ? `?month=${month}` : ''}`),
  createBudget: (data: any) => request<any>('/budgets', { method: 'POST', body: JSON.stringify(data) }),
  updateBudget: (id: number, data: any) => request<any>(`/budgets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBudget: (id: number) => request<any>(`/budgets/${id}`, { method: 'DELETE' }),

  // Analytics
  getAnalyticsOverview: (month?: string) => request<any>(`/analytics/overview${month ? `?month=${month}` : ''}`),
  getMonthlyAnalytics: (monthsCount = 6) => request<any[]>(`/analytics/monthly?monthsCount=${monthsCount}`),
  getCategoryAnalytics: (month?: string, type = 'expense') => request<any>(`/analytics/categories?type=${type}${month ? `&month=${month}` : ''}`),

  // System Health
  getHealth: () => request<any>('/health'),
};

// Currency helper
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
  AUD: 'AU$',
  INR: '₹',
  JPY: '¥',
};

export function formatCurrency(amount: number | string, currency = 'USD'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '$0.00';
  const symbol = CURRENCY_SYMBOLS[currency] || (currency + ' ');
  return `${symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateString: string, format = 'YYYY-MM-DD'): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  if (format === 'DD/MM/YYYY') return `${day}/${month}/${year}`;
  if (format === 'MM/DD/YYYY') return `${month}/${day}/${year}`;
  return `${year}-${month}-${day}`;
}
