import React from "react";
import { ContainerWidth } from "../../constants/design-tokens";

export interface AppContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: keyof typeof ContainerWidth;
  padding?: "none" | "sm" | "standard" | "lg";
  as?: React.ElementType;
  children: React.ReactNode;
}

export const AppContainer = React.forwardRef<HTMLDivElement, AppContainerProps>(
  (
    {
      size = "standard",
      padding = "standard",
      as: Component = "div",
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    const widthClass = ContainerWidth[size] || ContainerWidth.standard;

    const paddingClasses = {
      none: "px-0",
      sm: "px-4",
      standard: "px-4 sm:px-6 lg:px-8",
      lg: "px-6 sm:px-8 lg:px-12",
    };

    const combinedClassName = `${widthClass} mx-auto w-full ${paddingClasses[padding]} ${className}`.trim();

    return (
      <Component ref={ref} className={combinedClassName} {...props}>
        {children}
      </Component>
    );
  }
);

AppContainer.displayName = "AppContainer";
