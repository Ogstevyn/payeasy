"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Toast as ToastType, TOAST_CONFIG } from "@/contexts/ToastContext";

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
  index: number;
}

// ──────────────────────────────────────────────────────────────
// Toast Component
// ──────────────────────────────────────────────────────────────

/**
 * Individual toast notification component
 *
 * Features:
 * - Smooth slide-in and fade-out animations
 * - Auto-dismiss with visual indicator
 * - Close button for manual dismissal
 * - Type-specific icons and colors
 * - Accessible structure
 *
 * @example
 * ```tsx
 * <Toast
 *   toast={toast}
 *   onDismiss={dismissToast}
 *   index={0}
 * />
 * ```
 */
export function Toast({ toast, onDismiss, index }: ToastProps) {
  const [isClosing, setIsClosing] = useState(false);
  const config = TOAST_CONFIG[toast.type];
  const IconComponent = config.icon;

  const handleDismiss = () => {
    setIsClosing(true);
    // Wait for animation to complete
    setTimeout(() => {
      onDismiss(toast.id);
    }, 300);
  };

  return (
    <div
      className={cn(
        // Base styles
        "flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg",
        // Colors
        config.bgColor,
        config.borderColor,
        // Animation
        "animate-in fade-in slide-in-from-right-4 duration-300",
        isClosing && "animate-out fade-out slide-out-to-right-4 duration-300",
        // Position
        "pointer-events-auto"
      )}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      {/* Icon */}
      <IconComponent
        className={cn("mt-0.5 h-5 w-5 flex-shrink-0", config.iconColor)}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-semibold", config.textColor)}>{toast.title}</p>
        {toast.message && (
          <p className={cn("mt-0.5 text-sm opacity-90", config.textColor)}>{toast.message}</p>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={handleDismiss}
        className={cn(
          "mt-0.5 flex-shrink-0 rounded-md p-1 transition-colors",
          "hover:bg-black/10 dark:hover:bg-white/10",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          `focus:ring-${toast.type === "success" ? "green" : toast.type === "error" ? "red" : toast.type === "warning" ? "yellow" : "blue"}-500`,
          config.textColor
        )}
        aria-label="Dismiss notification"
        type="button"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Toast Container
// ──────────────────────────────────────────────────────────────

interface ToastContainerProps {
  toasts: ToastType[];
  onDismiss: (id: string) => void;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
}

const POSITION_CLASSES: Record<string, string> = {
  "top-right": "top-4 right-4",
  "top-left": "top-4 left-4",
  "bottom-right": "bottom-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
};

/**
 * Container for managing multiple toasts
 *
 * Features:
 * - Responsive positioning
 * - Smooth stacking animation
 * - Mobile-friendly layout
 * - Accessible notification management
 *
 * @example
 * ```tsx
 * <ToastContainer
 *   toasts={toasts}
 *   onDismiss={dismissToast}
 *   position="bottom-right"
 * />
 * ```
 */
export function ToastContainer({
  toasts,
  onDismiss,
  position = "bottom-right",
}: ToastContainerProps) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed z-50",
        POSITION_CLASSES[position],
        // Stack direction based on position
        position.includes("top") ? "flex flex-col gap-3" : "flex flex-col-reverse gap-3",
        // Mobile responsive
        "max-w-sm md:max-w-md",
        "px-4 md:px-0"
      )}
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} index={toasts.indexOf(toast)} />
      ))}
    </div>
  );
}
