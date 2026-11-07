/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  Laptop,
  Coins,
  Calendar,
  Bell,
  Database,
  LogOut,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import { ConfirmationModal } from '../components/common/ConfirmationModal.js';

export const SettingsPage: React.FC = () => {
  const { preferences, setTheme, updateUserPreferences, logout } = useAuth();

  const [currency, setCurrency] = useState(preferences?.currency || 'USD');
  const [dateFormat, setDateFormat] = useState(preferences?.date_format || 'YYYY-MM-DD');
  const [budgetAlerts, setBudgetAlerts] = useState(preferences?.notification_budget_alerts ?? true);
  const [dbInfo, setDbInfo] = useState<any>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    if (preferences) {
      setCurrency(preferences.currency);
      setDateFormat(preferences.date_format);
      setBudgetAlerts(preferences.notification_budget_alerts);
    }
    api.getHealth()
      .then((data) => setDbInfo(data))
      .catch((err) => console.error(err));
  }, [preferences]);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    try {
      await updateUserPreferences({
        currency,
        date_format: dateFormat,
        notification_budget_alerts: budgetAlerts,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Title */}
      <div className="bg-white dark:bg-[#13221C] p-4 sm:p-5 rounded-xl border border-[#E2EBE5] dark:border-[#264438] shadow-xs">
        <h2 className="text-base sm:text-lg font-bold text-[#172B24] dark:text-[#E6F0EB] tracking-tight">
          System Preferences & Configuration
        </h2>
        <p className="text-xs text-[#5B756B] dark:text-[#8AA69B] mt-0.5">
          Customize currency symbols, date representation, and appearance
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Preferences successfully synchronized with your account database.</span>
        </div>
      )}

      {/* Theme Preference */}
      <div className="bg-white dark:bg-[#13221C] p-6 rounded-xl border border-[#E2EBE5] dark:border-[#264438] shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[#172B24] dark:text-[#E6F0EB]">
            Interface Theme
          </h3>
          <p className="text-xs text-[#5B756B] dark:text-[#8AA69B] mt-0.5">
            Choose light mode, dark mode, or follow your operating system preferences
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-colors cursor-pointer ${
              preferences?.theme === 'light'
                ? 'border-[#087F5B] bg-[#087F5B]/10 text-[#087F5B] font-semibold'
                : 'border-[#CFDCD4] dark:border-[#2C4A3E] text-[#465E55] dark:text-[#9EB5AC] hover:bg-[#F5F7F5] dark:hover:bg-[#182C24]'
            }`}
          >
            <Sun className="w-5 h-5" />
            <span className="text-xs">Light Theme</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-colors cursor-pointer ${
              preferences?.theme === 'dark'
                ? 'border-[#40C057] bg-[#40C057]/15 text-[#40C057] font-semibold'
                : 'border-[#CFDCD4] dark:border-[#2C4A3E] text-[#465E55] dark:text-[#9EB5AC] hover:bg-[#F5F7F5] dark:hover:bg-[#182C24]'
            }`}
          >
            <Moon className="w-5 h-5" />
            <span className="text-xs">Dark Theme</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-colors cursor-pointer ${
              preferences?.theme === 'system'
                ? 'border-[#087F5B] bg-[#087F5B]/10 text-[#087F5B] font-semibold'
                : 'border-[#CFDCD4] dark:border-[#2C4A3E] text-[#465E55] dark:text-[#9EB5AC] hover:bg-[#F5F7F5] dark:hover:bg-[#182C24]'
            }`}
          >
            <Laptop className="w-5 h-5" />
            <span className="text-xs">System Auto</span>
          </button>
        </div>
      </div>

      {/* Financial Preferences Form */}
      <form onSubmit={handleSavePreferences} className="bg-white dark:bg-[#13221C] p-6 rounded-xl border border-[#E2EBE5] dark:border-[#264438] shadow-xs space-y-5">
        <div>
          <h3 className="text-sm font-bold text-[#172B24] dark:text-[#E6F0EB]">
            Financial & Regional Formatting
          </h3>
          <p className="text-xs text-[#5B756B] dark:text-[#8AA69B] mt-0.5">
            Configure default currency denomination and ledger timestamp formats
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] mb-1">
              Primary Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FBFDFB] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded-lg text-[#172B24] dark:text-[#E6F0EB] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
            >
              <option value="USD">USD ($) — US Dollar</option>
              <option value="EUR">EUR (€) — Euro</option>
              <option value="GBP">GBP (£) — British Pound</option>
              <option value="CAD">CAD ($) — Canadian Dollar</option>
              <option value="AUD">AUD ($) — Australian Dollar</option>
              <option value="INR">INR (₹) — Indian Rupee</option>
              <option value="JPY">JPY (¥) — Japanese Yen</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] mb-1">
              Date Representation
            </label>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FBFDFB] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded-lg text-[#172B24] dark:text-[#E6F0EB] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
            >
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY (UK / Europe)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (US Standard)</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={budgetAlerts}
              onChange={(e) => setBudgetAlerts(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#087F5B] focus:ring-[#087F5B]"
            />
            <div>
              <p className="text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB]">
                Monthly Budget Threshold Warnings
              </p>
              <p className="text-[11px] text-[#5B756B] dark:text-[#8AA69B]">
                Display amber visual alerts when &gt;80% and red alerts when &gt;100% of category limits are consumed
              </p>
            </div>
          </label>
        </div>

        <button
          type="submit"
          className="px-5 py-2 text-xs font-semibold text-white bg-[#087F5B] hover:bg-[#099268] active:bg-[#065F44] rounded-lg transition-colors shadow-xs cursor-pointer"
        >
          Save Financial Preferences
        </button>
      </form>

      {/* Database Connection Status Diagnostics */}
      <div className="bg-white dark:bg-[#13221C] p-6 rounded-xl border border-[#E2EBE5] dark:border-[#264438] shadow-xs space-y-3">
        <div className="flex items-center gap-2.5">
          <Database className="w-5 h-5 text-[#087F5B] dark:text-[#40C057]" />
          <div>
            <h3 className="text-sm font-bold text-[#172B24] dark:text-[#E6F0EB]">
              Database Engine Status
            </h3>
            <p className="text-xs text-[#5B756B] dark:text-[#8AA69B]">
              Relational backend architecture diagnostics
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#F5F7F5] dark:bg-[#182C24] border border-[#E2EBE5] dark:border-[#264438] text-xs font-mono space-y-1">
          <p className="text-[#172B24] dark:text-[#E6F0EB]">
            Active Engine: <span className="font-bold text-[#087F5B] dark:text-[#40C057]">{dbInfo?.database || 'Loading...'}</span>
          </p>
          <p className="text-[#5B756B] dark:text-[#8AA69B]">
            MySQL Mode: {dbInfo?.isMySqlActive ? 'Connected (Pool initialized)' : 'Offline (Local Relational fallback engine active)'}
          </p>
          <p className="text-[#5B756B] dark:text-[#8AA69B]">
            Server Time: {dbInfo?.timestamp || new Date().toISOString()}
          </p>
        </div>
      </div>

      {/* Sign Out & Account Actions */}
      <div className="bg-white dark:bg-[#13221C] p-6 rounded-xl border border-[#E2EBE5] dark:border-[#264438] shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#172B24] dark:text-[#E6F0EB]">
            Session Management
          </h3>
          <p className="text-xs text-[#5B756B] dark:text-[#8AA69B] mt-0.5">
            Safely terminate current session cookie
          </p>
        </div>

        <button
          onClick={() => logout()}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
