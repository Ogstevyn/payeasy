/**
 * CheckboxGroup
 * Group of checkboxes with label, error, and help text support
 */

import React, { useState, useCallback } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CheckboxGroupProps } from "./types";
import FormField from "./FormField";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CheckboxGroup = React.forwardRef<HTMLDivElement, CheckboxGroupProps>(
  (
    {
      label,
      error,
      helpText,
      required,
      options,
      value = [],
      onChange,
      disabled,
      containerClassName,
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState<(string | number)[]>(
      Array.isArray(value) ? value : []
    );

    const handleChange = useCallback(
      (itemValue: string | number) => {
        const newValue = internalValue.includes(itemValue)
          ? internalValue.filter((v) => v !== itemValue)
          : [...internalValue, itemValue];

        setInternalValue(newValue);
        onChange?.(newValue);
      },
      [internalValue, onChange]
    );

    const isChecked = (itemValue: string | number) => internalValue.includes(itemValue);

    return (
      <FormField
        ref={ref}
        label={label}
        error={error}
        helpText={helpText}
        required={required}
        disabled={disabled}
        className={containerClassName}
      >
        <fieldset className="space-y-3">
          {options.map((option) => (
            <div key={option.id} className="flex items-start gap-3">
              <div className="flex h-6 items-center pt-0.5">
                <input
                  id={option.id}
                  type="checkbox"
                  checked={isChecked(option.value)}
                  onChange={() => handleChange(option.value)}
                  disabled={disabled || option.disabled}
                  className={cn(
                    // Base styles
                    "h-5 w-5 rounded border-2",
                    "transition-all duration-200 ease-in-out",
                    "cursor-pointer",

                    // Default border
                    "border-secondary-300 dark:border-secondary-600",

                    // Checked state
                    "checked:border-primary-500 checked:bg-primary-500",
                    "dark:checked:border-primary-400 dark:checked:bg-primary-400",

                    // Focus state
                    "focus:outline-none focus:ring-2 focus:ring-offset-0",
                    "focus:ring-primary-500/50 dark:focus:ring-primary-400/50",

                    // Error state
                    error &&
                      cn(
                        "border-error-500 dark:border-error-500",
                        "focus:ring-error-500/50 dark:focus:ring-error-500/50"
                      ),

                    // Disabled state
                    (disabled || option.disabled) &&
                      cn("cursor-not-allowed opacity-50", "bg-secondary-100 dark:bg-secondary-900"),

                    // Checked checkmark color (Tailwind built-in)
                    "[accent-color:theme(colors.primary.500)]",
                    "dark:[accent-color:theme(colors.primary.400)]"
                  )}
                />
              </div>

              <div className="min-w-0 flex-1">
                <label
                  htmlFor={option.id}
                  className={cn(
                    "block text-sm font-medium",
                    "text-secondary-900 dark:text-secondary-50",
                    "cursor-pointer",
                    (disabled || option.disabled) && "cursor-not-allowed opacity-50"
                  )}
                >
                  {option.label}
                </label>
                {option.helpText && (
                  <p className={cn("mt-1 text-xs", "text-secondary-500 dark:text-secondary-400")}>
                    {option.helpText}
                  </p>
                )}
              </div>
            </div>
          ))}
        </fieldset>
      </FormField>
    );
  }
);

CheckboxGroup.displayName = "CheckboxGroup";

export default CheckboxGroup;
