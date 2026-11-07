/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Menu, Plus, Sun, Moon, Database } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../lib/api.js';

interface HeaderProps {
  title: string;
  onOpenMobileSidebar: () => void;
  onOpenAddTransaction: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onOpenMobileSidebar,
  onOpenAddTransaction,
}) => {
  const { preferences, setTheme } = useAuth();
  const [dbStatus, setDbStatus] = useState<string>('Checking...');
  const [isMySql, setIsMySql] = useState<boolean>(false);

  useEffect(() => {
    api.getHealth()
      .then((data) => {
        setIsMySql(data.isMySqlActive);
        setDbStatus(data.isMySqlActive ? 'MySQL 8+ Connected' : 'Local Relational Store');
      })
      .catch(() => {
        setDbStatus('Local Store');
      });
  }, []);

  const currentTheme = preferences?.theme || 'light';
  const toggleTheme = () => {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-[#13221C] border-b border-[#E2EBE5] dark:border-[#264438] px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors">
      {/* Left zone: Mobile toggle + Page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-[#465E55] dark:text-[#9EB5AC] hover:text-[#172B24] dark:hover:text-white rounded-lg"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-[#172B24] dark:text-[#E6F0EB] tracking-tight">
            {title}
          </h1>
        </div>
      </div>

      {/* Right zone: DB Indicator + Theme toggle + Action button */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Database indicator (Clean, unboxed metadata per design constitution) */}
        <div
          title={dbStatus}
          className="hidden md:flex items-center gap-1.5 text-xs text-[#5B756B] dark:text-[#8AA69B] px-2.5 py-1 rounded-md bg-[#F0F5F2] dark:bg-[#1C3229]"
        >
          <Database className={`w-3.5 h-3.5 ${isMySql ? 'text-[#087F5B] dark:text-[#40C057]' : 'text-amber-600 dark:text-amber-400'}`} />
          <span className="font-medium whitespace-nowrap">{dbStatus}</span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`}
          className="p-2 text-[#5B756B] dark:text-[#9EB5AC] hover:text-[#172B24] dark:hover:text-white hover:bg-[#F0F5F2] dark:hover:bg-[#1C3229] rounded-lg transition-colors cursor-pointer"
        >
          {currentTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Add Transaction primary CTA */}
        <button
          onClick={onOpenAddTransaction}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#087F5B] hover:bg-[#099268] active:bg-[#065F44] rounded-lg transition-colors shadow-xs cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>New Transaction</span>
        </button>
      </div>
    </header>
  );
};
