/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Spendwise 2.0 Authentication & JWT Security Middleware
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Ensure JWT_SECRET and COOKIE_SECRET are properly configured and validate strength
const RAW_JWT_SECRET = process.env.JWT_SECRET?.trim() || '';
const RAW_COOKIE_SECRET = process.env.COOKIE_SECRET?.trim() || '';

// Validate that secrets are not trivial or insecure placeholders
if (process.env.NODE_ENV === 'production') {
  if (!RAW_JWT_SECRET || RAW_JWT_SECRET.length < 32) {
    throw new Error('[Security Error] JWT_SECRET must be at least 32 characters long in production.');
  }
  if (!RAW_COOKIE_SECRET || RAW_COOKIE_SECRET.length < 16) {
    throw new Error('[Security Error] COOKIE_SECRET must be at least 16 characters long in production.');
  }
}

// Secure key for development if not explicitly configured in .env
const JWT_SECRET = RAW_JWT_SECRET && RAW_JWT_SECRET.length >= 16
  ? RAW_JWT_SECRET
  : 'spendwise_production_secure_entropy_jwt_key_2026_fintech_auth';

export const COOKIE_SECRET = RAW_COOKIE_SECRET && RAW_COOKIE_SECRET.length >= 16
  ? RAW_COOKIE_SECRET
  : 'spendwise_cookie_session_signing_secret_2026';

// Requirement: Default JWT expiry is 1d with strict format validation
const rawExpires = process.env.JWT_EXPIRES_IN?.trim();
const JWT_EXPIRES_IN: string | number = (rawExpires && /^[0-9]+[smhdwy]?$/.test(rawExpires)) ? rawExpires : '1d';

export interface AuthUserPayload {
  id: number;
  email: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: AuthUserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
}

export function verifyToken(token: string): AuthUserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUserPayload;
  } catch (err) {
    return null;
  }
}

export function setAuthCookie(res: Response, token: string) {
  res.cookie('spendwise_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 1 day (matches JWT_EXPIRES_IN: 1d)
    path: '/',
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie('spendwise_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Check cookie or Authorization header
  let token = req.cookies?.spendwise_token;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) {
    return res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
  }

  req.user = decoded;
  next();
}
