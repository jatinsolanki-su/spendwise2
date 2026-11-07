/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  PieChart as PieIcon,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  BarChart2,
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
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { api, formatCurrency } from '../lib/api.js';
import { AnalyticsOverview, MonthlyTrend, CategoryBreakdown } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { EmptyState } from '../components/common/EmptyState.js';

export const AnalyticsPage: React.FC = () => {
  const { preferences } = useAuth();
  const currency = preferences?.currency || 'USD';

  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [timeframeMonths, setTimeframeMonths] = useState<number>(6);

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown | null>(null);
  const [incomeBreakdown, setIncomeBreakdown] = useState<CategoryBreakdown | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [ov, tr, expCats, incCats] = await Promise.all([
        api.getAnalyticsOverview(selectedMonth),
        api.getMonthlyAnalytics(timeframeMonths),
        api.getCategoryAnalytics(selectedMonth, 'expense'),
        api.getCategoryAnalytics(selectedMonth, 'income'),
      ]);
      setOverview(ov);
      setTrends(tr);
      setCategoryBreakdown(expCats);
      setIncomeBreakdown(incCats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedMonth, timeframeMonths]);

  // Calculate Average Daily Spending for current selected month
  const getDaysInMonth = (yearMonth: string) => {
    const [y, m] = yearMonth.split('-').map(Number);
    return new Date(y, m, 0).getDate();
  };
  const daysInMonth = getDaysInMonth(selectedMonth);
  const averageDailySpend = overview?.totalExpenses ? overview.totalExpenses / daysInMonth : 0;

  return (
    <div className="space-y-6">
      {/* Top Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#13221C] p-4 sm:p-5 rounded-xl border border-[#E2EBE5] dark:border-[#264438] shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#172B24] dark:text-[#E6F0EB] tracking-tight">
            Financial Analytics & Intelligence
          </h2>
          <p className="text-xs text-[#5B756B] dark:text-[#8AA69B] mt-0.5">
            Real aggregated SQL metrics covering cash flow, savings rate, and category velocity
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe selector */}
          <div className="flex items-center gap-1 p-1 bg-[#F0F5F2] dark:bg-[#1C3229] rounded-lg">
            <button
              onClick={() => setTimeframeMonths(6)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                timeframeMonths === 6
                  ? 'bg-white dark:bg-[#13221C] text-[#172B24] dark:text-[#E6F0EB] shadow-xs'
                  : 'text-[#5B756B] dark:text-[#8AA69B]'
              }`}
            >
              6 Months
            </button>
            <button
              onClick={() => setTimeframeMonths(12)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                timeframeMonths === 12
                  ? 'bg-white dark:bg-[#13221C] text-[#172B24] dark:text-[#E6F0EB] shadow-xs'
                  : 'text-[#5B756B] dark:text-[#8AA69B]'
              }`}
            >
              12 Months
            </button>
          </div>

          {/* Month input */}
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

      {/* Analytics KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#13221C] border border-[#E2EBE5] dark:border-[#264438] shadow-xs">
          <span className="text-xs font-medium text-[#5B756B] dark:text-[#8AA69B]">Average Daily Spending</span>
          <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-[#172B24] dark:text-[#E6F0EB] mt-2">
            {formatCurrency(averageDailySpend, currency)}
          </p>
          <p className="text-[11px] text-[#5B756B] dark:text-[#8AA69B] mt-1">
            Based on {daysInMonth} days in {selectedMonth}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#13221C] border border-[#E2EBE5] dark:border-[#264438] shadow-xs">
          <span className="text-xs font-medium text-[#5B756B] dark:text-[#8AA69B]">Net Savings Rate</span>
          <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-[#087F5B] dark:text-[#40C057] mt-2">
            {overview?.savingsRate || 0}%
          </p>
          <p className="text-[11px] text-[#5B756B] dark:text-[#8AA69B] mt-1">
            {formatCurrency(overview?.savings || 0, currency)} retained
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#13221C] border border-[#E2EBE5] dark:border-[#264438] shadow-xs">
          <span className="text-xs font-medium text-[#5B756B] dark:text-[#8AA69B]">Month Expenses</span>
          <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400 mt-2">
            {formatCurrency(overview?.totalExpenses || 0, currency)}
          </p>
          <p className="text-[11px] text-[#5B756B] dark:text-[#8AA69B] mt-1">
            Across {categoryBreakdown?.items.length || 0} active categories
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#13221C] border border-[#E2EBE5] dark:border-[#264438] shadow-xs">
          <span className="text-xs font-medium text-[#5B756B] dark:text-[#8AA69B]">Month Income</span>
          <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-[#087F5B] dark:text-[#40C057] mt-2">
            {formatCurrency(overview?.totalIncome || 0, currency)}
          </p>
          <p className="text-[11px] text-[#5B756B] dark:text-[#8AA69B] mt-1">
            Recorded receipts
          </p>
        </div>
      </div>

      {/* Main Net Savings & Cash Flow Timeline Chart */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#13221C] border border-[#E2EBE5] dark:border-[#264438] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#172B24] dark:text-[#E6F0EB]">
              Net Savings & Cash Flow Trajectory
            </h3>
            <p className="text-xs text-[#5B756B] dark:text-[#8AA69B]">
              Income, expense, and net savings retention over time
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
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-0.5 bg-sky-500" />
              <span>Net Savings</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          {trends.length > 0 && trends.some((t) => t.income > 0 || t.expenses > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#264438" opacity={0.15} />
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
                  formatter={(val: any) => [formatCurrency(val, currency), '']}
                />
                <Line type="monotone" dataKey="income" stroke="#087F5B" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="expenses" stroke="#E03131" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="net" stroke="#1971C2" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-[#5B756B] dark:text-[#8AA69B]">
              No trend data available for this timeframe. Add transactions to begin visualizing cash flow.
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Category Breakdown */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#13221C] border border-[#E2EBE5] dark:border-[#264438] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#172B24] dark:text-[#E6F0EB]">
              Expenses by Category
            </h3>
            <span className="text-xs font-mono tabular-nums text-[#5B756B] dark:text-[#8AA69B]">
              Total: {formatCurrency(categoryBreakdown?.total || 0, currency)}
            </span>
          </div>

          {categoryBreakdown && categoryBreakdown.items.length > 0 ? (
            <div className="space-y-3">
              {categoryBreakdown.items.map((cat) => (
                <div key={cat.categoryId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-semibold text-[#172B24] dark:text-[#E6F0EB]">
                        {cat.name}
                      </span>
                    </div>
                    <span className="font-mono tabular-nums text-[#172B24] dark:text-[#E6F0EB]">
                      {formatCurrency(cat.amount, currency)}{' '}
                      <span className="text-[#5B756B] dark:text-[#8AA69B]">({cat.percentage}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#E2EBE5] dark:bg-[#264438] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color || '#087F5B',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#5B756B] dark:text-[#8AA69B]">
              No expense categories recorded for {selectedMonth}.
            </div>
          )}
        </div>

        {/* Income Sources Breakdown */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#13221C] border border-[#E2EBE5] dark:border-[#264438] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#172B24] dark:text-[#E6F0EB]">
              Income by Stream
            </h3>
            <span className="text-xs font-mono tabular-nums text-[#087F5B] dark:text-[#40C057]">
              Total: {formatCurrency(incomeBreakdown?.total || 0, currency)}
            </span>
          </div>

          {incomeBreakdown && incomeBreakdown.items.length > 0 ? (
            <div className="space-y-3">
              {incomeBreakdown.items.map((cat) => (
                <div key={cat.categoryId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-semibold text-[#172B24] dark:text-[#E6F0EB]">
                        {cat.name}
                      </span>
                    </div>
                    <span className="font-mono tabular-nums text-[#172B24] dark:text-[#E6F0EB]">
                      {formatCurrency(cat.amount, currency)}{' '}
                      <span className="text-[#5B756B] dark:text-[#8AA69B]">({cat.percentage}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#E2EBE5] dark:bg-[#264438] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#087F5B]"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#5B756B] dark:text-[#8AA69B]">
              No income streams recorded for {selectedMonth}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
