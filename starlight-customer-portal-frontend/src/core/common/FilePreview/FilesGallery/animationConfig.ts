import { Transition, Variants } from 'framer-motion';

export const variants: Variants = {
  enter: (direction: 'left' | 'right') => {
    return {
      x: direction === 'right' ? 700 : -700,
      opacity: 0,
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: 'left' | 'right') => {
    return {
      zIndex: 0,
      x: direction === 'right' ? -700 : 700,
      opacity: 0,
    };
  },
};

export const transition: Transition = {
  x: { type: 'spring', stiffness: 300, damping: 200 },
  opacity: { duration: 0.4 },
};
