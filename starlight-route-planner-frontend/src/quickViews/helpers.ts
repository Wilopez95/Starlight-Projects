import { Variants } from 'framer-motion';

export const DEFAULT_WIDTH = 360;

export const DEFAULT_TABLE_HEADER_HEIGHT = 60;

export const getOffsets = (refs: HTMLElement[] = []) =>
  refs.reduce((prev, cur) => prev + (cur.offsetHeight ? cur.offsetHeight : 0), 0);

// At this moment this helper is used only for TableQuickView (Route Planner not used it)
// So QuickView component have static width (360px) in future this method can be added
// 3rem = 24px - it is right padding
// const ROOT_PADDING = 24;
// export const getWidth = (element: HTMLElement | null, size: QuickViewSize) => {
//   const offsetWidth = element?.offsetWidth ?? 0;

//   switch (size) {
//     case 'full':
//       return offsetWidth + ROOT_PADDING;
//     case 'three-quarters':
//       return offsetWidth * 0.75 + ROOT_PADDING;
//     case 'half':
//       return offsetWidth * 0.5 + ROOT_PADDING;
//     case 'moderate':
//       return 550;
//     default:
//       return 420;
//   }
// };

export const variants: Variants = {
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
