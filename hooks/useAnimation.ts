import { useAnimation, useInView, VariantLabels, AnimationControls } from 'framer-motion';
import { useEffect, useRef, MutableRefObject } from 'react';

interface ScrollRevealReturn {
  ref: MutableRefObject<any>;
  controls: AnimationControls;
}

/**
 * Hook to trigger Framer Motion animations when element enters viewport
 * @param threshold - Percentage of element visible before triggering (0 to 1)
 * @param once - If true, animation only happens the first time it enters view
 */
export const useScrollReveal = (
  threshold: number = 0.1,
  once: boolean = true
): ScrollRevealReturn => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: threshold, once });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    } else if (!once) {
      controls.start('hidden');
    }
  }, [controls, isInView, once]);

  return { ref, controls };
};