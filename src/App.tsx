/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { LandingPage } from './pages/LandingPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { TransactionsPage } from './pages/TransactionsPage.js';
import { AnalyticsPage } from './pages/AnalyticsPage.js';
import { BudgetsPage } from './pages/BudgetsPage.js';
import { CategoriesPage } from './pages/CategoriesPage.js';
import { AccountsPage } from './pages/AccountsPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { Sidebar, NavTab } from './components/common/Sidebar.js';
import { Header } from './components/common/Header.js';
import { TransactionModal } from './components/transactions/TransactionModal.js';
import { Wallet2 } from 'lucide-react';

type PublicRoute = 'landing' | 'login' | 'register';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [publicRoute, setPublicRoute] = useState<PublicRoute>('landing');
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isGlobalAddTransactionOpen, setIsGlobalAddTransactionOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7F5] dark:bg-[#0D1714] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#087F5B] text-white flex items-center justify-center shadow-md animate-pulse">
          <Wallet2 className="w-6 h-6" />
        </div>
        <p className="text-xs font-semibold text-[#5B756B] dark:text-[#8AA69B] tracking-wider uppercase">
          Initializing Spendwise 2.0...
        </p>
      </div>
    );
  }

  // Unauthenticated View
  if (!user) {
    if (publicRoute === 'login') {
      return (
        <LoginPage
          onNavigateRegister={() => setPublicRoute('register')}
          onNavigateHome={() => setPublicRoute('landing')}
        />
      );
    }
    if (publicRoute === 'register') {
      return (
        <RegisterPage
          onNavigateLogin={() => setPublicRoute('login')}
          onNavigateHome={() => setPublicRoute('landing')}
        />
      );
    }
    return (
      <LandingPage
        onNavigateLogin={() => setPublicRoute('login')}
        onNavigateRegister={() => setPublicRoute('register')}
      />
    );
  }

  // Authenticated App Shell
  const pageTitles: Record<NavTab, string> = {
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    analytics: 'Analytics',
    budgets: 'Budgets',
    categories: 'Categories',
    accounts: 'Accounts',
    profile: 'Profile',
    settings: 'Settings',
  };

  return (
    <div className="min-h-screen bg-[#F5F7F5] dark:bg-[#0D1714] text-[#172B24] dark:text-[#E6F0EB] transition-colors flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 min-h-screen">
        <Header
          title={pageTitles[activeTab]}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenAddTransaction={() => setIsGlobalAddTransactionOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              key={refreshTrigger}
              onOpenAddTransaction={() => setIsGlobalAddTransactionOpen(true)}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}
          {activeTab === 'transactions' && (
            <TransactionsPage key={refreshTrigger} />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsPage key={refreshTrigger} />
          )}
          {activeTab === 'budgets' && (
            <BudgetsPage key={refreshTrigger} />
          )}
          {activeTab === 'categories' && (
            <CategoriesPage key={refreshTrigger} />
          )}
          {activeTab === 'accounts' && (
            <AccountsPage
              key={refreshTrigger}
              onNavigateTransactions={(accountId) => {
                setActiveTab('transactions');
              }}
            />
          )}
          {activeTab === 'profile' && <ProfilePage />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Quick Add Transaction Modal */}
      <TransactionModal
        isOpen={isGlobalAddTransactionOpen}
        onClose={() => setIsGlobalAddTransactionOpen(false)}
        onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
