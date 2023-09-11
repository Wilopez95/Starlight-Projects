import { Variants } from 'framer-motion';

export const quickViewVariants: Variants = {
  close: {
    x: '100%',
    transition: {
      bounceDamping: 0,
      duration: 0.3,
    },
  },
  open: {
    x: 0,
    transition: {
      bounceDamping: 0,
      duration: 0.3,
    },
  },
};

export const backgroundVariants: Variants = {
  close: {
    opacity: 0,
    transition: {
      bounceDamping: 0,
      duration: 0.3,
    },
  },
  open: {
    opacity: 0.3,
    transition: {
      bounceDamping: 0,
      duration: 0.3,
    },
  },
};
