import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string | null;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      className = "",
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

    const baseInputStyles =
      "w-full font-sans text-sm text-body-text bg-white border rounded-lg px-4 h-12 transition-all duration-200 outline-none placeholder:text-muted-text/50 disabled:bg-muted-board disabled:cursor-not-allowed";

    const stateStyles = error
      ? "border-error focus:ring-2 focus:ring-error/20 focus:border-error text-error"
      : "border-border-custom hover:border-border-custom/80 focus:ring-2 focus:ring-brass-gold/25 focus:border-brass-gold shadow-xs";

    return (
      <div className="w-full space-y-2 text-left">
        {label && (
          <label
            htmlFor={generatedId}
            className="block font-sans text-xs font-semibold text-body-text uppercase tracking-wider"
          >
            {label}
            {required && <span className="text-maroon ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-muted-text pointer-events-none shrink-0">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={generatedId}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            className={`${baseInputStyles} ${stateStyles} ${
              leftIcon ? "pl-10" : ""
            } ${rightIcon ? "pr-10" : ""} ${className}`.trim()}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 text-muted-text shrink-0">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="font-sans text-xs text-error font-medium flex items-center gap-1 mt-1.5">
            <span>•</span>
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="font-sans text-xs text-muted-text mt-1.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string | null;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      className = "",
      id,
      disabled,
      required,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const generatedId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

    const baseStyles =
      "w-full font-sans text-sm text-body-text bg-white border rounded-lg px-4 py-3 transition-all duration-200 outline-none placeholder:text-muted-text/50 disabled:bg-muted-board disabled:cursor-not-allowed resize-y";

    const stateStyles = error
      ? "border-error focus:ring-2 focus:ring-error/20 focus:border-error"
      : "border-border-custom hover:border-border-custom/80 focus:ring-2 focus:ring-brass-gold/25 focus:border-brass-gold shadow-xs";

    return (
      <div className="w-full space-y-2 text-left">
        {label && (
          <label
            htmlFor={generatedId}
            className="block font-sans text-xs font-semibold text-body-text uppercase tracking-wider"
          >
            {label}
            {required && <span className="text-maroon ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={generatedId}
          disabled={disabled}
          required={required}
          rows={rows}
          aria-invalid={!!error}
          className={`${baseStyles} ${stateStyles} ${className}`.trim()}
          {...props}
        />

        {error ? (
          <p className="font-sans text-xs text-error font-medium flex items-center gap-1 mt-1">
            <span>•</span>
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="font-sans text-xs text-muted-text mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string | null;
  options: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      options,
      className = "",
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

    const baseStyles =
      "w-full font-sans text-sm text-body-text bg-white border rounded-sm px-3.5 py-2.5 transition-all duration-150 outline-none disabled:bg-muted-board disabled:cursor-not-allowed appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23475569%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10";

    const stateStyles = error
      ? "border-error focus:ring-2 focus:ring-error/20 focus:border-error"
      : "border-border-custom hover:border-border-custom/80 focus:ring-2 focus:ring-brass-gold/25 focus:border-brass-gold";

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={generatedId}
            className="block font-sans text-xs font-semibold text-body-text uppercase tracking-wider"
          >
            {label}
            {required && <span className="text-maroon ml-1">*</span>}
          </label>
        )}

        <select
          ref={ref}
          id={generatedId}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          className={`${baseStyles} ${stateStyles} ${className}`.trim()}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {error ? (
          <p className="font-sans text-xs text-error font-medium flex items-center gap-1 mt-1">
            <span>•</span>
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="font-sans text-xs text-muted-text mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";
