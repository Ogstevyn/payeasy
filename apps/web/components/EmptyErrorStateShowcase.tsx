"use client";

import React, { useState } from "react";
import { Button } from "./Button";
import { EmptyState, EmptyStateVariants } from "./EmptyState";
import { NotFound } from "./NotFound";
import { ServerError } from "./ServerError";
import { NetworkError } from "./NetworkError";
import { NoResults } from "./NoResults";
import { cn } from "@/lib/utils";
import { Package, FileX, AlertTriangle, WifiOff, Search, Home } from "lucide-react";

/**
 * Showcase of all empty/error state components
 * For development and design reference
 */
export function EmptyErrorStateShowcase() {
  const [activeState, setActiveState] = useState<
    "empty" | "noResults" | "404" | "500" | "network" | "noPermission"
  >("empty");
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => setIsRetrying(false), 1000);
  };

  const states = [
    { id: "empty", label: "Empty State", icon: "📭" },
    { id: "noResults", label: "No Results", icon: "🔍" },
    { id: "404", label: "404 Not Found", icon: "🚫" },
    { id: "500", label: "500 Server Error", icon: "⚠️" },
    { id: "network", label: "Network Error", icon: "📡" },
    { id: "noPermission", label: "No Permission", icon: "🔒" },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
            Empty & Error States
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Beautiful, accessible, and mobile-responsive state screens
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {states.map((state) => (
              <button
                key={state.id}
                onClick={() => setActiveState(state.id as any)}
                className={cn(
                  "rounded-lg px-4 py-2 font-medium transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                  activeState === state.id
                    ? "bg-primary-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                )}
              >
                <span className="mr-2">{state.icon}</span>
                {state.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Empty State */}
          {activeState === "empty" && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-50">
                  Empty State
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Use when a list or section has no content yet
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-12 dark:border-gray-700 dark:bg-gray-800">
                <EmptyState
                  icon={Package}
                  title="No items yet"
                  description="Start by creating your first item."
                  actions={[
                    {
                      label: "Create item",
                      onClick: () => alert("Create clicked"),
                      variant: "primary",
                    },
                  ]}
                />
              </div>
            </div>
          )}

          {/* No Results */}
          {activeState === "noResults" && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-50">
                  No Results
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Use when a search query returns no matching results
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-12 dark:border-gray-700 dark:bg-gray-800">
                <NoResults
                  query="vintage leather jackets"
                  onClear={() => alert("Filters cleared")}
                />
              </div>
            </div>
          )}

          {/* 404 */}
          {activeState === "404" && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-50">
                  404 Not Found
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Use when a page or resource doesn&apos;t exist
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
                <NotFound showHomeButton showSupportButton />
              </div>
            </div>
          )}

          {/* 500 */}
          {activeState === "500" && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-50">
                  500 Server Error
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Use when something goes wrong on the server
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
                <ServerError
                  showRetryButton
                  showHomeButton
                  showSupportButton
                  onRetry={handleRetry}
                  details={isRetrying ? "Retrying..." : undefined}
                />
              </div>
            </div>
          )}

          {/* Network Error */}
          {activeState === "network" && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-50">
                  Network Error
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Use when the user is offline or loses connection
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
                <NetworkError
                  autoDetect={false}
                  showRetryButton
                  showHomeButton
                  onRetry={handleRetry}
                />
              </div>
            </div>
          )}

          {/* No Permission */}
          {activeState === "noPermission" && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-50">
                  No Permission
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Use when the user lacks access permissions
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-12 dark:border-gray-700 dark:bg-gray-800">
                <EmptyState
                  icon={AlertTriangle}
                  title="Access denied"
                  description="You don't have permission to view this content."
                  iconColor="text-yellow-600 dark:text-yellow-400"
                  actions={[
                    {
                      label: "Request access",
                      onClick: () => alert("Access request submitted"),
                      variant: "primary",
                    },
                  ]}
                />
              </div>
            </div>
          )}

          {/* Code Examples */}
          <div className="mt-12 rounded-lg bg-gray-100 p-6 dark:bg-gray-800 sm:p-8">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-50">
              Implementation Examples
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="mb-2 font-mono font-bold text-gray-700 dark:text-gray-300">
                  EmptyState with custom icon:
                </p>
                <pre
                  className={cn(
                    "overflow-x-auto rounded bg-gray-900 p-4",
                    "font-mono text-xs leading-relaxed text-gray-100"
                  )}
                >
                  {`<EmptyState
  icon={Package}
  title="No items"
  description="Create your first item"
  actions={[{
    label: 'Create',
    onClick: handleCreate
  }]}
/>`}
                </pre>
              </div>

              <div>
                <p className="mb-2 font-mono font-bold text-gray-700 dark:text-gray-300">
                  NoResults for search:
                </p>
                <pre
                  className={cn(
                    "overflow-x-auto rounded bg-gray-900 p-4",
                    "font-mono text-xs leading-relaxed text-gray-100"
                  )}
                >
                  {`<NoResults
  query={searchTerm}
  onClear={() => setSearchTerm('')}
  suggestions={[
    'Check spelling',
    'Try different keywords'
  ]}
/>`}
                </pre>
              </div>

              <div>
                <p className="mb-2 font-mono font-bold text-gray-700 dark:text-gray-300">
                  ServerError with retry:
                </p>
                <pre
                  className={cn(
                    "overflow-x-auto rounded bg-gray-900 p-4",
                    "font-mono text-xs leading-relaxed text-gray-100"
                  )}
                >
                  {`<ServerError
  title="Something went wrong"
  onRetry={() => location.reload()}
  showRetryButton
  showHomeButton
/>`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmptyErrorStateShowcase;
