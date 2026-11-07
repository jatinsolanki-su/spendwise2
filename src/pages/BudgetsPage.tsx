/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  PiggyBank,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Trash2,
  TrendingDown,
} from 'lucide-react';
import { api, formatCurrency } from '../lib/api.js';
import { Budget } from '../types/index.js';
import { BudgetModal } from '../components/budgets/BudgetModal.js';
import { ConfirmationModal } from '../components/common/ConfirmationModal.js';
import { EmptyState } from '../components/common/EmptyState.js';
import { useAuth } from '../context/AuthContext.js';

export const BudgetsPage: React.FC = () => {
  const { preferences } = useAuth();
  const currency = preferences?.currency || 'USD';

  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchBudgets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getBudgets(selectedMonth);
      setBudgets(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth]);

  const handleDelete = async () => {
    if (!deletingBudget) return;
    setDeleteLoading(true);
    try {
      await api.deleteBudget(deletingBudget.id);
      setDeletingBudget(null);
      fetchBudgets();
    } catch (err: any) {
      alert(err.message || 'Failed to delete budget');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Aggregated budget metrics
  const totalBudgeted = budgets.reduce((sum, b) => sum + Number(b.limit_amount), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + Number(b.spent), 0);
  const totalRemaining = Math.max(0, totalBudgeted - totalSpent);
  const overallPercentage = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#13221C] p-4 sm:p-5 rounded-xl border border-[#E2EBE5] dark:border-[#264438] shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#172B24] dark:text-[#E6F0EB] tracking-tight">
            Monthly Category Budgets
          </h2>
          <p className="text-xs text-[#5B756B] dark:text-[#8AA69B] mt-0.5">
            Set and monitor monthly category limits tracked against verified transactions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#CFDCD4] dark:border-[#2C4A3E] bg-[#FBFDFB] dark:bg-[#182C24]">
            <Calendar className="w-3.5 h-3.5 text-[#5B756B] dark:text-[#8AA69B]" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#087F5B] hover:bg-[#099268] active:bg-[#065F44] rounded-lg transition-colors shadow-xs cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Set Category Budget</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Strip */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-[#13221C] border border-[#E2EBE5] dark:border-[#264438] shadow-xs">
            <span className="text-xs font-medium text-[#5B756B] dark:text-[#8AA69B]">Total Budgeted</span>
            <p className="text-xl font-bold font-mono tabular-nums text-[#172B24] dark:text-[#E6F0EB] mt-1">
              {formatCurrency(totalBudgeted, currency)}
            </p>
            <p className="text-[11px] text-[#5B756B] dark:text-[#8AA69B] mt-0.5">Across {budgets.length} categories</p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#13221C] border border-[#E2EBE5] dark:border-[#264438] shadow-xs">
            <span className="text-xs font-medium text-[#5B756B] dark:text-[#8AA69B]">Actual Spent</span>
            <p className="text-xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400 mt-1">
              {formatCurrency(totalSpent, currency)}
            </p>
            <p className="text-[11px] text-[#5B756B] dark:text-[#8AA69B] mt-0.5">{overallPercentage}% of total limit</p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#13221C] border border-[#E2EBE5] dark:border-[#264438] shadow-xs">
            <span className="text-xs font-medium text-[#5B756B] dark:text-[#8AA69B]">Remaining Cushion</span>
            <p className="text-xl font-bold font-mono tabular-nums text-[#087F5B] dark:text-[#40C057] mt-1">
              {formatCurrency(totalRemaining, currency)}
            </p>
            <p className="text-[11px] text-[#5B756B] dark:text-[#8AA69B] mt-0.5">Available to spend</p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#13221C] border border-[#E2EBE5] dark:border-[#264438] shadow-xs">
            <span className="text-xs font-medium text-[#5B756B] dark:text-[#8AA69B]">Budget Health</span>
            <div className="flex items-center gap-1.5 mt-1.5">
              {overallPercentage > 100 ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Over Budget</span>
                </>
              ) : overallPercentage > 80 ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Near Capacity</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#087F5B] dark:text-[#40C057]" />
                  <span className="text-xs font-bold text-[#087F5B] dark:text-[#40C057]">Healthy Pace</span>
                </>
              )}
            </div>
            <div className="h-1.5 w-full bg-[#E2EBE5] dark:bg-[#264438] rounded-full overflow-hidden mt-2">
              <div
                className={`h-full rounded-full ${
                  overallPercentage > 100
                    ? 'bg-rose-600'
                    : overallPercentage > 80
                    ? 'bg-amber-500'
                    : 'bg-[#087F5B]'
                }`}
                style={{ width: `${Math.min(100, overallPercentage)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Budgets Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#5B756B] dark:text-[#8AA69B]">
          Loading budget thresholds...
        </div>
      ) : budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => {
            const isExceeded = b.percentage > 100;
            const isWarning = b.percentage >= 80 && !isExceeded;

            return (
              <div
                key={b.id}
                className="p-5 rounded-xl bg-white dark:bg-[#13221C] border border-[#E2EBE5] dark:border-[#264438] shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: b.category_color || '#087F5B' }}
                      />
                      <div>
                        <h3 className="text-sm font-bold text-[#172B24] dark:text-[#E6F0EB]">
                          {b.category_name}
                        </h3>
                        <p className="text-[11px] text-[#5B756B] dark:text-[#8AA69B]">
                          Month: {b.month}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingBudget(b)}
                        title="Edit Budget"
                        className="p-1 text-[#5B756B] hover:text-[#087F5B] rounded hover:bg-[#F0F5F2] dark:hover:bg-[#1C3229] transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingBudget(b)}
                        title="Delete Budget"
                        className="p-1 text-[#5B756B] hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between text-xs">
                    <div>
                      <span className="text-[11px] text-[#5B756B] dark:text-[#8AA69B]">Spent: </span>
                      <span className="font-bold font-mono tabular-nums text-[#172B24] dark:text-[#E6F0EB]">
                        {formatCurrency(b.spent, currency)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#5B756B] dark:text-[#8AA69B]">Limit: </span>
                      <span className="font-bold font-mono tabular-nums text-[#172B24] dark:text-[#E6F0EB]">
                        {formatCurrency(b.limit_amount, currency)}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2.5 w-full bg-[#E2EBE5] dark:bg-[#264438] rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isExceeded
                          ? 'bg-rose-600'
                          : isWarning
                          ? 'bg-amber-500'
                          : 'bg-[#087F5B]'
                      }`}
                      style={{ width: `${Math.min(100, b.percentage)}%` }}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="font-mono tabular-nums text-[#5B756B] dark:text-[#8AA69B]">
                      {b.percentage}% utilized
                    </span>
                    <span
                      className={`font-medium ${
                        isExceeded
                          ? 'text-rose-600 dark:text-rose-400 font-semibold'
                          : isWarning
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-[#087F5B] dark:text-[#40C057]'
                      }`}
                    >
                      {b.remaining >= 0
                        ? `${formatCurrency(b.remaining, currency)} remaining`
                        : `${formatCurrency(Math.abs(b.remaining), currency)} over limit`}
                    </span>
                  </div>
                </div>

                {isExceeded && (
                  <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Spending has exceeded this category limit!</span>
                  </div>
                )}
                {isWarning && (
                  <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Approaching monthly limit (&gt;80% consumed).</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={PiggyBank}
          title={`No Budgets Configured for ${selectedMonth}`}
          description="Establish monthly spending caps for your expense categories to prevent lifestyle creep."
          actionLabel="Create Monthly Budget"
          onAction={() => setIsAddModalOpen(true)}
        />
      )}

      {/* Add / Edit Budget Modal */}
      <BudgetModal
        isOpen={isAddModalOpen || !!editingBudget}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingBudget(null);
        }}
        onSuccess={fetchBudgets}
        budgetToEdit={editingBudget}
        currentMonth={selectedMonth}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingBudget}
        onClose={() => setDeletingBudget(null)}
        onConfirm={handleDelete}
        title="Delete Budget"
        message={`Are you sure you want to remove the budget limit for "${deletingBudget?.category_name}" in ${deletingBudget?.month}? Existing transactions will not be deleted.`}
        confirmLabel="Remove Budget"
        isDestructive={true}
        loading={deleteLoading}
      />
    </div>
  );
};
