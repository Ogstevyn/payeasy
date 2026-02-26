"use client";

import { createContext, ReactNode, useState, useCallback, useRef, useEffect } from "react";
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from "lucide-react";

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // milliseconds, 0 = no auto-dismiss
  onDismiss?: () => void;
}

export interface ToastContextValue {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, "id">) => string;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// ──────────────────────────────────────────────────────────────
// Toast Configuration
// ──────────────────────────────────────────────────────────────

export const TOAST_CONFIG: Record<
  ToastType,
  {
    icon: typeof AlertCircle;
    bgColor: string;
    borderColor: string;
    textColor: string;
    iconColor: string;
  }
> = {
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800",
    textColor: "text-green-900 dark:text-green-100",
    iconColor: "text-green-600 dark:text-green-400",
  },
  error: {
    icon: AlertCircle,
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800",
    textColor: "text-red-900 dark:text-red-100",
    iconColor: "text-red-600 dark:text-red-400",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    textColor: "text-yellow-900 dark:text-yellow-100",
    iconColor: "text-yellow-600 dark:text-yellow-400",
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    textColor: "text-blue-900 dark:text-blue-100",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
};

// ──────────────────────────────────────────────────────────────
// Provider Component
// ──────────────────────────────────────────────────────────────

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
}

export function ToastProvider({ children, maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);
  const timersRef = useRef<Record<string, NodeJS.Timeout>>({});

  const dismissToast = useCallback((id: string) => {
    // Clear timer if exists
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }

    setToasts((prev) => {
      const toast = prev.find((t) => t.id === id);
      if (toast?.onDismiss) {
        toast.onDismiss();
      }
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  const showToast = useCallback(
    (toast: Omit<Toast, "id">): string => {
      const id = `toast-${++toastIdRef.current}`;
      const duration = toast.duration ?? 5000; // Default 5 seconds

      setToasts((prev) => {
        const updated = [...prev, { ...toast, id }];
        // Keep only the latest maxToasts
        if (updated.length > maxToasts) {
          const removed = updated.shift();
          if (removed && timersRef.current[removed.id]) {
            clearTimeout(timersRef.current[removed.id]);
            delete timersRef.current[removed.id];
          }
        }
        return updated;
      });

      // Set auto-dismiss timer if duration > 0
      if (duration > 0) {
        timersRef.current[id] = setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast, maxToasts]
  );

  const clearAllToasts = useCallback(() => {
    Object.values(timersRef.current).forEach(clearTimeout);
    timersRef.current = {};
    setToasts([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(clearTimeout);
    };
  }, []);

  const value: ToastContextValue = {
    toasts,
    showToast,
    dismissToast,
    clearAllToasts,
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}
