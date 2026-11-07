/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Wallet2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface RegisterPageProps {
  onNavigateLogin: () => void;
  onNavigateHome: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onNavigateLogin,
  onNavigateHome,
}) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute password strength
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F5] dark:bg-[#0D1714] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand */}
        <div
          onClick={onNavigateHome}
          className="flex items-center justify-center gap-2.5 cursor-pointer mb-6"
        >
          <div className="w-10 h-10 rounded-xl bg-[#087F5B] text-white flex items-center justify-center shadow-sm">
            <Wallet2 className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#172B24] dark:text-[#E6F0EB]">
            Spendwise
          </span>
        </div>

        <h2 className="text-center text-2xl font-extrabold text-[#172B24] dark:text-[#E6F0EB] tracking-tight">
          Create your ledger account
        </h2>
        <p className="mt-2 text-center text-xs text-[#5B756B] dark:text-[#8AA69B]">
          Initialize your personal finance workspace with zero demo data
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#13221C] py-8 px-6 shadow-sm rounded-xl border border-[#E2EBE5] dark:border-[#264438] sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FBFDFB] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded-lg text-[#172B24] dark:text-[#E6F0EB] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FBFDFB] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded-lg text-[#172B24] dark:text-[#E6F0EB] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-3 pr-10 py-2 text-xs sm:text-sm bg-[#FBFDFB] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded-lg text-[#172B24] dark:text-[#E6F0EB] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B756B] dark:text-[#7A988D] hover:text-[#172B24] dark:hover:text-white cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength meter */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div
                        key={lvl}
                        className={`flex-1 rounded-full transition-colors ${
                          strength >= lvl
                            ? strength <= 2
                              ? 'bg-rose-500'
                              : strength <= 3
                              ? 'bg-amber-500'
                              : 'bg-[#087F5B]'
                            : 'bg-neutral-200 dark:bg-neutral-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-[#5B756B] dark:text-[#8AA69B] mt-1">
                    {strength <= 2 ? 'Weak' : strength <= 3 ? 'Medium strength' : 'Strong password'}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] mb-1">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FBFDFB] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded-lg text-[#172B24] dark:text-[#E6F0EB] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-xs sm:text-sm font-semibold text-white bg-[#087F5B] hover:bg-[#099268] active:bg-[#065F44] focus:outline-none transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E2EBE5] dark:border-[#264438] text-center">
            <p className="text-xs text-[#5B756B] dark:text-[#8AA69B]">
              Already have an account?{' '}
              <button
                onClick={onNavigateLogin}
                className="font-semibold text-[#087F5B] dark:text-[#40C057] hover:underline cursor-pointer"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
