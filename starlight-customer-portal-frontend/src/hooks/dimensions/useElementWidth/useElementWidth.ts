import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import { getElementRectProp } from '../helpers';

import { IUseElementWidthOptions, UseElementWidthHook } from './types';

const events = ['resize', 'scroll'];

export const useElementWidth = ({
  liveUpdates = true,
}: IUseElementWidthOptions = {}): UseElementWidthHook => {
  const [width, setWidth] = useState(0);
  const [node, setNode] = useState<HTMLElement | null>(null);
  const widthRef = useRef(0);

  const handleSetRef = useCallback((nodeHTML: HTMLElement | null) => {
    setNode(nodeHTML);
  }, []);

  useLayoutEffect(() => {
    if (!node) {
      return;
    }

    const sizeUpdateCallback = () =>
      window.requestAnimationFrame(() => {
        const maybeNewWidth = getElementRectProp(node, 'width');

        if (maybeNewWidth !== widthRef.current) {
          widthRef.current = maybeNewWidth;
          setWidth(maybeNewWidth);
        }
      });

    sizeUpdateCallback();

    if (liveUpdates) {
      const listeners = events.map(event => {
        window.addEventListener(event, sizeUpdateCallback);

        return () => window.removeEventListener(event, sizeUpdateCallback);
      });

      return () => {
        listeners.forEach(unsubscribe => unsubscribe());
      };
    }
  }, [liveUpdates, node]);

  return [handleSetRef, width];
};
