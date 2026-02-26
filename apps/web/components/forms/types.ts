/**
 * Form component types and interfaces
 * Shared across all form components
 */

export type ValidationState = 'default' | 'success' | 'error' | 'loading';

export interface FormFieldProps {
  label?: string;
  error?: string;
  success?: boolean;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helpText?: string;
  required?: boolean;
  icon?: React.ReactNode;
  validating?: boolean;
  containerClassName?: string;
  inputClassName?: string;
}

export interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helpText?: string;
  required?: boolean;
  rows?: number;
  validating?: boolean;
  containerClassName?: string;
  textareaClassName?: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helpText?: string;
  required?: boolean;
  options: SelectOption[];
  placeholder?: string;
  validating?: boolean;
  containerClassName?: string;
  selectClassName?: string;
}

export interface CheckboxOption {
  id: string;
  label: string;
  value: string | number;
  disabled?: boolean;
  helpText?: string;
}

export interface CheckboxGroupProps {
  label?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  options: CheckboxOption[];
  value?: (string | number)[];
  onChange?: (values: (string | number)[]) => void;
  disabled?: boolean;
  containerClassName?: string;
}

export interface RadioOption {
  id: string;
  label: string;
  value: string | number;
  disabled?: boolean;
  helpText?: string;
}

export interface RadioGroupProps {
  label?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  options: RadioOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  disabled?: boolean;
  containerClassName?: string;
}

export interface ToggleSwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  helpText?: string;
  error?: string;
  required?: boolean;
  containerClassName?: string;
}

export interface FileUploadProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  helpText?: string;
  error?: string;
  required?: boolean;
  accept?: string;
  dragAndDrop?: boolean;
  maxSize?: number;
  containerClassName?: string;
}

export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  helpText?: string;
  error?: string;
  required?: boolean;
  containerClassName?: string;
  min?: string;
  max?: string;
}
