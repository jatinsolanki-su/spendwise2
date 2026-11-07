/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  PiggyBank,
  Tags,
  Wallet,
  User,
  Settings,
  LogOut,
  Wallet2,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

export type NavTab =
  | 'dashboard'
  | 'transactions'
  | 'analytics'
  | 'budgets'
  | 'categories'
  | 'accounts'
  | 'profile'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();

  const navItems: Array<{ id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'budgets', label: 'Budgets', icon: PiggyBank },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'accounts', label: 'Accounts', icon: Wallet },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-[#13221C] border-r border-[#E2EBE5] dark:border-[#264438] flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div>
          <div className="h-16 px-6 flex items-center justify-between border-b border-[#E2EBE5] dark:border-[#264438]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#087F5B] text-white flex items-center justify-center shadow-xs">
                <Wallet2 className="w-4 h-4" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold tracking-tight text-[#172B24] dark:text-[#E6F0EB]">
                  Spendwise
                </span>
                <span className="text-[11px] font-semibold text-[#087F5B] dark:text-[#40C057]">
                  2.0
                </span>
              </div>
            </div>
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-[#5B756B] hover:text-[#172B24] dark:hover:text-white rounded-md"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#087F5B] text-white shadow-xs font-semibold'
                      : 'text-[#465E55] dark:text-[#9EB5AC] hover:bg-[#F0F5F2] dark:hover:bg-[#1C3229] hover:text-[#172B24] dark:hover:text-[#E6F0EB]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#5B756B] dark:text-[#7A988D]'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User profile & logout footer */}
        <div className="p-4 border-t border-[#E2EBE5] dark:border-[#264438] bg-[#FBFDFB] dark:bg-[#111E18]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#087F5B]/15 text-[#087F5B] dark:text-[#40C057] font-semibold text-xs flex items-center justify-center shrink-0">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] truncate">
                  {user?.name || 'Account'}
                </p>
                <p className="text-[11px] text-[#5B756B] dark:text-[#7A988D] truncate">
                  {user?.email || ''}
                </p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 text-[#5B756B] hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
