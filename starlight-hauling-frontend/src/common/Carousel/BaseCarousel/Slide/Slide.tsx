import React, { useCallback, useEffect, useRef } from 'react';

import { useInView } from '@hooks';

import { ISlide } from './types';

export const Slide: React.FC<ISlide> = ({ carouselRef, children, index, onUpdate }) => {
  const slideRef = useRef<HTMLDivElement | null>(null);

  const [inView, inViewRef] = useInView({
    root: carouselRef.current,
  });

  const setRefs = useCallback(
    (node: HTMLDivElement) => {
      slideRef.current = node;
      inViewRef(node);
    },
    [inViewRef],
  );

  useEffect(() => {
    onUpdate(index, inView ? slideRef.current!.offsetLeft : false);
  }, [index, inView, onUpdate]);

  return <div ref={setRefs}>{children}</div>;
};
