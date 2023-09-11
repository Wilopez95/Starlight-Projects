import { useCallback, useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export const useScrollHeight = (ref: React.MutableRefObject<HTMLDivElement | null>) => {
  const [scrollContainerHeight, setScrollContainerHeight] = useState(0);

  const resizeCallback = useCallback(() => {
    const scrollDOM = ref.current?.getBoundingClientRect();
    const scrollHeight = document.body.clientHeight - (scrollDOM?.top ?? 0);

    setScrollContainerHeight(scrollHeight);
  }, [ref]);

  const debounceCallback = useDebouncedCallback(resizeCallback, 16);

  useEffect(() => {
    window.addEventListener('resize', debounceCallback);
    resizeCallback();

    return () => {
      window.removeEventListener('resize', debounceCallback);
    };
  }, [debounceCallback, resizeCallback]);

  return scrollContainerHeight;
};
