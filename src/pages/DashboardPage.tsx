/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  PiggyBank,
  TrendingUp,
  Plus,
  ArrowRight,
  AlertCircle,
  Receipt,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api, formatCurrency, formatDate } from '../lib/api.js';
import { AnalyticsOverview, MonthlyTrend, CategoryBreakdown, Transaction, Budget } from '../types/index.js';
import { EmptyState } from '../components/common/EmptyState.js';
import { useAuth } from '../context/AuthContext.js';

interface DashboardPageProps {
  onOpenAddTransaction: () => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenAddTransaction,
  onNavigateTab,
}) => {
  const { preferences } = useAuth();
  const currency = preferences?.currency || 'USD';

  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, trends, cats, txRes, bgs] = await Promise.all([
        api.getAnalyticsOverview(selectedMonth),
        api.getMonthlyAnalytics(6),
        api.getCategoryAnalytics(selectedMonth, 'expense'),
        api.getTransactions({ limit: 5, sortField: 'date', sortOrder: 'desc' }),
        api.getBudgets(selectedMonth),
      ]);

      setOverview(ov);
      setMonthlyTrends(trends);
      setCategoryBreakdown(cats);
      setRecentTransactions(txRes.transactions || []);
      setBudgets(bgs || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load financial records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#13221C] p-4 sm:p-5 rounded-xl border border-[#E2EBE5] dark:border-[#264438] shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#172B24] dark:text-[#E6F0EB] tracking-tight">
            Financial Health Overview
          </h2>
          <p className="text-xs text-[#5B756B] dark:text-[#8AA69B] mt-0.5">
            Aggregated metrics calculated strictly from verified database records
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#CFDCD4] dark:border-[#2C4A3E] bg-[#FBFDFB] dark:bg-[#182C24]">
            <Calendar className="w-3.5 h-3.5 text-[#5B756B] dark:text-[#8AA69B]" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] bg-transparent focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 flex items-center gap-3 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#13221C] border border-[#E2EBE5] dark:border-[#264438] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5B756B] dark:text-[#8AA69B]">Total Net Balance</span>
            <div className="w-7 h-7 rounded-lg bg-[#087F5B]/10 text-[#087F5B] dark:text-[#40C057] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-[#172B24] dark:text-[#E6F0EB] mt-2">
            {formatCurrency(overview?.totalBalance || 0, currency)}
          </p>
          <p className="text-[11px] text-[#5B756B] dark:text-[#8AA69B] mt-1">
            Across {overview?.accountCount || 0} active accounts
          </p>
        </div>

        {/* Monthly Income */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#13221C] border border-[#E2EBE5] dark:border-[#264438] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5B756B] dark:text-[#8AA69B]">Monthly Income</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-[#087F5B] dark:text-[#40C057] flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-[#087F5B] dark:text-[#40C057] mt-2">
            +{formatCurrency(overview?.totalIncome || 0, currency)}
          </p>
          <p className="text-[11px] text-[#5B756B] dark:text-[#8AA69B] mt-1">
            Target month: {selectedMonth}
          </p>
        </div>

        {/* Monthly Expenses */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#13221C] border border-[#E2EBE5] dark:border-[#264438] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5B756B] dark:text-[#8AA69B]">Monthly Expenses</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400 mt-2">
            -{formatCurrency(overview?.totalExpenses || 0, currency)}
          </p>
          <p className="text-[11px] text-[#5B756B] dark:text-[#8AA69B] mt-1">
            {overview?.transactionCount || 0} transactions logged
          </p>
        </div>

        {/* Savings & Rate */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#13221C] border border-[#E2EBE5] dark:border-[#264438] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5B756B] dark:text-[#8AA69B]">Net Savings</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-[#099268] dark:text-[#20C997] flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-[#172B24] dark:text-[#E6F0EB] mt-2">
            {formatCurrency(overview?.savings || 0, currency)}
          </p>
          <p className="text-[11px] font-medium text-[#087F5B] dark:text-[#40C057] mt-1">
            {overview?.savingsRate || 0}% Savings Rate
          </p>
        </div>
      </div>

      {/* Charts Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expense Bar Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-[#13221C] border border-[#E2EBE5] dark:border-[#264438] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#172B24] dark:text-[#E6F0EB]">
                Monthly Income vs Expenses
              </h3>
              <p className="text-xs text-[#5B756B] dark:text-[#8AA69B]">
                Comparison across the past 6 months
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-[#5B756B] dark:text-[#8AA69B]">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#087F5B]" />
                <span>Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                <span>Expenses</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            {monthlyTrends.length > 0 && monthlyTrends.some((t) => t.income > 0 || t.expenses > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="label" stroke="#8AA69B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#8AA69B" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#13221C',
                      borderColor: '#264438',
                      borderRadius: '8px',
                      color: '#E6F0EB',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [formatCurrency(value, currency), '']}
                  />
                  <Bar dataKey="income" name="Income" fill="#087F5B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#E03131" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={TrendingUp}
                title="No Cash Flow Records Yet"
                description="Once you record transactions with dates across months, cash flow trends will display here."
                actionLabel="Add First Transaction"
                onAction={onOpenAddTransaction}
              />
            )}
          </div>
        </div>

        {/* Category Breakdown Donut / List */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#13221C] border border-[#E2EBE5] dark:border-[#264438] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#172B24] dark:text-[#E6F0EB]">
                Expense Breakdown
              </h3>
              <span className="text-xs text-[#5B756B] dark:text-[#8AA69B] font-mono tabular-nums">
                {formatCurrency(categoryBreakdown?.total || 0, currency)}
              </span>
            </div>

            {categoryBreakdown && categoryBreakdown.items.length > 0 ? (
              <div className="space-y-4">
                <div className="h-40 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBreakdown.items}
                        dataKey="amount"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={2}
                      >
                        {categoryBreakdown.items.map((item, idx) => (
                          <Cell key={idx} fill={item.color || '#087F5B'} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#13221C',
                          borderColor: '#264438',
                          borderRadius: '8px',
                          color: '#E6F0EB',
                          fontSize: '12px',
                        }}
                        formatter={(val: any) => [formatCurrency(val, currency), 'Amount']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {categoryBreakdown.items.slice(0, 4).map((item) => (
                    <div key={item.categoryId} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-[#172B24] dark:text-[#E6F0EB] truncate font-medium">
                          {item.name}
                        </span>
                      </div>
                      <span className="font-mono tabular-nums text-[#5B756B] dark:text-[#8AA69B] shrink-0">
                        {formatCurrency(item.amount, currency)} ({item.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-xs text-[#5B756B] dark:text-[#8AA69B]">
                  No expense records in {selectedMonth}.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigateTab('analytics')}
            className="mt-4 w-full py-2 text-xs font-semibold text-[#087F5B] dark:text-[#40C057] hover:bg-[#F0F5F2] dark:hover:bg-[#1C3229] rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Detailed Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Budgets & Recent Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-[#13221C] border border-[#E2EBE5] dark:border-[#264438] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#172B24] dark:text-[#E6F0EB]">
                Recent Transactions
              </h3>
              <p className="text-xs text-[#5B756B] dark:text-[#8AA69B]">
                Latest ledger entries recorded in database
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs font-semibold text-[#087F5B] dark:text-[#40C057] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2EBE5] dark:border-[#264438] text-[#5B756B] dark:text-[#8AA69B]">
                    <th className="py-2.5 font-semibold">Title / Payee</th>
                    <th className="py-2.5 font-semibold">Category</th>
                    <th className="py-2.5 font-semibold">Account</th>
                    <th className="py-2.5 font-semibold">Date</th>
                    <th className="py-2.5 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2EBE5] dark:divide-[#264438]">
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#F9FBFA] dark:hover:bg-[#182C24]/60 transition-colors">
                      <td className="py-3 font-medium text-[#172B24] dark:text-[#E6F0EB] max-w-[180px] truncate">
                        {tx.title}
                      </td>
                      <td className="py-3 text-[#465E55] dark:text-[#9EB5AC]">
                        <span className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: tx.category_color || '#087F5B' }}
                          />
                          <span className="truncate">{tx.category_name}</span>
                        </span>
                      </td>
                      <td className="py-3 text-[#5B756B] dark:text-[#7A988D] truncate">
                        {tx.account_name}
                      </td>
                      <td className="py-3 text-[#5B756B] dark:text-[#7A988D] whitespace-nowrap font-mono tabular-nums">
                        {formatDate(tx.date)}
                      </td>
                      <td
                        className={`py-3 text-right font-mono tabular-nums font-semibold whitespace-nowrap ${
                          tx.type === 'income'
                            ? 'text-[#087F5B] dark:text-[#40C057]'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Receipt}
              title="No Recorded Transactions"
              description="Record your income payments and expenses to populate your account ledger."
              actionLabel="Add Transaction"
              onAction={onOpenAddTransaction}
            />
          )}
        </div>

        {/* Budgets Tracker (1 col) */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#13221C] border border-[#E2EBE5] dark:border-[#264438] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#172B24] dark:text-[#E6F0EB]">
                  Monthly Budgets
                </h3>
                <p className="text-xs text-[#5B756B] dark:text-[#8AA69B]">
                  Category limits for {selectedMonth}
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('budgets')}
                className="text-xs font-semibold text-[#087F5B] dark:text-[#40C057] hover:underline cursor-pointer"
              >
                Manage
              </button>
            </div>

            {budgets.length > 0 ? (
              <div className="space-y-4">
                {budgets.slice(0, 4).map((b) => (
                  <div key={b.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#172B24] dark:text-[#E6F0EB] truncate">
                        {b.category_name}
                      </span>
                      <span className="font-mono tabular-nums text-[#5B756B] dark:text-[#8AA69B]">
                        {formatCurrency(b.spent, currency)} / {formatCurrency(b.limit_amount, currency)}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[#E2EBE5] dark:bg-[#264438] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          b.percentage > 100
                            ? 'bg-rose-600'
                            : b.percentage > 80
                            ? 'bg-amber-500'
                            : 'bg-[#087F5B]'
                        }`}
                        style={{ width: `${Math.min(100, b.percentage)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-[#5B756B] dark:text-[#7A988D]">
                      <span>{b.percentage}% utilized</span>
                      <span>
                        {b.remaining >= 0
                          ? `${formatCurrency(b.remaining, currency)} remaining`
                          : `${formatCurrency(Math.abs(b.remaining), currency)} over limit`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center space-y-3">
                <p className="text-xs text-[#5B756B] dark:text-[#8AA69B]">
                  No spending limits set for this month.
                </p>
                <button
                  onClick={() => onNavigateTab('budgets')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#087F5B] dark:text-[#40C057] border border-[#087F5B]/30 dark:border-[#40C057]/30 rounded-lg hover:bg-[#087F5B]/5 cursor-pointer"
                >
                  Configure Budget Limits
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#E2EBE5] dark:border-[#264438] mt-4">
            <button
              onClick={onOpenAddTransaction}
              className="w-full py-2.5 px-3 rounded-lg bg-[#F0F5F2] dark:bg-[#1C3229] hover:bg-[#E2ECE6] dark:hover:bg-[#233F34] text-[#087F5B] dark:text-[#40C057] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record New Transaction</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
