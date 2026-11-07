/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.js';
import { Category, CategoryType } from '../../types/index.js';
import { api } from '../../lib/api.js';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoryToEdit?: Category | null;
  defaultType?: CategoryType;
}

const CATEGORY_COLORS = [
  '#087F5B', // Forest
  '#099268', // Teal
  '#2B8A3E', // Leaf
  '#1971C2', // Blue
  '#3B5BDB', // Indigo
  '#7048E8', // Violet
  '#D9480F', // Coral/Rust
  '#E67700', // Amber
  '#C92A2A', // Crimson
  '#495057', // Slate
];

const ICONS_LIST = [
  'tag',
  'utensils',
  'car',
  'home',
  'film',
  'shopping-bag',
  'heart-pulse',
  'briefcase',
  'trending-up',
  'laptop',
  'coffee',
  'plane',
  'book',
  'gift',
  'smartphone',
  'shield',
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  categoryToEdit,
  defaultType = 'expense',
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>(defaultType);
  const [color, setColor] = useState('#087F5B');
  const [icon, setIcon] = useState('tag');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (categoryToEdit) {
        setName(categoryToEdit.name);
        setType(categoryToEdit.type);
        setColor(categoryToEdit.color || '#087F5B');
        setIcon(categoryToEdit.icon || 'tag');
      } else {
        setName('');
        setType(defaultType);
        setColor('#087F5B');
        setIcon('tag');
      }
    }
  }, [isOpen, categoryToEdit, defaultType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide a category name.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        type,
        color,
        icon,
      };

      if (categoryToEdit) {
        await api.updateCategory(categoryToEdit.id, payload);
      } else {
        await api.createCategory(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={categoryToEdit ? 'Edit Category' : 'Create Category'}
      description="Organize your expenses and income streams"
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Type toggle */}
        <div>
          <label className="block text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] mb-1.5">
            Category Type
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#F0F5F2] dark:bg-[#1C3229] rounded-lg">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                type === 'expense'
                  ? 'bg-white dark:bg-[#13221C] text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-[#465E55] dark:text-[#9EB5AC]'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                type === 'income'
                  ? 'bg-white dark:bg-[#13221C] text-[#087F5B] dark:text-[#40C057] shadow-xs'
                  : 'text-[#465E55] dark:text-[#9EB5AC]'
              }`}
            >
              Income
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] mb-1">
            Category Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Groceries, Gym, SaaS Subscriptions"
            className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FBFDFB] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded-lg text-[#172B24] dark:text-[#E6F0EB] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] mb-2">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_COLORS.map((hex) => (
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
            Icon Identifier
          </label>
          <select
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FBFDFB] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded-lg text-[#172B24] dark:text-[#E6F0EB] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
          >
            {ICONS_LIST.map((ic) => (
              <option key={ic} value={ic}>
                {ic.charAt(0).toUpperCase() + ic.slice(1).replace('-', ' ')}
              </option>
            ))}
          </select>
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
            {loading ? 'Saving...' : categoryToEdit ? 'Save Changes' : 'Create Category'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
