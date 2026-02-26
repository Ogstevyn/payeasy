"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { captureError } from "@/lib/error-capture";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  /** Show error details (enable only in development) */
  showDetails?: boolean;
  /** Custom title for error message */
  title?: string;
  /** Custom description */
  description?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary component that catches React errors
 * Displays a beautiful error state and logs to error capture service
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: undefined,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error capture service
    if (typeof captureError === 'function') {
      captureError(error, {
        severity: "error",
        extras: {
          componentStack: errorInfo.componentStack,
        },
      });
    } else {
      // Fallback to console if captureError not available
      console.error("Uncaught error:", error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDevelopment = process.env.NODE_ENV === 'development';
      const shouldShowDetails = this.props.showDetails || isDevelopment;

      const title = this.props.title || 'Something went wrong';
      const description = this.props.description ||
        'We\'ve been notified and are looking into it. Please try again.';

      return (
        <div
          className={cn(
            'flex min-h-[400px] w-full flex-col items-center justify-center',
            'px-4 py-12 sm:px-6 sm:py-16',
            'bg-gradient-to-br from-red-50 to-orange-50/30 dark:from-gray-900 dark:to-red-950/10',
            'rounded-lg'
          )}
        >
          {/* Icon */}
          <div className="mb-8 rounded-full bg-red-100/50 dark:bg-red-950/30 p-6 sm:p-8">
            <AlertTriangle
              size={48}
              className="text-red-600 dark:text-red-400"
              strokeWidth={1.5}
            />
          </div>

          {/* Content */}
          <div className="w-full max-w-md space-y-5 text-center">
            <h2 className={cn(
              'text-3xl sm:text-4xl font-bold',
              'text-gray-900 dark:text-gray-50',
              'tracking-tight'
            )}>
              {title}
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              We've been notified and are looking into it.
            </p>
            <button
              onClick={this.handleReset}
              className={cn(
                'inline-flex items-center justify-center gap-2',
                'px-4 py-2 sm:px-6 sm:py-3',
                'bg-red-600 text-white font-medium rounded-lg',
                'hover:bg-red-700 active:bg-red-800',
                'transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'w-full'
              )}
            >
              <RotateCcw size={20} />
              Try again
            </button>
            <button
              onClick={this.handleReload}
              className={cn(
                'inline-flex items-center justify-center gap-2',
                'px-4 py-2 sm:px-6 sm:py-3',
                'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-lg',
                'hover:bg-gray-300 dark:hover:bg-gray-600 active:bg-gray-400 dark:active:bg-gray-500',
                'transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'w-full sm:w-auto'
              )}
            >
              <Home size={20} />
              Reload page
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
