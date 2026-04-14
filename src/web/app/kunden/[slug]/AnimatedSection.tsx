"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * AnimatedSection — wraps any section with profile-based scroll animation.
 *
 * Animation families:
 *   fade   → SUBSTANZ (slow fade-up, dignified)
 *   slide  → VERTRAUEN (slide from side, welcoming)
 *   scale  → PRAEZISION (scale-in, controlled)
 *   none   → no animation (default for backwards-compat)
 */

type AnimationFamily = "fade" | "slide" | "scale" | "none";

const VARIANTS: Record<AnimationFamily, Record<string, { opacity?: number; y?: number; x?: number; scale?: number }>> = {
  fade: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  },
  slide: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  },
  none: {
    hidden: {},
    visible: {},
  },
};

const TRANSITION: Record<AnimationFamily, object> = {
  fade: { duration: 0.7, ease: "easeOut" },
  slide: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  scale: { duration: 0.4, ease: "easeOut" },
  none: { duration: 0 },
};

export function AnimatedSection({
  children,
  animation = "none",
  className,
}: {
  children: ReactNode;
  animation?: AnimationFamily;
  className?: string;
}) {
  if (animation === "none") {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={VARIANTS[animation]}
      transition={TRANSITION[animation]}
      className={className}
    >
      {children}
    </motion.div>
  );
}
