import React from "react";
import { motion, HTMLMotionProps } from "motion/react";
import { cardHoverProps } from "../../utils/motion";

export interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  variant?: "elevated" | "outlined" | "flat" | "interactive" | "glass";
  padding?: "none" | "sm" | "md" | "lg";
  accentBorder?: boolean;
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "elevated",
      padding = "md",
      accentBorder = false,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    // Base Classes
    const baseStyles =
      "rounded-sm overflow-hidden relative transition-all duration-200 text-body-text";

    // Padding Variants
    const paddingStyles = {
      none: "p-0",
      sm: "p-3 sm:p-4",
      md: "p-4 sm:p-6",
      lg: "p-6 sm:p-8 lg:p-10",
    };

    // Style Variants
    const variantStyles = {
      elevated:
        "bg-white border border-border-custom shadow-sm hover:shadow-md hover:border-border-custom/80",
      outlined:
        "bg-white border border-border-custom shadow-2xs",
      flat:
        "bg-muted-board/60 border border-border-custom/70",
      interactive:
        "bg-white border border-border-custom shadow-sm hover:shadow-md hover:border-brass-gold/40 cursor-pointer",
      glass:
        "glass-card-light shadow-md",
    };

    const accentStyles = accentBorder
      ? "before:absolute before:top-0 before:left-0 before:h-full before:w-1 before:bg-brass-gold"
      : "";

    const combinedClassName = `${baseStyles} ${paddingStyles[padding]} ${variantStyles[variant]} ${accentStyles} ${className}`.trim();

    if (variant === "interactive") {
      return (
        <motion.div
          ref={ref}
          {...cardHoverProps}
          className={combinedClassName}
          {...props}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={combinedClassName} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
