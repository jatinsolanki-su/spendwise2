/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserPreferences } from '../types/index.js';
import { api } from '../lib/api.js';

interface AuthContextType {
  user: User | null;
  preferences: UserPreferences | null;
  loading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Apply theme to HTML root
  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const refreshUser = async () => {
    try {
      const data = await api.getMe();
      setUser(data.user);
      setPreferences(data.preferences);
      if (data.preferences?.theme) {
        applyTheme(data.preferences.theme);
      }
    } catch {
      setUser(null);
      setPreferences(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (data: any) => {
    const res = await api.login(data);
    setUser(res.user);
    setPreferences(res.preferences);
    if (res.preferences?.theme) {
      applyTheme(res.preferences.theme);
    }
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    setUser(res.user);
    setPreferences(res.preferences);
    if (res.preferences?.theme) {
      applyTheme(res.preferences.theme);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      setPreferences(null);
    }
  };

  const setTheme = async (theme: 'light' | 'dark' | 'system') => {
    applyTheme(theme);
    if (preferences) {
      const updated = { ...preferences, theme };
      setPreferences(updated);
      try {
        await api.updatePreferences({ theme });
      } catch (err) {
        console.error('Failed to persist theme:', err);
      }
    }
  };

  const updateUserPreferences = async (newPrefs: Partial<UserPreferences>) => {
    if (preferences) {
      const updated = { ...preferences, ...newPrefs };
      setPreferences(updated);
      if (newPrefs.theme) {
        applyTheme(newPrefs.theme);
      }
      await api.updatePreferences(newPrefs);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        preferences,
        loading,
        login,
        register,
        logout,
        refreshUser,
        setTheme,
        updateUserPreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
