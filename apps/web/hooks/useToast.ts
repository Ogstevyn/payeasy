'use client'

import { useContext } from 'react'
import { ToastContext, Toast, ToastType } from '@/contexts/ToastContext'

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  return {
    ...context,
    /**
     * Show a success toast
     */
    success: (title: string, message?: string, duration = 5000) =>
      context.showToast({
        type: 'success',
        title,
        message,
        duration,
      }),

    /**
     * Show an error toast
     */
    error: (title: string, message?: string, duration = 5000) =>
      context.showToast({
        type: 'error',
        title,
        message,
        duration,
      }),

    /**
     * Show a warning toast
     */
    warning: (title: string, message?: string, duration = 5000) =>
      context.showToast({
        type: 'warning',
        title,
        message,
        duration,
      }),

    /**
     * Show an info toast
     */
    info: (title: string, message?: string, duration = 5000) =>
      context.showToast({
        type: 'info',
        title,
        message,
        duration,
      }),

    /**
     * Show a custom toast
     */
    show: (toast: Omit<Toast, 'id'>) => context.showToast(toast),
  }
}

export type UseToast = ReturnType<typeof useToast>
