/**
 * AMPS School Website Design System Tokens
 * Single source of truth for design dimensions, spacing, typography scales, z-indices, and breakpoints.
 */

export const Breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export const ContainerWidth = {
  narrow: "max-w-3xl",  // 768px - Article/Form Container
  medium: "max-w-5xl",  // 1024px - Medium Section
  standard: "max-w-7xl",// 1280px - Primary Page Container
  full: "max-w-full",   // Full Bleed
} as const;

export const Spacing = {
  0: "0px",
  1: "0.25rem", // 4px
  2: "0.5rem",  // 8px
  3: "0.75rem", // 12px
  4: "1rem",    // 16px
  6: "1.5rem",  // 24px
  8: "2rem",    // 32px
  12: "3rem",   // 48px
  16: "4rem",   // 64px
  24: "6rem",   // 96px
} as const;

export const Radius = {
  none: "0px",
  sm: "4px",
  md: "8px",
  lg: "12px",
  full: "9999px",
} as const;

export const ZIndex = {
  deep: -1,
  base: 0,
  dropdown: 10,
  sticky: 40,
  header: 50,
  modalBackdrop: 60,
  modalContent: 70,
  toast: 80,
  tooltip: 90,
} as const;

export const TransitionDuration = {
  fast: "150ms",
  normal: "250ms",
  slow: "350ms",
} as const;

export const Typography = {
  fontSerif: '"Fraunces", Georgia, serif',
  fontSans: '"Work Sans", ui-sans-serif, system-ui, sans-serif',
  fontMono: '"IBM Plex Mono", ui-monospace, SFMono-Regular, monospace',

  sizes: {
    xs: "0.75rem",   // 12px
    sm: "0.875rem",  // 14px
    base: "1rem",     // 16px
    lg: "1.125rem",  // 18px
    xl: "1.25rem",   // 20px
    "2xl": "1.5rem",  // 24px
    "3xl": "1.875rem",// 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem",    // 48px
  },

  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;
