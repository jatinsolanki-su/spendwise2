/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.js';
import { Budget, Category } from '../../types/index.js';
import { api } from '../../lib/api.js';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  budgetToEdit?: Budget | null;
  currentMonth: string;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  budgetToEdit,
  currentMonth,
}) => {
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [month, setMonth] = useState(currentMonth);
  const [limitAmount, setLimitAmount] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      api.getCategories('expense')
        .then((cats) => {
          setCategories(cats);
          if (budgetToEdit) {
            setCategoryId(budgetToEdit.category_id);
            setMonth(budgetToEdit.month);
            setLimitAmount(String(budgetToEdit.limit_amount));
          } else {
            setMonth(currentMonth);
            setLimitAmount('');
            if (cats.length > 0) setCategoryId(cats[0].id);
          }
        })
        .catch((err) => setError(err.message));
    }
  }, [isOpen, budgetToEdit, currentMonth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const limit = parseFloat(limitAmount);
    if (isNaN(limit) || limit <= 0) {
      setError('Please enter a valid monthly limit amount greater than zero.');
      return;
    }
    if (!categoryId) {
      setError('Please select a category for this budget.');
      return;
    }

    setLoading(true);
    try {
      if (budgetToEdit) {
        await api.updateBudget(budgetToEdit.id, {
          category_id: categoryId,
          month,
          limit_amount: limit,
        });
      } else {
        await api.createBudget({
          category_id: categoryId,
          month,
          limit_amount: limit,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save budget');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={budgetToEdit ? 'Edit Budget' : 'Create Monthly Budget'}
      description="Set a target spending threshold for a category"
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] mb-1">
            Expense Category
          </label>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FBFDFB] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded-lg text-[#172B24] dark:text-[#E6F0EB] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
          >
            <option value="" disabled>Select expense category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] mb-1">
            Target Month
          </label>
          <input
            type="month"
            required
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FBFDFB] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded-lg text-[#172B24] dark:text-[#E6F0EB] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] mb-1">
            Monthly Spending Limit
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            value={limitAmount}
            onChange={(e) => setLimitAmount(e.target.value)}
            placeholder="e.g. 500.00"
            className="w-full px-3 py-2 text-xs sm:text-sm font-mono tabular-nums bg-[#FBFDFB] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded-lg text-[#172B24] dark:text-[#E6F0EB] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2EBE5] dark:border-[#264438]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#465E55] dark:text-[#9EB5AC] hover:text-[#172B24] dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#087F5B] hover:bg-[#099268] active:bg-[#065F44] rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Saving...' : budgetToEdit ? 'Update Budget' : 'Set Budget'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
