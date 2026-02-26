"use client";

import React from "react";
import Link from "next/link";
import { Search, Home, Mail } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

export interface NotFoundProps {
  /** Custom heading */
  title?: string;
  /** Custom description */
  description?: string;
  /** Show home button */
  showHomeButton?: boolean;
  /** Show contact support button */
  showSupportButton?: boolean;
  /** Custom actions */
  actions?: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "tertiary";
  }>;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Beautiful 404 Not Found page
 * Shows when a requested page doesn't exist
 */
export function NotFound({
  title = "Page not found",
  description = "Sorry, the page you're looking for doesn't exist or has been moved.",
  showHomeButton = true,
  showSupportButton = true,
  actions,
  className,
}: NotFoundProps) {
  const defaultActions = [
    ...(showHomeButton
      ? [
          {
            label: "Back to home",
            href: "/",
            variant: "primary" as const,
          },
        ]
      : []),
    ...(showSupportButton
      ? [
          {
            label: "Contact support",
            href: "mailto:support@payeasy.com",
            variant: "secondary" as const,
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
        "bg-gradient-to-br from-gray-50 to-primary-50/30 dark:from-gray-900 dark:to-primary-950/10",
        className
      )}
    >
      {/* Large 404 Number */}
      <div className="mb-8 text-center">
        <div className="inline-block">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 opacity-20 blur-3xl" />
            <h1
              className={cn(
                "relative text-8xl font-black sm:text-9xl",
                "bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700",
                "bg-clip-text text-transparent",
                "select-none tracking-tighter"
              )}
            >
              404
            </h1>
          </div>
        </div>
      </div>

      {/* Icon */}
      <div className="mb-8 rounded-full bg-primary-100/50 p-6 dark:bg-primary-950/30 sm:p-8">
        <Search size={48} className="text-primary-600 dark:text-primary-400" strokeWidth={1.5} />
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

        {/* Helpful tips */}
        <div
          className={cn(
            "rounded-lg bg-white/50 dark:bg-gray-800/50",
            "border border-gray-200 dark:border-gray-700",
            "p-4 text-left sm:p-6",
            "backdrop-blur-sm"
          )}
        >
          <h3 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">What you can try:</h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>• Check if the URL is spelled correctly</li>
            <li>• Go back to the previous page</li>
            <li>• Use the search function to find what you need</li>
            <li>• Contact support if you need help</li>
          </ul>
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

          const hasHref = "href" in action && action.href;

          if (hasHref) {
            return (
              <Link key={index} href={action.href as string} className="w-full">
                <Button {...buttonProps} className="w-full">
                  {action.label}
                </Button>
              </Link>
            );
          }

          const hasOnClick = "onClick" in action;
          return (
            <Button {...buttonProps} onClick={hasOnClick ? (action as any).onClick : () => {}}>
              {action.label}
            </Button>
          );
        })}
      </div>

      {/* Footer hint */}
      <p className={cn("mt-12 text-center text-sm", "text-gray-500 dark:text-gray-500")}>
        Error code: <code className="font-mono font-semibold">404</code>
      </p>
    </div>
  );
}

export default NotFound;
