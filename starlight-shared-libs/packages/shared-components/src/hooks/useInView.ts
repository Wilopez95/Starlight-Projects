import { useCallback, useRef, useState } from 'react';

import { useIntersectionObserver } from './useIntersectionObserver/useIntersectionObserver';

export const useInView = (options: IntersectionObserverInit = {}): UseInViewResult => {
  const elementRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  const handleChangeRef = useCallback((node: HTMLElement) => {
    elementRef.current = node;
    setInView(false);
  }, []);

  const handleObserve = useCallback((element: IntersectionObserverEntry) => {
    setInView(element.isIntersecting);
  }, []);

  useIntersectionObserver(elementRef.current, handleObserve, options);

  return [inView, handleChangeRef];
};

type UseInViewResult = [boolean, (node: HTMLElement) => void];
