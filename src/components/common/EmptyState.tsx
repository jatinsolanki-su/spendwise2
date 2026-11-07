/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-[#CFDCD4] dark:border-[#2C4A3E] bg-[#FBFDFB] dark:bg-[#111F19]/50">
      <div className="w-12 h-12 rounded-xl bg-[#087F5B]/10 dark:bg-[#087F5B]/20 text-[#087F5B] dark:text-[#40C057] flex items-center justify-center mb-3.5">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-[#172B24] dark:text-[#E6F0EB]">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[#5B756B] dark:text-[#8AA69B] max-w-sm mt-1 mb-5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#087F5B] hover:bg-[#099268] active:bg-[#065F44] rounded-lg transition-colors shadow-xs cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
