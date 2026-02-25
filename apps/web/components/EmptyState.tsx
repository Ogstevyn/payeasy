"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export interface EmptyStateProps {
  /** Icon component to display */
  icon?: LucideIcon;
  /** Main heading text */
  title: string;
  /** Descriptive text */
  description?: string;
  /** Optional additional context text */
  detail?: string;
  /** Action button(s) */
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "tertiary";
    icon?: LucideIcon;
  }>;
  /** Custom icon color */
  iconColor?: string;
  /** Icon size in pixels */
  iconSize?: number;
  /** Optional illustration as React node */
  illustration?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  detail,
  actions,
  iconColor = "text-primary-500",
  iconSize = 64,
  illustration,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center",
        "px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20",
        "rounded-lg bg-gradient-to-br from-transparent to-primary-50/20 dark:to-primary-950/10",
        className
      )}
    >
      {/* Icon or Illustration */}
      <div className="mb-6 flex justify-center">
        {illustration ? (
          <div className="w-full max-w-xs">{illustration}</div>
        ) : Icon ? (
          <div className={cn("rounded-full bg-primary-100 p-6 dark:bg-primary-950/30 sm:p-8")}>
            <Icon
              size={iconSize}
              className={cn(iconColor, "transition-colors duration-200")}
              strokeWidth={1.5}
            />
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="w-full max-w-md space-y-4 text-center">
        {/* Title */}
        <h3
          className={cn(
            "text-2xl font-bold sm:text-3xl",
            "text-gray-900 dark:text-gray-50",
            "tracking-tight"
          )}
        >
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p
            className={cn(
              "text-base sm:text-lg",
              "text-gray-600 dark:text-gray-400",
              "leading-relaxed"
            )}
          >
            {description}
          </p>
        )}

        {/* Detail text */}
        {detail && (
          <p className={cn("text-sm sm:text-base", "text-gray-500 dark:text-gray-500", "italic")}>
            {detail}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      {actions && actions.length > 0 && (
        <div
          className={cn(
            "mt-8 flex w-full max-w-md flex-col gap-3",
            actions.length > 1 && "sm:flex-row sm:justify-center"
          )}
        >
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              variant={action.variant || (index === 0 ? "primary" : "secondary")}
              rightIcon={action.icon}
              fullWidth={actions.length === 1}
              className={cn(actions.length > 1 && index > 0 && "sm:w-auto")}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Hook for common empty state scenarios
 */
export const EmptyStateVariants = {
  // No search results found
  noResults: (onClearFilters?: () => void): Partial<EmptyStateProps> => ({
    title: "No results found",
    description: "Try adjusting your search criteria or filters.",
    actions: onClearFilters
      ? [
          {
            label: "Clear filters",
            onClick: onClearFilters,
            variant: "primary",
          },
        ]
      : undefined,
  }),

  // Empty list with ability to create
  emptyList: (itemName: string, onCreate?: () => void): Partial<EmptyStateProps> => ({
    title: `No ${itemName}s yet`,
    description: `Start by creating your first ${itemName}.`,
    actions: onCreate
      ? [
          {
            label: `Create ${itemName}`,
            onClick: onCreate,
            variant: "primary",
          },
        ]
      : undefined,
  }),

  // No permissions
  noPermission: (onGoBack?: () => void): Partial<EmptyStateProps> => ({
    title: "Access denied",
    description: "You don't have permission to view this content.",
    actions: onGoBack
      ? [
          {
            label: "Go back",
            onClick: onGoBack,
            variant: "primary",
          },
        ]
      : undefined,
  }),

  // Connection error
  offline: (onRetry?: () => void): Partial<EmptyStateProps> => ({
    title: "You're offline",
    description: "Check your internet connection and try again.",
    actions: onRetry
      ? [
          {
            label: "Retry",
            onClick: onRetry,
            variant: "primary",
          },
        ]
      : undefined,
  }),

  // Loading finished with no content
  noContent: (): Partial<EmptyStateProps> => ({
    title: "Nothing to show",
    description: "There's no content available right now.",
  }),
};
