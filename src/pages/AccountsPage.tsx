/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Plus,
  Edit2,
  Trash2,
  CreditCard,
  Building2,
  Banknote,
  TrendingUp,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { api, formatCurrency } from '../lib/api.js';
import { Account, AccountType } from '../types/index.js';
import { AccountModal } from '../components/accounts/AccountModal.js';
import { ConfirmationModal } from '../components/common/ConfirmationModal.js';
import { EmptyState } from '../components/common/EmptyState.js';
import { useAuth } from '../context/AuthContext.js';

interface AccountsPageProps {
  onNavigateTransactions: (accountId?: number) => void;
}

export const AccountsPage: React.FC<AccountsPageProps> = ({
  onNavigateTransactions,
}) => {
  const { preferences } = useAuth();
  const globalCurrency = preferences?.currency || 'USD';

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAccounts();
      setAccounts(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleDelete = async () => {
    if (!deletingAccount) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await api.deleteAccount(deletingAccount.id);
      setDeletingAccount(null);
      fetchAccounts();
    } catch (err: any) {
      setDeleteError(err.message || 'Cannot delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'savings':
        return Building2;
      case 'cash':
        return Banknote;
      case 'credit':
        return CreditCard;
      case 'investment':
        return TrendingUp;
      default:
        return Wallet;
    }
  };

  const totalCalculatedBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#13221C] p-4 sm:p-5 rounded-xl border border-[#E2EBE5] dark:border-[#264438] shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#172B24] dark:text-[#E6F0EB] tracking-tight">
            Financial Accounts
          </h2>
          <p className="text-xs text-[#5B756B] dark:text-[#8AA69B] mt-0.5">
            Total Net Asset Value:{' '}
            <span className="font-bold font-mono tabular-nums text-[#172B24] dark:text-[#E6F0EB]">
              {formatCurrency(totalCalculatedBalance, globalCurrency)}
            </span>{' '}
            across {accounts.length} monitored accounts
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#087F5B] hover:bg-[#099268] active:bg-[#065F44] rounded-lg transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Account</span>
        </button>
      </div>

      {deleteError && (
        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{deleteError}</span>
        </div>
      )}

      {/* Accounts Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#5B756B] dark:text-[#8AA69B]">
          Querying relational accounts...
        </div>
      ) : accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.map((acc) => {
            const Icon = getAccountIcon(acc.type);
            const isNegative = acc.balance < 0;

            return (
              <div
                key={acc.id}
                className="p-5 rounded-xl bg-white dark:bg-[#13221C] border border-[#E2EBE5] dark:border-[#264438] shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-xs"
                        style={{ backgroundColor: `${acc.color}15`, color: acc.color }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#172B24] dark:text-[#E6F0EB] truncate">
                          {acc.name}
                        </h3>
                        <p className="text-[11px] text-[#5B756B] dark:text-[#8AA69B] capitalize">
                          {acc.type} account · {acc.currency || 'USD'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingAccount(acc)}
                        title="Edit Account"
                        className="p-1 text-[#5B756B] hover:text-[#087F5B] rounded hover:bg-[#F0F5F2] dark:hover:bg-[#1C3229] transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteError(null);
                          setDeletingAccount(acc);
                        }}
                        title="Delete Account"
                        className="p-1 text-[#5B756B] hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5">
                    <span className="text-[11px] text-[#5B756B] dark:text-[#8AA69B]">
                      Verified Balance
                    </span>
                    <p
                      className={`text-2xl font-bold font-mono tabular-nums tracking-tight mt-0.5 ${
                        isNegative
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-[#172B24] dark:text-[#E6F0EB]'
                      }`}
                    >
                      {formatCurrency(acc.balance, acc.currency || globalCurrency)}
                    </p>
                  </div>

                  {acc.notes && (
                    <p className="mt-3 text-xs text-[#5B756B] dark:text-[#8AA69B] bg-[#FBFDFB] dark:bg-[#182C24] p-2 rounded-lg border border-[#E2EBE5] dark:border-[#264438] line-clamp-2">
                      {acc.notes}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#E2EBE5] dark:border-[#264438] flex items-center justify-between">
                  <span className="text-[11px] text-[#5B756B] dark:text-[#8AA69B]">
                    Updated in real time
                  </span>
                  <button
                    onClick={() => onNavigateTransactions(acc.id)}
                    className="text-xs font-semibold text-[#087F5B] dark:text-[#40C057] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ledger Entries</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Wallet}
          title="No Accounts Created"
          description="Create your first bank account or cash wallet to start logging financial transactions."
          actionLabel="Add Account"
          onAction={() => setIsAddModalOpen(true)}
        />
      )}

      {/* Add / Edit Account Modal */}
      <AccountModal
        isOpen={isAddModalOpen || !!editingAccount}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingAccount(null);
        }}
        onSuccess={fetchAccounts}
        accountToEdit={editingAccount}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingAccount}
        onClose={() => setDeletingAccount(null)}
        onConfirm={handleDelete}
        title="Delete Account"
        message={`Are you sure you want to delete "${deletingAccount?.name}"? Account deletion will be rejected if existing transactions are linked to this account.`}
        confirmLabel="Delete Account"
        isDestructive={true}
        loading={deleteLoading}
      />
    </div>
  );
};
