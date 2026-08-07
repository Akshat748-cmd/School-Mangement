import React from "react";
import { motion, useScroll, useSpring, useReducedMotion } from "motion/react";
import { MotionSpring } from "../../utils/motion";

export const ScrollProgressBar: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, MotionSpring.scrollProgress);

  if (prefersReducedMotion) return null;

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 z-[300] h-[3px] bg-brass-gold origin-left pointer-events-none shadow-[0_0_8px_rgba(201,162,39,0.6)]"
      aria-hidden="true"
    />
  );
};
