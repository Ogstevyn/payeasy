"use client";

import React, { useEffect, useState } from "react";
import { WifiOff, RotateCcw, Home } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

export interface NetworkErrorProps {
  /** Custom heading */
  title?: string;
  /** Custom description */
  description?: string;
  /** Show retry button */
  showRetryButton?: boolean;
  /** Show home button */
  showHomeButton?: boolean;
  /** On retry callback */
  onRetry?: () => void;
  /** On go home callback */
  onGoHome?: () => void;
  /** Auto-detect if online */
  autoDetect?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom content */
  children?: React.ReactNode;
}

/**
 * Beautiful Network Error component
 * Shows when network is unavailable
 */
export function NetworkError({
  title = "No internet connection",
  description = "You've lost your connection. Please check your network and try again.",
  showRetryButton = true,
  showHomeButton = true,
  onRetry,
  onGoHome,
  autoDetect = true,
  className,
  children,
}: NetworkErrorProps) {
  const [isOnline, setIsOnline] = useState(typeof window !== "undefined" ? navigator.onLine : true);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (!autoDetect) return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [autoDetect]);

  // Automatically hide when connection restored
  if (autoDetect && isOnline) {
    return null;
  }

  const handleRetry = async () => {
    setIsRetrying(true);
    if (onRetry) {
      try {
        await onRetry();
      } finally {
        setIsRetrying(false);
      }
    } else {
      // Default retry: reload page
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center",
        "px-4 py-12 sm:px-6 sm:py-16",
        "bg-gradient-to-br from-amber-50 to-orange-50/30 dark:from-gray-900 dark:to-amber-950/10",
        "rounded-lg",
        className
      )}
    >
      {/* Animated Icon */}
      <div className="mb-8 rounded-full bg-amber-100/50 p-6 dark:bg-amber-950/30 sm:p-8">
        <div className="relative">
          <WifiOff size={48} className="text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
          <div className="absolute inset-0 animate-pulse" />
        </div>
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

        {/* Troubleshooting tips */}
        <div
          className={cn(
            "rounded-lg bg-white/50 dark:bg-gray-800/50",
            "border border-gray-200 dark:border-gray-700",
            "p-4 text-left sm:p-6",
            "backdrop-blur-sm"
          )}
        >
          <h3 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">Try these steps:</h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>• Check your Wi-Fi or cellular connection</li>
            <li>• Turn airplane mode off and on</li>
            <li>• Restart your router or device</li>
            <li>• Move closer to your Wi-Fi router</li>
          </ul>
        </div>

        {/* Custom content */}
        {children}
      </div>

      {/* Action Buttons */}
      <div
        className={cn(
          "mt-10 flex w-full max-w-xs flex-col gap-3",
          "sm:max-w-sm sm:flex-row sm:justify-center"
        )}
      >
        {showRetryButton && (
          <Button
            onClick={handleRetry}
            isLoading={isRetrying}
            variant="primary"
            fullWidth
            rightIcon={RotateCcw}
          >
            Retry
          </Button>
        )}
        {showHomeButton && (
          <Button
            onClick={handleGoHome}
            variant="secondary"
            fullWidth={!showRetryButton}
            rightIcon={Home}
          >
            Go home
          </Button>
        )}
      </div>

      {/* Status indicator */}
      <div className={cn("mt-8 flex items-center gap-2", "text-sm font-medium")}>
        <div
          className={cn(
            "h-2 w-2 rounded-full",
            isOnline ? "animate-pulse bg-green-500" : "bg-red-500"
          )}
        />
        <span className="text-gray-600 dark:text-gray-400">{isOnline ? "Online" : "Offline"}</span>
      </div>
    </div>
  );
}

export default NetworkError;
