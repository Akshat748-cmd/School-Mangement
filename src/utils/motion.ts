/**
 * Reusable Motion Animation Presets & Constants (Framer Motion / motion/react)
 * Single source of truth for all animation timing, easings, viewports, and spring dynamics.
 */

import { Variants } from "motion/react";

// Reusable Motion Constants
export const MotionDuration = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.4,
  slow: 0.6,
  counter: 1.2,
} as const;

export const MotionEase = {
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
  inOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
} as const;

export const MotionSpring = {
  subtle: {
    type: "spring" as const,
    stiffness: 300,
    damping: 25,
  },
  gentle: {
    type: "spring" as const,
    stiffness: 200,
    damping: 20,
  },
  scrollProgress: {
    stiffness: 400,
    damping: 40,
    restDelta: 0.001,
  },
  magnetic: {
    stiffness: 250,
    damping: 15,
    mass: 0.1,
  },
  tilt: {
    stiffness: 300,
    damping: 20,
  },
} as const;

export const MotionViewport = {
  standard: { once: true, margin: "-80px" },
  card: { once: true, margin: "-50px" },
  immediate: { once: true, margin: "-10px" },
} as const;

export const MotionDelay = {
  none: 0,
  stagger: 0.12,
  staggerFast: 0.06,
  initial: 0.1,
} as const;

// Transition presets built from constants
export const transitionEaseOut = {
  duration: MotionDuration.normal,
  ease: MotionEase.out,
};

export const transitionSpringSubtle = MotionSpring.subtle;

// Section Entrance Variants (Staggered Children Container)
export const sectionContainerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MotionDuration.slow,
      ease: MotionEase.out,
      staggerChildren: MotionDelay.stagger,
    },
  },
};

// Child Motion Variant
export const childItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MotionDuration.normal,
      ease: MotionEase.out,
    },
  },
};

// Unified Modal Motion Variants
export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: MotionDuration.fast } },
  exit: { opacity: 0, transition: { duration: MotionDuration.fast } },
};

export const modalContentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 18 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: MotionDuration.fast, ease: MotionEase.out },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 18,
    transition: { duration: MotionDuration.fast, ease: MotionEase.out },
  },
};

// Fade In Motion Generator
export const fadeInVariants = (
  direction: "up" | "down" | "left" | "right" | "none" = "up",
  delay: number = MotionDelay.none,
  duration: number = MotionDuration.normal
): Variants => {
  const xOffset = direction === "left" ? 24 : direction === "right" ? -24 : 0;
  const yOffset = direction === "up" ? 24 : direction === "down" ? -24 : 0;

  return {
    hidden: { opacity: 0, x: xOffset, y: yOffset },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        delay,
        ease: MotionEase.out,
      },
    },
  };
};

// Card Hover Motion Presets
export const cardHoverProps = {
  whileHover: {
    y: -4,
    scale: 1.01,
    transition: { duration: MotionDuration.fast, ease: MotionEase.out },
  },
  whileTap: {
    scale: 0.99,
    transition: { duration: MotionDuration.instant, ease: MotionEase.out },
  },
};

// Button Press Motion Presets
export const buttonPressProps = {
  whileHover: {
    scale: 1.02,
    transition: { duration: MotionDuration.fast, ease: MotionEase.out },
  },
  whileTap: {
    scale: 0.97,
    transition: { duration: MotionDuration.instant, ease: MotionEase.out },
  },
};

