/**
 * Textarea
 * Multi-line text input component with validation states and help text
 */

import React, { forwardRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { TextareaFieldProps } from "./types";
import FormField from "./FormField";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  (
    {
      label,
      error,
      success,
      helpText,
      required,
      disabled,
      validating,
      rows = 4,
      containerClassName,
      textareaClassName,
      className,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const showSuccess = success && !hasError;

    return (
      <FormField
        label={label}
        error={error}
        success={success}
        helpText={helpText}
        required={required}
        disabled={disabled}
        className={containerClassName}
      >
        <div className="relative">
          {/* Textarea */}
          <textarea
            ref={ref}
            disabled={disabled || validating}
            rows={rows}
            className={cn(
              // Base styles
              "w-full rounded-lg border-2 px-3 py-2 text-sm font-medium",
              "transition-all duration-200 ease-in-out",
              "resize-vertical min-h-96", // minimum height, allow vertical resize
              "scrollbar-thin scrollbar-thumb-secondary-300 scrollbar-track-transparent",
              "dark:scrollbar-thumb-secondary-600",

              // Base border and background
              "border-secondary-300 dark:border-secondary-600",
              "bg-white dark:bg-secondary-800",
              "text-secondary-900 dark:text-white",
              "placeholder-secondary-400 dark:placeholder-secondary-500",

              // Focus state
              "focus:outline-none focus:ring-2 focus:ring-offset-0",
              "focus:border-primary-500 focus:ring-primary-500/20",
              "dark:focus:border-primary-400 dark:focus:ring-primary-400/20",

              // Error state
              hasError &&
                cn(
                  "border-error-500 dark:border-error-500",
                  "focus:border-error-500 focus:ring-error-500/20",
                  "dark:focus:ring-error-500/20"
                ),

              // Success state
              showSuccess &&
                cn(
                  "border-success-500 dark:border-success-500",
                  "focus:border-success-500 focus:ring-success-500/20",
                  "dark:focus:ring-success-500/20"
                ),

              // Disabled state
              disabled &&
                cn("cursor-not-allowed opacity-50", "bg-secondary-100 dark:bg-secondary-900"),

              // Validating state
              validating && "opacity-75",

              textareaClassName,
              className
            )}
            {...props}
          />

          {/* Status Icons - Top Right Corner */}
          <div
            className={cn(
              "absolute right-3 top-3 flex items-center gap-2",
              "pointer-events-none text-secondary-400"
            )}
          >
            {validating && <Loader2 className="h-4 w-4 animate-spin text-primary-500" />}
            {!validating && hasError && (
              <AlertCircle className="h-4 w-4 text-error-500 dark:text-error-400" />
            )}
            {!validating && showSuccess && (
              <CheckCircle2 className="h-4 w-4 text-success-500 dark:text-success-400" />
            )}
          </div>
        </div>
      </FormField>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
