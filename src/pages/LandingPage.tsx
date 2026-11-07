/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Wallet2,
  TrendingUp,
  PieChart,
  ShieldCheck,
  PiggyBank,
  ArrowRight,
  Lock,
  Layers,
  CheckCircle2,
  ChevronRight,
  Database,
  BarChart3,
} from 'lucide-react';
import { Navbar } from '../components/common/Navbar.js';

interface LandingPageProps {
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateLogin,
  onNavigateRegister,
}) => {
  return (
    <div className="min-h-screen bg-[#F5F7F5] dark:bg-[#0D1714] text-[#172B24] dark:text-[#E6F0EB] transition-colors">
      <Navbar onNavigateLogin={onNavigateLogin} onNavigateRegister={onNavigateRegister} />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">


            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#172B24] dark:text-[#E6F0EB] tracking-tight leading-[1.15]" style={{ textWrap: 'balance' }}>
              Master your personal cash flow with complete mathematical certainty.
            </h1>

            <p className="text-base sm:text-lg text-[#465E55] dark:text-[#9EB5AC] max-w-2xl mx-auto leading-relaxed">
              Spendwise 2.0 provides native relational expense tracking, real-time monthly budget allocations, multi-account ledger balances, and automated cash flow analytics.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={onNavigateRegister}
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-white bg-[#087F5B] hover:bg-[#099268] active:bg-[#065F44] rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Open Your Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onNavigateLogin}
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-[#172B24] dark:text-[#E6F0EB] hover:bg-white dark:hover:bg-[#13221C] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded-lg transition-colors cursor-pointer"
              >
                Sign In to Dashboard
              </button>
            </div>
          </div>

          {/* Hero Interface Preview Card */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-[#D8E4DC] dark:border-[#264438] bg-white dark:bg-[#13221C] shadow-lg overflow-hidden">
            <div className="h-10 px-4 bg-[#EDF3EE] dark:bg-[#192B23] border-b border-[#D8E4DC] dark:border-[#264438] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
              </div>
              <span className="text-xs font-mono text-[#5B756B] dark:text-[#7A988D]">
                https://spendwise.app/dashboard
              </span>
              <div className="w-12" />
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Sample stat strip */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#F5F7F5] dark:bg-[#182C24] border border-[#E2EBE5] dark:border-[#264438]">
                  <p className="text-xs font-medium text-[#5B756B] dark:text-[#8AA69B]">Total Net Balance</p>
                  <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-[#172B24] dark:text-[#E6F0EB] mt-1">$24,850.40</p>
                  <p className="text-[11px] text-[#087F5B] dark:text-[#40C057] mt-1 font-medium">+12.4% vs last month</p>
                </div>
                <div className="p-4 rounded-xl bg-[#F5F7F5] dark:bg-[#182C24] border border-[#E2EBE5] dark:border-[#264438]">
                  <p className="text-xs font-medium text-[#5B756B] dark:text-[#8AA69B]">Monthly Income</p>
                  <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-[#087F5B] dark:text-[#40C057] mt-1">$7,420.00</p>
                  <p className="text-[11px] text-[#5B756B] dark:text-[#8AA69B] mt-1">Salary & Dividends</p>
                </div>
                <div className="p-4 rounded-xl bg-[#F5F7F5] dark:bg-[#182C24] border border-[#E2EBE5] dark:border-[#264438]">
                  <p className="text-xs font-medium text-[#5B756B] dark:text-[#8AA69B]">Monthly Expenses</p>
                  <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400 mt-1">$3,180.25</p>
                  <p className="text-[11px] text-[#5B756B] dark:text-[#8AA69B] mt-1">42 transactions logged</p>
                </div>
                <div className="p-4 rounded-xl bg-[#F5F7F5] dark:bg-[#182C24] border border-[#E2EBE5] dark:border-[#264438]">
                  <p className="text-xs font-medium text-[#5B756B] dark:text-[#8AA69B]">Net Savings Rate</p>
                  <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-[#172B24] dark:text-[#E6F0EB] mt-1">57.1%</p>
                  <p className="text-[11px] text-[#087F5B] dark:text-[#40C057] mt-1 font-medium">On track for annual target</p>
                </div>
              </div>

              {/* Chart & budget preview row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-5 rounded-xl border border-[#E2EBE5] dark:border-[#264438] bg-white dark:bg-[#162920]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-[#172B24] dark:text-[#E6F0EB]">Cash Flow Trend</h3>
                    <span className="text-xs text-[#5B756B] dark:text-[#8AA69B]">Past 6 Months</span>
                  </div>
                  <div className="h-44 flex items-end justify-between gap-4 pt-6 px-2">
                    {[
                      { m: 'Jun', inc: 75, exp: 45 },
                      { m: 'Jul', inc: 80, exp: 50 },
                      { m: 'Aug', inc: 70, exp: 60 },
                      { m: 'Sep', inc: 85, exp: 40 },
                      { m: 'Oct', inc: 90, exp: 48 },
                      { m: 'Nov', inc: 95, exp: 42 },
                    ].map((bar, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        <div className="w-full max-w-[28px] flex items-end gap-1 h-32">
                          <div
                            className="flex-1 bg-[#087F5B] rounded-t-sm"
                            style={{ height: `${bar.inc}%` }}
                          />
                          <div
                            className="flex-1 bg-rose-500/70 rounded-t-sm"
                            style={{ height: `${bar.exp}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-[#5B756B] dark:text-[#8AA69B] font-medium">{bar.m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-[#E2EBE5] dark:border-[#264438] bg-white dark:bg-[#162920] space-y-4">
                  <h3 className="text-sm font-bold text-[#172B24] dark:text-[#E6F0EB]">Category Budgets</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-[#172B24] dark:text-[#E6F0EB]">Groceries & Dining</span>
                        <span className="font-mono tabular-nums text-[#5B756B] dark:text-[#8AA69B]">$420 / $600</span>
                      </div>
                      <div className="h-2 w-full bg-[#E2EBE5] dark:bg-[#264438] rounded-full overflow-hidden">
                        <div className="h-full bg-[#087F5B] rounded-full" style={{ width: '70%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-[#172B24] dark:text-[#E6F0EB]">Housing & Utilities</span>
                        <span className="font-mono tabular-nums text-[#5B756B] dark:text-[#8AA69B]">$1,250 / $1,300</span>
                      </div>
                      <div className="h-2 w-full bg-[#E2EBE5] dark:bg-[#264438] rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '96%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-[#172B24] dark:text-[#E6F0EB]">Transportation</span>
                        <span className="font-mono tabular-nums text-[#5B756B] dark:text-[#8AA69B]">$180 / $300</span>
                      </div>
                      <div className="h-2 w-full bg-[#E2EBE5] dark:bg-[#264438] rounded-full overflow-hidden">
                        <div className="h-full bg-[#087F5B] rounded-full" style={{ width: '60%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section id="features" className="py-20 bg-white dark:bg-[#111F19] border-y border-[#E2EBE5] dark:border-[#264438] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="text-xs font-semibold tracking-wider text-[#087F5B] dark:text-[#40C057] uppercase mb-2">
              Engineering Architecture
            </h2>
            <p className="text-3xl font-extrabold text-[#172B24] dark:text-[#E6F0EB] tracking-tight">
              Built for people who want strict financial clarity without compromise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-[#F5F7F5] dark:bg-[#162920] border border-[#E2EBE5] dark:border-[#264438]">
              <div className="w-10 h-10 rounded-lg bg-[#087F5B]/15 text-[#087F5B] dark:text-[#40C057] flex items-center justify-center mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#172B24] dark:text-[#E6F0EB] mb-2">
                Relational MySQL Ledger
              </h3>
              <p className="text-xs sm:text-sm text-[#465E55] dark:text-[#9EB5AC] leading-relaxed">
                Every calculation is derived with native SQL aggregates. Foreign keys, indexed transactions, and isolated user scopes protect against double counting.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#F5F7F5] dark:bg-[#162920] border border-[#E2EBE5] dark:border-[#264438]">
              <div className="w-10 h-10 rounded-lg bg-[#087F5B]/15 text-[#087F5B] dark:text-[#40C057] flex items-center justify-center mb-4">
                <PiggyBank className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#172B24] dark:text-[#E6F0EB] mb-2">
                Monthly Budget Limits
              </h3>
              <p className="text-xs sm:text-sm text-[#465E55] dark:text-[#9EB5AC] leading-relaxed">
                Assign monthly targets to specific spending categories. Real-time progress bars notify you when you approach 80% or exceed 100% of your threshold.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#F5F7F5] dark:bg-[#162920] border border-[#E2EBE5] dark:border-[#264438]">
              <div className="w-10 h-10 rounded-lg bg-[#087F5B]/15 text-[#087F5B] dark:text-[#40C057] flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#172B24] dark:text-[#E6F0EB] mb-2">
                Cash Flow Analytics
              </h3>
              <p className="text-xs sm:text-sm text-[#465E55] dark:text-[#9EB5AC] leading-relaxed">
                Break down discretionary expenses, monitor daily spending velocity, and understand your true savings trajectory across quarters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Privacy Section */}
      <section id="security" className="py-20 bg-[#F5F7F5] dark:bg-[#0D1714] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white dark:bg-[#13221C] border border-[#E2EBE5] dark:border-[#264438] p-8 sm:p-12">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#087F5B] dark:text-[#40C057] uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Security & Data Sovereignty</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172B24] dark:text-[#E6F0EB] tracking-tight mb-4">
                Your financial records belong exclusively to you.
              </h2>
              <p className="text-sm sm:text-base text-[#465E55] dark:text-[#9EB5AC] leading-relaxed mb-8">
                Spendwise is built with zero third-party telemetry, password hashing via salted bcrypt rounds, secure HTTP-only cookies, and complete database-level row isolation.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-2.5 text-[#172B24] dark:text-[#E6F0EB]">
                  <CheckCircle2 className="w-4 h-4 text-[#087F5B] dark:text-[#40C057] shrink-0" />
                  <span>Bcrypt password hashing with unique salts</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#172B24] dark:text-[#E6F0EB]">
                  <CheckCircle2 className="w-4 h-4 text-[#087F5B] dark:text-[#40C057] shrink-0" />
                  <span>No external advertising or data sharing</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#172B24] dark:text-[#E6F0EB]">
                  <CheckCircle2 className="w-4 h-4 text-[#087F5B] dark:text-[#40C057] shrink-0" />
                  <span>Parameterized SQL queries (SQLi protected)</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#172B24] dark:text-[#E6F0EB]">
                  <CheckCircle2 className="w-4 h-4 text-[#087F5B] dark:text-[#40C057] shrink-0" />
                  <span>Self-hostable with native MySQL scripts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E2EBE5] dark:border-[#264438] bg-white dark:bg-[#111F19] py-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#087F5B] text-white flex items-center justify-center">
              <Wallet2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-bold text-[#172B24] dark:text-[#E6F0EB]">Spendwise 2.0</span>
            <span className="text-xs text-[#5B756B] dark:text-[#7A988D]">· Personal Finance Management</span>
          </div>
          <p className="text-xs text-[#5B756B] dark:text-[#7A988D]">
            © 2026 Spendwise Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
