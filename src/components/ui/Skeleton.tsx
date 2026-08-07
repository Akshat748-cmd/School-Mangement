import React from "react";
import { motion } from "motion/react";

interface SkeletonBlockProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
}

export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  className = "",
  width,
  height,
  borderRadius = "rounded-lg",
}) => {
  return (
    <div
      style={{ width, height }}
      className={`relative overflow-hidden bg-slate-200/80 ${borderRadius} ${className}`}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
        animate={{ translateX: ["-100%", "100%"] }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};
