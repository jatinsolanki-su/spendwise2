/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Tags, Plus, Edit2, Trash2, Check, AlertCircle } from 'lucide-react';
import { api } from '../lib/api.js';
import { Category, CategoryType } from '../types/index.js';
import { CategoryModal } from '../components/categories/CategoryModal.js';
import { ConfirmationModal } from '../components/common/ConfirmationModal.js';
import { EmptyState } from '../components/common/EmptyState.js';

export const CategoriesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CategoryType>('expense');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCategories();
      setCategories(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filtered = categories.filter((c) => c.type === activeTab);

  const handleDelete = async () => {
    if (!deletingCategory) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await api.deleteCategory(deletingCategory.id);
      setDeletingCategory(null);
      fetchCategories();
    } catch (err: any) {
      setDeleteError(err.message || 'Cannot delete category');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#13221C] p-4 sm:p-5 rounded-xl border border-[#E2EBE5] dark:border-[#264438] shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#172B24] dark:text-[#E6F0EB] tracking-tight">
            Financial Categories
          </h2>
          <p className="text-xs text-[#5B756B] dark:text-[#8AA69B] mt-0.5">
            Classify outgoing expenses and incoming revenue streams
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#087F5B] hover:bg-[#099268] active:bg-[#065F44] rounded-lg transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Segmented Control Tabs */}
      <div className="flex items-center justify-between border-b border-[#E2EBE5] dark:border-[#264438] pb-3">
        <div className="flex items-center gap-2 p-1 bg-[#F0F5F2] dark:bg-[#1C3229] rounded-lg">
          <button
            onClick={() => setActiveTab('expense')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'expense'
                ? 'bg-white dark:bg-[#13221C] text-[#172B24] dark:text-[#E6F0EB] shadow-xs'
                : 'text-[#5B756B] dark:text-[#8AA69B]'
            }`}
          >
            Expense Categories ({categories.filter((c) => c.type === 'expense').length})
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'income'
                ? 'bg-white dark:bg-[#13221C] text-[#172B24] dark:text-[#E6F0EB] shadow-xs'
                : 'text-[#5B756B] dark:text-[#8AA69B]'
            }`}
          >
            Income Categories ({categories.filter((c) => c.type === 'income').length})
          </button>
        </div>
      </div>

      {deleteError && (
        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{deleteError}</span>
        </div>
      )}

      {/* Categories Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#5B756B] dark:text-[#8AA69B]">
          Loading category taxonomy...
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cat) => (
            <div
              key={cat.id}
              className="p-4 rounded-xl bg-white dark:bg-[#13221C] border border-[#E2EBE5] dark:border-[#264438] shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-xs"
                  style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                >
                  <Tags className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[#172B24] dark:text-[#E6F0EB] truncate">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-[#5B756B] dark:text-[#8AA69B] capitalize">
                    {cat.type} · Icon: {cat.icon || 'tag'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setEditingCategory(cat)}
                  title="Edit Category"
                  className="p-1.5 text-[#5B756B] hover:text-[#087F5B] rounded hover:bg-[#F0F5F2] dark:hover:bg-[#1C3229] transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setDeleteError(null);
                    setDeletingCategory(cat);
                  }}
                  title="Delete Category"
                  className="p-1.5 text-[#5B756B] hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Tags}
          title={`No ${activeTab === 'expense' ? 'Expense' : 'Income'} Categories`}
          description="Create your first category classification to organize upcoming transactions."
          actionLabel="Create Category"
          onAction={() => setIsAddModalOpen(true)}
        />
      )}

      {/* Add / Edit Category Modal */}
      <CategoryModal
        isOpen={isAddModalOpen || !!editingCategory}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingCategory(null);
        }}
        onSuccess={fetchCategories}
        categoryToEdit={editingCategory}
        defaultType={activeTab}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deletingCategory?.name}"? Deletion will be rejected if existing transactions are assigned to this category.`}
        confirmLabel="Delete Category"
        isDestructive={true}
        loading={deleteLoading}
      />
    </div>
  );
};
