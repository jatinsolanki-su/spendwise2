/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Edit2,
  Trash2,
  Calendar,
  Receipt,
  Download,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';
import { api, formatCurrency, formatDate } from '../lib/api.js';
import { Transaction, Account, Category } from '../types/index.js';
import { ConfirmationModal } from '../components/common/ConfirmationModal.js';
import { TransactionModal } from '../components/transactions/TransactionModal.js';
import { EmptyState } from '../components/common/EmptyState.js';
import { useAuth } from '../context/AuthContext.js';

export const TransactionsPage: React.FC = () => {
  const { preferences } = useAuth();
  const currency = preferences?.currency || 'USD';

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {
        page,
        limit,
        sortField,
        sortOrder,
      };
      if (searchTerm) params.search = searchTerm;
      if (selectedType) params.type = selectedType;
      if (selectedAccountId) params.accountId = selectedAccountId;
      if (selectedCategoryId) params.categoryId = selectedCategoryId;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.getTransactions(params);
      setTransactions(res.transactions || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalRecords(res.pagination?.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([api.getAccounts(), api.getCategories()])
      .then(([accs, cats]) => {
        setAccounts(accs);
        setCategories(cats);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [
    page,
    sortField,
    sortOrder,
    selectedType,
    selectedAccountId,
    selectedCategoryId,
    startDate,
    endDate,
  ]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      fetchTransactions();
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleDelete = async () => {
    if (!deletingTransaction) return;
    setDeleteLoading(true);
    try {
      await api.deleteTransaction(deletingTransaction.id);
      setDeletingTransaction(null);
      fetchTransactions();
    } catch (err: any) {
      alert(err.message || 'Failed to delete transaction');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['ID', 'Date', 'Title', 'Type', 'Category', 'Account', 'Amount', 'Description'];
    const rows = transactions.map((t) => [
      t.id,
      t.date,
      `"${t.title.replace(/"/g, '""')}"`,
      t.type,
      `"${(t.category_name || '').replace(/"/g, '""')}"`,
      `"${(t.account_name || '').replace(/"/g, '""')}"`,
      t.amount,
      `"${(t.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `spendwise_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedAccountId('');
    setSelectedCategoryId('');
    setStartDate('');
    setEndDate('');
    setSortField('date');
    setSortOrder('desc');
    setPage(1);
  };

  return (
    <div className="space-y-5">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#13221C] p-4 sm:p-5 rounded-xl border border-[#E2EBE5] dark:border-[#264438] shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#172B24] dark:text-[#E6F0EB] tracking-tight">
            Transactions Ledger
          </h2>
          <p className="text-xs text-[#5B756B] dark:text-[#8AA69B] mt-0.5">
            Total {totalRecords} records stored in relational database
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#465E55] dark:text-[#9EB5AC] hover:text-[#172B24] dark:hover:text-white bg-[#F5F7F5] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded-lg transition-colors cursor-pointer disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#087F5B] hover:bg-[#099268] active:bg-[#065F44] rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#13221C] p-4 rounded-xl border border-[#E2EBE5] dark:border-[#264438] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search input */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5B756B] dark:text-[#7A988D]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or payee..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#FBFDFB] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded-lg text-[#172B24] dark:text-[#E6F0EB] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
            />
          </div>

          {/* Type filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-[#FBFDFB] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded-lg text-[#172B24] dark:text-[#E6F0EB] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
            >
              <option value="">All Types (Income & Expense)</option>
              <option value="expense">Expense Only</option>
              <option value="income">Income Only</option>
            </select>
          </div>

          {/* Account filter */}
          <div>
            <select
              value={selectedAccountId}
              onChange={(e) => {
                setSelectedAccountId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-[#FBFDFB] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded-lg text-[#172B24] dark:text-[#E6F0EB] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
            >
              <option value="">All Accounts</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div>
            <select
              value={selectedCategoryId}
              onChange={(e) => {
                setSelectedCategoryId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-[#FBFDFB] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded-lg text-[#172B24] dark:text-[#E6F0EB] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Date Range & Sort Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E2EBE5] dark:border-[#264438] text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#5B756B] dark:text-[#8AA69B] font-medium">Date Range:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-2 py-1 text-xs bg-[#FBFDFB] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded text-[#172B24] dark:text-[#E6F0EB]"
            />
            <span className="text-[#5B756B] dark:text-[#8AA69B]">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-2 py-1 text-xs bg-[#FBFDFB] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded text-[#172B24] dark:text-[#E6F0EB]"
            />

            {(searchTerm || selectedType || selectedAccountId || selectedCategoryId || startDate || endDate) && (
              <button
                onClick={resetFilters}
                className="ml-2 text-xs font-semibold text-[#087F5B] dark:text-[#40C057] hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#5B756B] dark:text-[#8AA69B] font-medium">Sort by:</span>
            <button
              onClick={() => {
                if (sortField === 'date') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortField('date');
                  setSortOrder('desc');
                }
              }}
              className={`px-2.5 py-1 rounded border text-xs font-medium cursor-pointer ${
                sortField === 'date'
                  ? 'border-[#087F5B] text-[#087F5B] dark:text-[#40C057] bg-[#087F5B]/5'
                  : 'border-[#CFDCD4] dark:border-[#2C4A3E] text-[#5B756B]'
              }`}
            >
              Date ({sortField === 'date' ? (sortOrder === 'asc' ? 'Oldest' : 'Newest') : 'Date'})
            </button>
            <button
              onClick={() => {
                if (sortField === 'amount') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortField('amount');
                  setSortOrder('desc');
                }
              }}
              className={`px-2.5 py-1 rounded border text-xs font-medium cursor-pointer ${
                sortField === 'amount'
                  ? 'border-[#087F5B] text-[#087F5B] dark:text-[#40C057] bg-[#087F5B]/5'
                  : 'border-[#CFDCD4] dark:border-[#2C4A3E] text-[#5B756B]'
              }`}
            >
              Amount ({sortField === 'amount' ? (sortOrder === 'asc' ? 'Low-High' : 'High-Low') : 'Amount'})
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="bg-white dark:bg-[#13221C] rounded-xl border border-[#E2EBE5] dark:border-[#264438] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#5B756B] dark:text-[#8AA69B]">
            Loading ledger entries...
          </div>
        ) : transactions.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#FBFDFB] dark:bg-[#182C24] border-b border-[#E2EBE5] dark:border-[#264438] text-[#5B756B] dark:text-[#8AA69B]">
                    <th className="py-3 px-4 font-semibold">Title / Description</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold">Account</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold text-right">Amount</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2EBE5] dark:divide-[#264438]">
                  {transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-[#F9FBFA] dark:hover:bg-[#182C24]/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-[#172B24] dark:text-[#E6F0EB]">
                        <div>
                          <p className="font-semibold text-xs text-[#172B24] dark:text-[#E6F0EB]">
                            {tx.title}
                          </p>
                          {tx.description && (
                            <p className="text-[11px] text-[#5B756B] dark:text-[#8AA69B] truncate max-w-xs mt-0.5">
                              {tx.description}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1.5 text-[#465E55] dark:text-[#9EB5AC]">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: tx.category_color || '#087F5B' }}
                          />
                          <span className="font-medium truncate">{tx.category_name}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-[#5B756B] dark:text-[#7A988D]">
                        <span className="font-medium truncate">{tx.account_name}</span>
                      </td>

                      <td className="py-3 px-4 text-[#5B756B] dark:text-[#7A988D] font-mono tabular-nums whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>

                      <td
                        className={`py-3 px-4 text-right font-mono tabular-nums font-bold whitespace-nowrap ${
                          tx.type === 'income'
                            ? 'text-[#087F5B] dark:text-[#40C057]'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount, currency)}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingTransaction(tx)}
                            title="Edit Transaction"
                            className="p-1.5 text-[#5B756B] hover:text-[#087F5B] dark:hover:text-[#40C057] rounded hover:bg-[#F0F5F2] dark:hover:bg-[#1C3229] transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingTransaction(tx)}
                            title="Delete Transaction"
                            className="p-1.5 text-[#5B756B] hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-[#E2EBE5] dark:border-[#264438] flex items-center justify-between text-xs text-[#5B756B] dark:text-[#8AA69B]">
              <span>
                Showing page {page} of {totalPages} ({totalRecords} total items)
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 rounded border border-[#CFDCD4] dark:border-[#2C4A3E] bg-[#FBFDFB] dark:bg-[#182C24] hover:bg-[#F0F5F2] disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 rounded border border-[#CFDCD4] dark:border-[#2C4A3E] bg-[#FBFDFB] dark:bg-[#182C24] hover:bg-[#F0F5F2] disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            icon={Receipt}
            title="No Matching Transactions"
            description="No transaction records match your current filters. Adjust your criteria or add a new entry."
            actionLabel="Add Transaction"
            onAction={() => setIsAddModalOpen(true)}
          />
        )}
      </div>

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isAddModalOpen || !!editingTransaction}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSuccess={fetchTransactions}
        transactionToEdit={editingTransaction}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        message={`Are you sure you want to permanently delete transaction "${deletingTransaction?.title}" (${formatCurrency(
          deletingTransaction?.amount || 0,
          currency
        )})? This will revert the account balance calculation.`}
        confirmLabel="Delete"
        isDestructive={true}
        loading={deleteLoading}
      />
    </div>
  );
};
