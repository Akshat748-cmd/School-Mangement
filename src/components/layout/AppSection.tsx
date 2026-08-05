import React from "react";
import { motion } from "motion/react";
import { AppContainer, AppContainerProps } from "./AppContainer";
import { sectionContainerVariants, MotionViewport } from "../../utils/motion";

export interface AppSectionProps extends React.HTMLAttributes<HTMLElement> {
  id?: string;
  bg?: "paper" | "white" | "navy" | "muted" | "transparent";
  paddingY?: "none" | "sm" | "standard" | "lg" | "xl";
  bordered?: boolean;
  animated?: boolean;
  containerSize?: AppContainerProps["size"];
  containerPadding?: AppContainerProps["padding"];
  disableContainer?: boolean;
  ariaLabelledBy?: string;
  children: React.ReactNode;
}

export const AppSection = React.forwardRef<HTMLElement, AppSectionProps>(
  (
    {
      id,
      bg = "paper",
      paddingY = "standard",
      bordered = false,
      animated = true,
      containerSize = "standard",
      containerPadding = "standard",
      disableContainer = false,
      ariaLabelledBy,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    // Background Tokens
    const bgStyles = {
      paper: "bg-ivory-paper text-body-text",
      white: "bg-white text-body-text",
      navy: "bg-ink-navy text-white",
      muted: "bg-muted-board/50 text-body-text",
      transparent: "bg-transparent text-body-text",
    };

    // Vertical Padding Scale
    const paddingStyles = {
      none: "py-0",
      sm: "py-4 sm:py-8",
      standard: "py-6 sm:py-16",
      lg: "py-8 sm:py-20",
      xl: "py-12 sm:py-24",
    };

    const borderStyles = bordered ? "border-y border-border-custom" : "";

    const combinedClassName = `w-full relative ${bgStyles[bg]} ${paddingStyles[paddingY]} ${borderStyles} ${className}`.trim();

    const contentNode = disableContainer ? (
      children
    ) : (
      <AppContainer size={containerSize} padding={containerPadding}>
        {children}
      </AppContainer>
    );

    if (animated) {
      return (
        <motion.section
          ref={ref as any}
          id={id}
          aria-labelledby={ariaLabelledBy}
          variants={sectionContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={MotionViewport.standard}
          className={combinedClassName}
          {...(props as any)}
        >
          {contentNode}
        </motion.section>
      );
    }

    return (
      <section
        ref={ref}
        id={id}
        aria-labelledby={ariaLabelledBy}
        className={combinedClassName}
        {...props}
      >
        {contentNode}
      </section>
    );
  }
);

AppSection.displayName = "AppSection";
