"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home, Mail } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

export interface ServerErrorProps {
  /** Custom heading */
  title?: string;
  /** Custom description */
  description?: string;
  /** Error details (usually hidden in production) */
  details?: string;
  /** Show home button */
  showHomeButton?: boolean;
  /** Show retry button */
  showRetryButton?: boolean;
  /** Show support button */
  showSupportButton?: boolean;
  /** On retry callback */
  onRetry?: () => void;
  /** Custom actions */
  actions?: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "tertiary";
    icon?: React.ReactNode;
  }>;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Beautiful 500 Server Error page
 * Shows when something goes wrong on the server
 */
export function ServerError({
  title = "Something went wrong",
  description = "We're experiencing some technical difficulties. Our team has been notified and is working on a fix.",
  details,
  showHomeButton = true,
  showRetryButton = true,
  showSupportButton = true,
  onRetry,
  actions,
  className,
}: ServerErrorProps) {
  const defaultActions = [
    ...(showRetryButton && onRetry
      ? [
          {
            label: "Try again",
            onClick: onRetry,
            variant: "primary" as const,
            icon: <RotateCcw size={18} />,
          },
        ]
      : []),
    ...(showHomeButton
      ? [
          {
            label: "Back to home",
            href: "/",
            variant: "secondary" as const,
            icon: <Home size={18} />,
          },
        ]
      : []),
    ...(showSupportButton
      ? [
          {
            label: "Contact support",
            href: "mailto:support@payeasy.com",
            variant: "secondary" as const,
            icon: <Mail size={18} />,
          },
        ]
      : []),
  ];

  const finalActions = actions || defaultActions;

  return (
    <div
      className={cn(
        "flex min-h-[calc(100vh-200px)] flex-col items-center justify-center",
        "px-4 py-12 sm:px-6 sm:py-20",
        "bg-gradient-to-br from-red-50 to-orange-50/30 dark:from-gray-900 dark:to-red-950/10",
        className
      )}
    >
      {/* Large 500 Number */}
      <div className="mb-8 text-center">
        <div className="inline-block">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-600 opacity-25 blur-3xl" />
            <h1
              className={cn(
                "relative text-8xl font-black sm:text-9xl",
                "bg-gradient-to-r from-red-500 via-orange-500 to-red-600",
                "bg-clip-text text-transparent",
                "select-none tracking-tighter"
              )}
            >
              500
            </h1>
          </div>
        </div>
      </div>

      {/* Icon */}
      <div className="mb-8 rounded-full bg-red-100/50 p-6 dark:bg-red-950/30 sm:p-8">
        <AlertTriangle
          size={48}
          className="animate-pulse text-red-600 dark:text-red-400"
          strokeWidth={1.5}
        />
      </div>

      {/* Content */}
      <div className="w-full max-w-md space-y-5 text-center">
        <h2
          className={cn(
            "text-3xl font-bold sm:text-4xl",
            "text-gray-900 dark:text-gray-50",
            "tracking-tight"
          )}
        >
          {title}
        </h2>

        <p className={cn("text-lg leading-relaxed", "text-gray-700 dark:text-gray-300")}>
          {description}
        </p>

        {/* Error details (for development/debugging) */}
        {details && (
          <div
            className={cn(
              "rounded-lg bg-red-50/50 dark:bg-red-950/20",
              "border border-red-200 dark:border-red-900/50",
              "p-4 text-left",
              "overflow-auto"
            )}
          >
            <p className="mb-2 text-xs font-semibold text-red-700 dark:text-red-300">
              Error details:
            </p>
            <code
              className={cn(
                "block whitespace-pre-wrap break-words",
                "text-xs leading-relaxed",
                "text-red-600 dark:text-red-400",
                "font-mono"
              )}
            >
              {details}
            </code>
          </div>
        )}

        {/* Status info */}
        <div
          className={cn(
            "rounded-lg bg-white/50 dark:bg-gray-800/50",
            "border border-gray-200 dark:border-gray-700",
            "p-4 text-sm sm:p-5",
            "backdrop-blur-sm"
          )}
        >
          <p className="text-gray-700 dark:text-gray-300">
            Our team has been automatically notified and is investigating the issue.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className={cn(
          "mt-10 flex w-full max-w-xs flex-col gap-3",
          finalActions.length > 1 && "sm:max-w-md sm:flex-row sm:justify-center"
        )}
      >
        {finalActions.map((action, index) => {
          const buttonProps = {
            variant: (action.variant || "primary") as "primary" | "secondary" | "tertiary",
            fullWidth: finalActions.length === 1,
            className: finalActions.length > 1 && index > 0 ? "sm:w-auto" : "",
            key: index,
          };

          if (action.href) {
            return (
              <Link key={index} href={action.href} className="w-full">
                <Button {...buttonProps} className="w-full">
                  {action.label}
                </Button>
              </Link>
            );
          }

          return (
            <Button {...buttonProps} onClick={action.onClick}>
              {action.label}
            </Button>
          );
        })}
      </div>

      {/* Footer hint */}
      <p className={cn("mt-12 text-center text-sm", "text-gray-500 dark:text-gray-500")}>
        Error code: <code className="font-mono font-semibold">500</code> •{" "}
        <code className="font-mono font-semibold">Internal Server Error</code>
      </p>
    </div>
  );
}

export default ServerError;
