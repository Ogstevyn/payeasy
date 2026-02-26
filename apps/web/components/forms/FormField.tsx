/**
 * FormField
 * Wrapper component that provides consistent label, error, and help text styling
 */

import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { FormFieldProps } from "./types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FormFieldWrapperProps extends FormFieldProps {
  children: React.ReactNode;
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldWrapperProps>(
  ({ label, error, success, helpText, required, disabled, className, children }, ref) => {
    return (
      <div ref={ref} className={cn("w-full", className)}>
        {label && (
          <label
            className={cn(
              "mb-2 block text-sm font-medium",
              "text-secondary-900 dark:text-secondary-50",
              disabled && "opacity-50"
            )}
          >
            {label}
            {required && <span className="ml-1 text-error-500">*</span>}
          </label>
        )}

        <div className="relative">{children}</div>

        {error && (
          <p className={cn("mt-1 text-sm font-medium", "text-error-600 dark:text-error-400")}>
            {error}
          </p>
        )}

        {success && !error && (
          <p className={cn("mt-1 text-sm font-medium", "text-success-600 dark:text-success-400")}>
            ✓ Valid
          </p>
        )}

        {helpText && !error && (
          <p className={cn("mt-1 text-sm", "text-secondary-500 dark:text-secondary-400")}>
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

export default FormField;
