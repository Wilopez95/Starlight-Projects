import { Variants } from 'framer-motion';

export const animationConfig: Variants = {
  open: {
    scaleY: 1,
    opacity: 1,
    zIndex: 20,
    y: 0,
  },
  close: {
    opacity: 0,
    zIndex: -1,
    scaleY: 0,
    y: -25,
  },
};
