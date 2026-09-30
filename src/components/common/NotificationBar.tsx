import React, { useEffect } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export type NotificationType = 'success' | 'warning' | 'error' | 'info';

export interface NotificationState {
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
}

interface NotificationBarProps {
  notification: NotificationState | null;
  onClose: () => void;
  className?: string;
}

export const NotificationBar: React.FC<NotificationBarProps> = ({
  notification,
  onClose,
  className = '',
}) => {
  useEffect(() => {
    if (!notification) return;
    const duration = notification.duration ?? 5000;
    if (duration <= 0) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  const { type, title, message } = notification;

  const typeConfig = {
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/80',
      border: 'border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-900 dark:text-emerald-100',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      icon: CheckCircleIcon,
      defaultTitle: 'Success',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/80',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-900 dark:text-amber-100',
      iconColor: 'text-amber-600 dark:text-amber-400',
      icon: ExclamationTriangleIcon,
      defaultTitle: 'Security Notice',
    },
    error: {
      bg: 'bg-rose-50 dark:bg-rose-950/80',
      border: 'border-rose-200 dark:border-rose-800',
      text: 'text-rose-900 dark:text-rose-100',
      iconColor: 'text-rose-600 dark:text-rose-400',
      icon: XCircleIcon,
      defaultTitle: 'Action Failed',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950/80',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-900 dark:text-blue-100',
      iconColor: 'text-blue-600 dark:text-blue-400',
      icon: InformationCircleIcon,
      defaultTitle: 'Notice',
    },
  }[type];

  const Icon = typeConfig.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`relative w-full rounded-2xl border p-4 shadow-lg transition-all animate-in slide-in-from-top-2 fade-in duration-200 ${typeConfig.bg} ${typeConfig.border} ${typeConfig.text} ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <div className={`p-1 rounded-xl shrink-0 mt-0.5 ${typeConfig.iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold tracking-tight">
              {title || typeConfig.defaultTitle}
            </h4>
            {type === 'warning' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                <ShieldCheckIcon className="w-3 h-3" />
                Protected
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm mt-1 leading-relaxed opacity-90">
            {message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer shrink-0"
          aria-label="Dismiss notification"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationBar;
