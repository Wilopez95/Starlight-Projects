import { QuickViewSize } from './types';

export const getOffsets = (refs: HTMLElement[] = []) =>
  refs.reduce((prev, cur) => prev + cur.offsetHeight, 0);

// 20 - it is right padding
export const getWidth = (element: HTMLElement | null, size: QuickViewSize) => {
  const offsetWidth = element?.offsetWidth ?? 0;

  switch (size) {
    case 'full':
      return offsetWidth + 20;
    case 'three-quarters':
      return offsetWidth * 0.75 + 20;
    case 'half':
      return offsetWidth * 0.5 + 20;
    case 'moderate':
      return 550;
    default:
      return 420;
  }
};
