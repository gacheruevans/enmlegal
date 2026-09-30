import React from 'react';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { UserAvatar } from '../../../components/common/UserAvatar';

export interface StatusModalUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  imageUrl?: string | null;
}

interface StatusConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: StatusModalUser | null;
  onConfirm: () => void;
  loading: boolean;
}

export const StatusConfirmModal: React.FC<StatusConfirmModalProps> = ({
  isOpen,
  onClose,
  user,
  onConfirm,
  loading,
}) => {
  if (!isOpen || !user) return null;

  const willActivate = !user.isActive;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div
          className={`px-6 py-5 border-b flex items-center justify-between text-white ${
            willActivate
              ? 'bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 border-emerald-800/40'
              : 'bg-gradient-to-r from-rose-950 via-slate-900 to-rose-900 border-rose-800/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                willActivate
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {willActivate ? (
                <CheckCircleIcon className="w-6 h-6" />
              ) : (
                <ExclamationTriangleIcon className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-white">
                {willActivate ? 'Reactivate User Account' : 'Deactivate User Account'}
              </h3>
              <p className="text-xs text-slate-300">Administrative access authorization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-slate-800 dark:text-slate-200 text-sm">
          {/* User Preview Pill */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center gap-3.5">
            <UserAvatar src={user.imageUrl} name={user.name} size="md" />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-900 dark:text-white truncate">
                {user.name}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user.email}
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 shrink-0">
              {user.role}
            </span>
          </div>

          {/* Impact Explanations */}
          {willActivate ? (
            <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
              <p className="font-semibold flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                Access Restoration
              </p>
              <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                This will restore login capabilities for <strong>{user.email}</strong>. They will be able to access the admin portal and manage authorized records.
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-800/60 text-xs text-rose-900 dark:text-rose-200 space-y-1">
              <p className="font-semibold flex items-center gap-1.5 text-rose-800 dark:text-rose-300">
                <ExclamationTriangleIcon className="w-4 h-4 text-rose-600 shrink-0" />
                Access Revocation
              </p>
              <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                Deactivating <strong>{user.email}</strong> will immediately prevent them from logging into the portal and invalidate active sessions. Only an Administrator can reactivate it.
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheckIcon className="w-4 h-4 text-slate-400 shrink-0" />
            <span>This administrative action is recorded in the immutable activity audit log.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2 text-xs font-bold rounded-xl text-white shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-2 ${
              willActivate
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/20'
                : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-rose-500/20'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Processing...</span>
              </>
            ) : willActivate ? (
              <span>Confirm Reactivation</span>
            ) : (
              <span>Confirm Deactivation</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusConfirmModal;
