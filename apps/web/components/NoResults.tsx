"use client";

import React from "react";
import { Search, RefreshCw } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { cn } from "@/lib/utils";

export interface NoResultsProps {
  /** Search query that resulted in no results */
  query?: string;
  /** Show clear search button */
  showClearButton?: boolean;
  /** Clear search callback */
  onClear?: () => void;
  /** Additional suggestions */
  suggestions?: string[];
  /** Additional CSS classes */
  className?: string;
}

/**
 * No Results page for search queries
 * Shows when a search returns no matching results
 */
export function NoResults({
  query,
  showClearButton = true,
  onClear,
  suggestions,
  className,
}: NoResultsProps) {
  const actions =
    showClearButton && onClear
      ? [
          {
            label: "Clear search",
            onClick: onClear,
            variant: "primary" as const,
          },
        ]
      : undefined;

  const defaultSuggestions = [
    "Check your spelling",
    "Try different keywords",
    "Try more general searches",
    "Try fewer filters",
  ];

  const finalSuggestions = suggestions || defaultSuggestions;

  return (
    <div className={cn("w-full", className)}>
      <EmptyState
        icon={Search}
        title="No results found"
        description={
          query
            ? `No results for "${query}". Try adjusting your search.`
            : "We couldn't find what you're looking for."
        }
        actions={actions}
        iconColor="text-amber-600 dark:text-amber-400"
      />

      {/* Helpful suggestions */}
      <div
        className={cn(
          "mt-10 rounded-lg bg-white/50 dark:bg-gray-800/50",
          "border border-gray-200 dark:border-gray-700",
          "p-6 sm:p-8",
          "backdrop-blur-sm"
        )}
      >
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-50">Search tips:</h3>
        <ul className="space-y-3">
          {finalSuggestions.map((suggestion, index) => (
            <li
              key={index}
              className={cn("flex items-start gap-3", "text-gray-700 dark:text-gray-300")}
            >
              <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary-500" />
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default NoResults;
