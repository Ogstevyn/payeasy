import { Variants, Transition } from 'framer-motion';

/**
 * Standard transitions for consistency across the app
 */
const defaultTransition: Transition = {
  duration: 0.5,
  ease: [0.25, 0.1, 0.25, 1], // Smooth cubic-bezier
};

const springTransition: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 20,
};

// 1. Fade Animations
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (custom?: number) => ({
    opacity: 1,
    transition: { ...defaultTransition, duration: custom ?? 0.5 },
  }),
};

// 2. Slide Animations (Up, Down, Left, Right)
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springTransition,
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: springTransition,
  },
};

// 3. Scale & Bounce Effects
export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springTransition,
  },
};

// 4. Stagger Animations (Orchestration)
// Use this on the Parent container to delay children appearing one by one
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// 5. Entrance / Hover Utility (For Cards/Buttons)
export const hoverScale: Variants = {
  hover: {
    scale: 1.05,
    transition: { duration: 0.2, ease: 'easeInOut' },
  },
  tap: { scale: 0.95 },
};