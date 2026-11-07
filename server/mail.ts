/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Spendwise 2.0 Optional SMTP Mail Service
 * Only initializes a transport when valid SMTP environment variables are present.
 * Completely optional; absence never blocks application startup or core auth flows.
 */

import nodemailer, { type Transporter } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const SMTP_HOST = process.env.SMTP_HOST?.trim() || '';
const SMTP_PORT = parseInt(process.env.SMTP_PORT?.trim() || '587', 10);
const SMTP_USER = process.env.SMTP_USER?.trim() || '';
const SMTP_PASS = process.env.SMTP_PASS?.trim() || '';
const SMTP_FROM = process.env.SMTP_FROM?.trim() || 'Spendwise <noreply@spendwise.app>';

/**
 * Returns true only when complete, valid SMTP connection credentials are provided.
 */
export function isSmtpConfigured(): boolean {
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS && !isNaN(SMTP_PORT));
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!isSmtpConfigured()) {
    return null;
  }
  if (!transporter) {
    try {
      transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465, // true for port 465, false for 587/other
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });
      console.log(`[Spendwise Mail] Real SMTP transport initialized for host: ${SMTP_HOST}:${SMTP_PORT}`);
    } catch (err: any) {
      console.error('[Spendwise Mail] Failed to construct SMTP transport:', err.message);
      transporter = null;
    }
  }
  return transporter;
}

export interface SendResetEmailParams {
  toEmail: string;
  resetToken: string;
  userName?: string;
}

/**
 * Sends a real password reset email if SMTP is configured.
 * Throws a descriptive error if SMTP is not configured or transmission fails.
 */
export async function sendPasswordResetEmail({ toEmail, resetToken, userName }: SendResetEmailParams): Promise<void> {
  if (!isSmtpConfigured()) {
    throw new Error('Email delivery is not configured on this server.');
  }

  const transport = getTransporter();
  if (!transport) {
    throw new Error('SMTP transport could not be initialized. Please check server SMTP configuration.');
  }

  const appUrl = process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetLink = `${appUrl}/#reset-password?token=${encodeURIComponent(resetToken)}`;

  const subject = 'Reset Your Spendwise 2.0 Password';
  const textContent = `Hello ${userName || 'User'},\n\nA password reset request was received for your Spendwise 2.0 account.\n\nUse the following token or link to reset your password:\nReset Token: ${resetToken}\nReset Link: ${resetLink}\n\nThis token will expire in 1 hour. If you did not make this request, you can safely ignore this email.\n\nBest regards,\nSpendwise Finance Team`;
  
  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #E2EBE5; border-radius: 12px; background-color: #FFFFFF; color: #172B24;">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="width: 36px; height: 36px; border-radius: 8px; background-color: #087F5B; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; text-align: center; line-height: 36px;">S</div>
        <span style="margin-left: 10px; font-size: 20px; font-weight: 700; color: #172B24;">Spendwise 2.0</span>
      </div>
      <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 12px; color: #172B24;">Password Reset Request</h2>
      <p style="font-size: 14px; line-height: 1.5; color: #465E55; margin-bottom: 16px;">
        Hello ${userName || 'there'}, we received a request to reset your password. Use the token below or click the button to set a new password.
      </p>
      <div style="background-color: #F5F7F5; border: 1px solid #CFDCD4; border-radius: 8px; padding: 14px; font-family: monospace; font-size: 16px; font-weight: 600; text-align: center; letter-spacing: 1px; color: #087F5B; margin-bottom: 20px;">
        ${resetToken}
      </div>
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${resetLink}" style="background-color: #087F5B; color: #FFFFFF; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600; display: inline-block;">Reset Password</a>
      </div>
      <p style="font-size: 12px; color: #5B756B; line-height: 1.4; border-top: 1px solid #E2EBE5; padding-top: 16px;">
        This token is valid for 1 hour. If you did not request a password reset, you can safely ignore this email.
      </p>
    </div>
  `;

  await transport.sendMail({
    from: SMTP_FROM,
    to: toEmail,
    subject,
    text: textContent,
    html: htmlContent,
  });

  console.log(`[Spendwise Mail] Real password reset email dispatched to ${toEmail}`);
}
