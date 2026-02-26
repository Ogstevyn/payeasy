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

            <p className={cn(
              'text-lg leading-relaxed',
              'text-gray-700 dark:text-gray-300'
            )}>
              {description}
            </p>

            {/* Error details (development only) */}
            {shouldShowDetails && this.state.error && (
              <details className={cn(
                'rounded-lg bg-red-50/50 dark:bg-red-950/20',
                'border border-red-200 dark:border-red-900/50',
                'p-4 text-left w-full',
                'cursor-pointer'
              )}>
                <summary className="mb-3 font-semibold text-red-700 dark:text-red-300 select-none">
                  Error details (development only)
                </summary>
                <div className="space-y-2 text-xs">
                  <div>
                    <p className="font-mono font-bold text-red-600 dark:text-red-400">
                      {this.state.error.name}
                    </p>
                    <code className={cn(
                      'block whitespace-pre-wrap break-words',
                      'text-red-600 dark:text-red-400',
                      'mt-1'
                    )}>
                      {this.state.error.message}
                    </code>
                  </div>
                  {this.state.error.stack && (
                    <pre className={cn(
                      'overflow-auto bg-white/50 dark:bg-gray-800/50',
                      'rounded p-2 text-xs leading-relaxed',
                      'text-red-600 dark:text-red-400 font-mono',
                      'max-h-48'
                    )}>
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            {/* Help text */}
            <div className={cn(
              'rounded-lg bg-white/50 dark:bg-gray-800/50',
              'border border-gray-200 dark:border-gray-700',
              'p-4 sm:p-5 text-sm',
              'backdrop-blur-sm'
            )}>
              <p className="text-gray-700 dark:text-gray-300">
                Try refreshing the page or contact support if the problem persists.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={cn(
            'mt-10 flex flex-col gap-3 w-full max-w-xs',
            'sm:flex-row sm:justify-center sm:max-w-sm'
          )}>
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
