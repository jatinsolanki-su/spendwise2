/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Wallet2 } from 'lucide-react';

interface NavbarProps {
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateLogin, onNavigateRegister }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E2EBE5] dark:border-[#264438] bg-white/95 dark:bg-[#13221C]/95 backdrop-blur-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text wordmark with pine emblem */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-[#087F5B] text-white flex items-center justify-center shadow-sm">
            <Wallet2 className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#172B24] dark:text-[#E6F0EB] whitespace-nowrap">
            Spendwise
          </span>
        </div>

        {/* Zone 2: Single-line clean navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#465E55] dark:text-[#9EB5AC]">
          <a href="#features" className="hover:text-[#087F5B] dark:hover:text-[#40C057] transition-colors whitespace-nowrap">
            Features
          </a>
          <a href="#tracking" className="hover:text-[#087F5B] dark:hover:text-[#40C057] transition-colors whitespace-nowrap">
            Cash Flow
          </a>
          <a href="#budgets" className="hover:text-[#087F5B] dark:hover:text-[#40C057] transition-colors whitespace-nowrap">
            Budgets
          </a>
          <a href="#security" className="hover:text-[#087F5B] dark:hover:text-[#40C057] transition-colors whitespace-nowrap">
            Security & Privacy
          </a>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onNavigateLogin}
            className="px-4 py-2 text-sm font-medium text-[#172B24] dark:text-[#E6F0EB] hover:text-[#087F5B] dark:hover:text-[#40C057] transition-colors whitespace-nowrap cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={onNavigateRegister}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#087F5B] hover:bg-[#099268] active:bg-[#065F44] rounded-lg transition-colors shadow-sm whitespace-nowrap cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
};
