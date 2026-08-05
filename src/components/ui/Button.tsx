import React from "react";
import { motion, HTMLMotionProps } from "motion/react";
import { buttonPressProps } from "../../utils/motion";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  ariaLabel?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className = "",
      disabled,
      ariaLabel,
      ...props
    },
    ref
  ) => {
    // Base Classes
    const baseStyles =
      "inline-flex items-center justify-center font-sans font-bold tracking-wide rounded-sm transition-all focus-visible:outline-2 focus-visible:outline-brass-gold focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer";

    // Size Variants
    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs gap-1.5",
      md: "px-5 py-2.5 text-sm gap-2",
      lg: "px-6 py-3.5 text-base gap-2.5",
    };

    // Style Variants
    const variantStyles = {
      primary:
        "bg-brass-gold text-ink-navy hover:bg-gold-hover shadow-sm border border-brass-gold/30",
      secondary:
        "bg-ink-navy text-white hover:bg-navy-surface border border-brass-gold/20 shadow-sm",
      outline:
        "bg-transparent text-ink-navy border border-border-custom hover:bg-white hover:border-brass-gold/50 shadow-2xs",
      ghost:
        "bg-transparent text-maroon hover:text-ink-navy hover:bg-muted-board/60 border-none",
      danger:
        "bg-maroon text-white hover:bg-maroon/90 shadow-sm border border-maroon/20",
    };

    const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${
      fullWidth ? "w-full" : ""
    } ${className}`.trim();

    return (
      <motion.button
        ref={ref}
        {...buttonPressProps}
        className={combinedClassName}
        disabled={disabled || isLoading}
        aria-label={ariaLabel}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </span>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
