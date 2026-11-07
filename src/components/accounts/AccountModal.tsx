/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.js';
import { Account, AccountType } from '../../types/index.js';
import { api } from '../../lib/api.js';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accountToEdit?: Account | null;
}

const COLOR_SWATCHES = [
  '#087F5B', // Spendwise Green
  '#099268', // Teal Green
  '#2B8A3E', // Forest
  '#2F9E44', // Lime Green
  '#1971C2', // Blue
  '#3B5BDB', // Indigo
  '#7048E8', // Violet
  '#D9480F', // Warm Rust
  '#E67700', // Amber
  '#495057', // Slate
];

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  accountToEdit,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('current');
  const [balance, setBalance] = useState('0.00');
  const [currency, setCurrency] = useState('USD');
  const [color, setColor] = useState('#087F5B');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (accountToEdit) {
        setName(accountToEdit.name);
        setType(accountToEdit.type);
        setBalance(String(accountToEdit.balance));
        setCurrency(accountToEdit.currency || 'USD');
        setColor(accountToEdit.color || '#087F5B');
        setNotes(accountToEdit.notes || '');
      } else {
        setName('');
        setType('current');
        setBalance('0.00');
        setCurrency('USD');
        setColor('#087F5B');
        setNotes('');
      }
    }
  }, [isOpen, accountToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide an account name.');
      return;
    }

    const parsedBalance = parseFloat(balance);
    if (isNaN(parsedBalance)) {
      setError('Please enter a valid numeric balance.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        type,
        balance: parsedBalance,
        currency,
        color,
        notes: notes.trim() || null,
      };

      if (accountToEdit) {
        await api.updateAccount(accountToEdit.id, payload);
      } else {
        await api.createAccount(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={accountToEdit ? 'Edit Account' : 'Add Financial Account'}
      description="Track cash, checking, savings, or investment accounts"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] mb-1">
            Account Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Chase Total Checking, Emergency Fund, Cash Wallet"
            className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FBFDFB] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded-lg text-[#172B24] dark:text-[#E6F0EB] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] mb-1">
              Account Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AccountType)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FBFDFB] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded-lg text-[#172B24] dark:text-[#E6F0EB] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
            >
              <option value="current">Current / Checking</option>
              <option value="savings">Savings Account</option>
              <option value="cash">Physical Cash</option>
              <option value="credit">Credit Card / Line</option>
              <option value="investment">Investment / Brokerage</option>
              <option value="other">Other Account</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] mb-1">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FBFDFB] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded-lg text-[#172B24] dark:text-[#E6F0EB] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD ($)</option>
              <option value="AUD">AUD ($)</option>
              <option value="INR">INR (₹)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] mb-1">
            {accountToEdit ? 'Adjust Balance' : 'Initial Starting Balance'}
          </label>
          <input
            type="number"
            step="0.01"
            required
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm font-mono tabular-nums bg-[#FBFDFB] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded-lg text-[#172B24] dark:text-[#E6F0EB] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] mb-2">
            Badge Accent Color
          </label>
          <div className="flex flex-wrap gap-2">
            {COLOR_SWATCHES.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => setColor(hex)}
                className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                  color === hex ? 'ring-2 ring-offset-2 ring-[#087F5B] scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: hex }}
                aria-label={`Select color ${hex}`}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] mb-1">
            Notes (Optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Account numbers, institutional notes, or limits..."
            className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FBFDFB] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded-lg text-[#172B24] dark:text-[#E6F0EB] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
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
            {loading ? 'Saving...' : accountToEdit ? 'Save Changes' : 'Create Account'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
