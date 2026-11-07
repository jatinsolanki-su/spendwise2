/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.js';
import { Transaction, Account, Category } from '../../types/index.js';
import { api } from '../../lib/api.js';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transactionToEdit?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  transactionToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [accountId, setAccountId] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch accounts and categories
  useEffect(() => {
    if (isOpen) {
      setError(null);
      Promise.all([api.getAccounts(), api.getCategories()])
        .then(([accs, cats]) => {
          setAccounts(accs);
          setCategories(cats);

          if (transactionToEdit) {
            setTitle(transactionToEdit.title);
            setAmount(String(transactionToEdit.amount));
            setType(transactionToEdit.type);
            setAccountId(transactionToEdit.account_id);
            setCategoryId(transactionToEdit.category_id);
            setDate(transactionToEdit.date.slice(0, 10));
            setDescription(transactionToEdit.description || '');
            setNotes(transactionToEdit.notes || '');
          } else {
            setTitle('');
            setAmount('');
            setType('expense');
            setDate(new Date().toISOString().slice(0, 10));
            setDescription('');
            setNotes('');
            if (accs.length > 0) setAccountId(accs[0].id);
            const defaultCats = cats.filter((c: Category) => c.type === 'expense');
            if (defaultCats.length > 0) setCategoryId(defaultCats[0].id);
          }
        })
        .catch((err) => {
          setError(err.message || 'Failed to load accounts and categories');
        });
    }
  }, [isOpen, transactionToEdit]);

  // When type changes, adjust available category selection
  const handleTypeChange = (newType: 'expense' | 'income') => {
    setType(newType);
    const available = categories.filter((c) => c.type === newType);
    if (available.length > 0) {
      setCategoryId(available[0].id);
    } else {
      setCategoryId('');
    }
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    if (!accountId) {
      setError('Please select an account.');
      return;
    }
    if (!categoryId) {
      setError('Please select a category.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        amount: parsedAmount,
        type,
        account_id: accountId,
        category_id: categoryId,
        date,
        description: description.trim() || null,
        notes: notes.trim() || null,
      };

      if (transactionToEdit) {
        await api.updateTransaction(transactionToEdit.id, payload);
      } else {
        await api.createTransaction(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transactionToEdit ? 'Edit Transaction' : 'Record Transaction'}
      description="Add a financial entry with real account balance updating"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Type toggle segmented control */}
        <div>
          <label className="block text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] mb-1.5">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#F0F5F2] dark:bg-[#1C3229] rounded-lg">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                type === 'expense'
                  ? 'bg-white dark:bg-[#13221C] text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-[#465E55] dark:text-[#9EB5AC] hover:text-[#172B24]'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                type === 'income'
                  ? 'bg-white dark:bg-[#13221C] text-[#087F5B] dark:text-[#40C057] shadow-xs'
                  : 'text-[#465E55] dark:text-[#9EB5AC] hover:text-[#172B24]'
              }`}
            >
              Income
            </button>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] mb-1">
            Title / Payee
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Grocery Store, Client Invoice, Transit Pass"
            className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FBFDFB] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded-lg text-[#172B24] dark:text-[#E6F0EB] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
          />
        </div>

        {/* Amount & Date in 2 columns */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] mb-1">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 text-xs sm:text-sm font-mono tabular-nums bg-[#FBFDFB] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded-lg text-[#172B24] dark:text-[#E6F0EB] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] mb-1">
              Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FBFDFB] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded-lg text-[#172B24] dark:text-[#E6F0EB] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
            />
          </div>
        </div>

        {/* Account & Category in 2 columns */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] mb-1">
              Account
            </label>
            <select
              required
              value={accountId}
              onChange={(e) => setAccountId(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FBFDFB] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded-lg text-[#172B24] dark:text-[#E6F0EB] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
            >
              <option value="" disabled>Select account</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] mb-1">
              Category
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FBFDFB] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded-lg text-[#172B24] dark:text-[#E6F0EB] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
            >
              <option value="" disabled>Select category</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] mb-1">
            Description (Optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Additional details..."
            className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FBFDFB] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded-lg text-[#172B24] dark:text-[#E6F0EB] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
          />
        </div>

        {/* Action buttons */}
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
            {loading ? 'Saving...' : transactionToEdit ? 'Save Changes' : 'Record Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
