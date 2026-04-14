"use client";

import { motion, type Variants } from "framer-motion";
import { ReactNode } from "react";

const animations: Record<string, Variants> = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  fadeInUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  fadeInDown: {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0 },
  },
  fadeInLeft: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  fadeInRight: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  zoomIn: {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1 },
  },
};

export function MotionDiv({
  animation = "fadeIn",
  delay = 0,
  duration = 0.5,
  className = "",
  children,
}: {
  animation?: keyof typeof animations;
  delay?: number;
  duration?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      variants={animations[animation]}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggered container — wrap children in MotionChild for auto-stagger.
 */
export function MotionStagger({
  stagger = 0.1,
  delayChildren = 0,
  className = "",
  children,
}: {
  stagger?: number;
  delayChildren?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger,
            delayChildren,
          },
        },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Child element inside a MotionStagger — inherits parent's stagger timing.
 */
export function MotionChild({
  animation = "fadeInUp",
  className = "",
  children,
}: {
  animation?: keyof typeof animations;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      variants={animations[animation]}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
