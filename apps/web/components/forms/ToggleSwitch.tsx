/**
 * ToggleSwitch
 * Accessible toggle switch component with label and help text
 */

import React, { forwardRef, useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ToggleSwitchProps } from "./types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ToggleSwitch = forwardRef<HTMLInputElement, ToggleSwitchProps>(
  (
    {
      label,
      helpText,
      error,
      required,
      disabled,
      containerClassName,
      checked: initialChecked,
      onChange,
      ...props
    },
    ref
  ) => {
    const [isChecked, setIsChecked] = useState<boolean>(
      typeof initialChecked === "boolean" ? initialChecked : false
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsChecked(e.target.checked);
      onChange?.(e);
    };

    return (
      <div className={cn("w-full", containerClassName)}>
        <div className="flex items-start gap-3">
          {/* Toggle Switch */}
          <div className="relative pt-1">
            <input
              ref={ref}
              type="checkbox"
              checked={isChecked}
              onChange={handleChange}
              disabled={disabled}
              className="sr-only"
              {...props}
            />

            {/* Visual Toggle Switch */}
            <div
              className={cn(
                // Base dimensions
                "h-6 w-11 rounded-full",
                "transition-all duration-200 ease-in-out",
                "cursor-pointer",
                "border border-transparent",

                // Default state
                !isChecked && cn("bg-secondary-300 dark:bg-secondary-600", "shadow-sm"),

                // Checked state
                isChecked &&
                  cn("bg-primary-500 dark:bg-primary-400", "shadow-md shadow-primary-500/20"),

                // Error state
                error && cn("bg-error-500 dark:bg-error-500", "shadow-md shadow-error-500/20"),

                // Disabled state
                disabled &&
                  cn("cursor-not-allowed opacity-50", "bg-secondary-200 dark:bg-secondary-700")
              )}
            >
              {/* Dot/Thumb */}
              <div
                className={cn(
                  "absolute left-1 top-1 h-4 w-4",
                  "rounded-full bg-white",
                  "transition-all duration-200",
                  "shadow-sm",
                  isChecked && "translate-x-5"
                )}
              />
            </div>

            {/* Focus indicator */}
            <div
              className={cn(
                "absolute inset-0 rounded-full",
                "ring-2 ring-transparent ring-offset-2",
                "transition-all duration-200",
                "opacity-0",
                "pointer-events-none"
              )}
            />
          </div>

          {/* Label and Help Text */}
          {(label || helpText) && (
            <div className="min-w-0 flex-1">
              {label && (
                <label
                  className={cn(
                    "inline-block text-sm font-medium",
                    "text-secondary-900 dark:text-secondary-50",
                    "cursor-pointer",
                    disabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  {label}
                  {required && <span className="ml-1 text-error-500">*</span>}
                </label>
              )}
              {helpText && (
                <p className={cn("mt-1 text-sm", "text-secondary-500 dark:text-secondary-400")}>
                  {helpText}
                </p>
              )}
              {error && (
                <p className={cn("mt-1 text-sm font-medium", "text-error-600 dark:text-error-400")}>
                  {error}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

ToggleSwitch.displayName = "ToggleSwitch";

export default ToggleSwitch;
