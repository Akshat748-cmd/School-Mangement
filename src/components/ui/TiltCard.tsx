import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { MotionSpring } from "../../utils/motion";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glare?: boolean;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = "",
  maxTilt = 7,
  glare = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useSpring(useMotionValue(0), MotionSpring.tilt);
  const rotateY = useSpring(useMotionValue(0), MotionSpring.tilt);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const mouseX = (e.clientX - left) / width;
    const mouseY = (e.clientY - top) / height;

    x.set(mouseX);
    y.set(mouseY);

    rotateX.set((mouseY - 0.5) * -maxTilt * 2);
    rotateY.set((mouseX - 0.5) * maxTilt * 2);
  };

  const handleMouseEnter = () => {
    if (!prefersReducedMotion) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
    x.set(0.5);
    y.set(0.5);
  };

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className}`}
    >
      {children}
      {glare && isHovered && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          exit={{ opacity: 0 }}
          aria-hidden="true"
        >
          <div
            className="w-full h-full bg-gradient-to-tr from-transparent via-white to-transparent"
            style={{
              transform: `translate(${(x.get() - 0.5) * 40}%, ${(y.get() - 0.5) * 40}%)`,
            }}
          />
        </motion.div>
      )}
    </motion.div>
  );
};
