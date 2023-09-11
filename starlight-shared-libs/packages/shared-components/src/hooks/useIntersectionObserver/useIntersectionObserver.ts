import { useEffect, useRef } from 'react';

import type { Instance, IntersectionObserverCB } from './types';

const defaultOptions = {
  rootMargin: '500px 0px 0px 0px',
};

export const useIntersectionObserver = (
  element: HTMLElement | null,
  callback: IntersectionObserverCB,
  options: IntersectionObserverInit = defaultOptions,
): Instance => {
  const instanceRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver !== 'undefined' && element !== null) {
      const observer = new IntersectionObserver(([element]) => {
        callback(element);
      }, options);

      observer.observe(element);
      instanceRef.current = observer;
    } else {
      instanceRef.current = null;
    }

    return () => {
      if (instanceRef.current) {
        instanceRef.current.disconnect();
      }
    };
  }, [callback, element, options]);

  return instanceRef.current;
};
