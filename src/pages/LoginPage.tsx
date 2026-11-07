/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Wallet2, Eye, EyeOff, Lock, Mail, ArrowRight, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import { Modal } from '../components/common/Modal.js';

interface LoginPageProps {
  onNavigateRegister: () => void;
  onNavigateHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateRegister,
  onNavigateHome,
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isSmtpAvailable, setIsSmtpAvailable] = useState<boolean | null>(null);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotToken, setForgotToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Check auth features when forgot modal opens
  const openForgotModal = async () => {
    setForgotEmail(email);
    setForgotError(null);
    setForgotMessage(null);
    setForgotStep('request');
    setIsForgotModalOpen(true);
    try {
      const features = await api.getAuthFeatures();
      setIsSmtpAvailable(features.emailPasswordResetAvailable);
    } catch {
      setIsSmtpAvailable(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email: email.trim(), password });
      // Redirect happens automatically in App.tsx when user is authenticated
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResetToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotMessage(null);
    setForgotLoading(true);

    try {
      const res = await api.forgotPassword(forgotEmail.trim());
      setForgotMessage(res.message);
    } catch (err: any) {
      setForgotError(err.message || 'Failed to process password recovery request.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotLoading(true);

    try {
      const res = await api.resetPassword({
        token: forgotToken.trim(),
        newPassword,
      });
      setForgotMessage(res.message);
      setTimeout(() => {
        setIsForgotModalOpen(false);
        setForgotStep('request');
        setForgotMessage(null);
        setPassword(newPassword);
      }, 2000);
    } catch (err: any) {
      setForgotError(err.message || 'Failed to reset password');
    } finally {
      setForgotLoading(false);
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
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-xs text-[#5B756B] dark:text-[#8AA69B]">
          Enter your credentials to access your financial records
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#13221C] py-8 px-6 shadow-sm rounded-xl border border-[#E2EBE5] dark:border-[#264438] sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-3 pr-3 py-2 text-xs sm:text-sm bg-[#FBFDFB] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded-lg text-[#172B24] dark:text-[#E6F0EB] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={openForgotModal}
                  className="text-[11px] font-semibold text-[#087F5B] dark:text-[#40C057] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#087F5B] focus:ring-[#087F5B]"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-[#5B756B] dark:text-[#8AA69B]">
                Remember this session
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-xs sm:text-sm font-semibold text-white bg-[#087F5B] hover:bg-[#099268] active:bg-[#065F44] focus:outline-none transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E2EBE5] dark:border-[#264438] text-center">
            <p className="text-xs text-[#5B756B] dark:text-[#8AA69B]">
              Don&apos;t have an account?{' '}
              <button
                onClick={onNavigateRegister}
                className="font-semibold text-[#087F5B] dark:text-[#40C057] hover:underline cursor-pointer"
              >
                Create one now
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Flow Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Account Password Recovery"
        description="Verify account ownership and set a new password"
        maxWidth="sm"
      >
        <div className="space-y-4">
          {forgotMessage && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
              {forgotMessage}
            </div>
          )}
          {forgotError && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300">
              {forgotError}
            </div>
          )}

          {/* When SMTP is unavailable and in request step */}
          {forgotStep === 'request' && isSmtpAvailable === false && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                <p className="font-semibold mb-1">Email Delivery Unavailable</p>
                Password recovery via email is currently unavailable because email delivery (SMTP) is not configured on this server. Please contact your system administrator.
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setForgotStep('reset')}
                  className="w-full py-2 text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] bg-[#F0F5F2] dark:bg-[#1C3229] hover:bg-[#E2ECE6] rounded-lg transition-colors cursor-pointer"
                >
                  I have a Reset Token
                </button>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="w-full py-2 text-xs font-semibold text-[#5B756B] dark:text-[#8AA69B] hover:text-[#172B24] dark:hover:text-white transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* When SMTP is available (or loading check) and in request step */}
          {forgotStep === 'request' && isSmtpAvailable !== false && (
            <form onSubmit={handleRequestResetToken} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] mb-1">
                  Registered Account Email
                </label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FBFDFB] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded-lg text-[#172B24] dark:text-[#E6F0EB] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
                />
              </div>

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full py-2 text-xs font-semibold text-white bg-[#087F5B] hover:bg-[#099268] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {forgotLoading ? 'Processing Request...' : 'Send Password Reset Email'}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setForgotStep('reset')}
                  className="text-[11px] font-semibold text-[#087F5B] dark:text-[#40C057] hover:underline cursor-pointer"
                >
                  Already have a reset token? Enter it here
                </button>
              </div>
            </form>
          )}

          {/* Reset step: token & new password */}
          {forgotStep === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] mb-1">
                  Reset Token
                </label>
                <input
                  type="text"
                  required
                  value={forgotToken}
                  onChange={(e) => setForgotToken(e.target.value)}
                  placeholder="Paste token received via email"
                  className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-[#FBFDFB] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded-lg text-[#172B24] dark:text-[#E6F0EB] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#172B24] dark:text-[#E6F0EB] mb-1">
                  New Password (min 6 characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new strong password"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FBFDFB] dark:bg-[#182C24] border border-[#CFDCD4] dark:border-[#2C4A3E] rounded-lg text-[#172B24] dark:text-[#E6F0EB] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
                />
              </div>
              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full py-2 text-xs font-semibold text-white bg-[#087F5B] hover:bg-[#099268] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {forgotLoading ? 'Updating Password...' : 'Save New Password'}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setForgotStep('request')}
                  className="text-[11px] font-semibold text-[#5B756B] dark:text-[#8AA69B] hover:text-[#172B24] dark:hover:text-white cursor-pointer"
                >
                  ← Back to request
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
};
