import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import cx from 'classnames';

import { IBaseCarousel, IBaseCarouselHandle } from './types';

import styles from './css/styles.scss';

const BaseCarouselComponent: React.ForwardRefRenderFunction<IBaseCarouselHandle, IBaseCarousel> = (
  { children, className },
  ref,
) => {
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleNext = useCallback(() => {
    const offsetWidth = carouselRef.current?.offsetWidth ?? 0;
    const scrollLeft = carouselRef.current?.scrollLeft ?? 0;

    carouselRef.current?.scroll({ left: scrollLeft + offsetWidth, behavior: 'smooth' });
  }, []);

  const handlePrev = useCallback(() => {
    const offsetWidth = carouselRef.current?.offsetWidth ?? 0;
    const scrollLeft = carouselRef.current?.scrollLeft ?? 0;

    carouselRef.current?.scroll({ left: scrollLeft - offsetWidth, behavior: 'smooth' });
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      next: handleNext,
      prev: handlePrev,
    }),
    [handleNext, handlePrev],
  );

  const mappedChildren = useMemo(() => {
    return React.Children.map(children, (child, index) => <div key={index}>{child}</div>);
  }, [children]);

  return (
    <div ref={carouselRef} className={cx(styles.container, className)}>
      <div className={styles.wrapper}>{mappedChildren}</div>
    </div>
  );
};

export const BaseCarousel = forwardRef(BaseCarouselComponent);
export { IBaseCarouselHandle } from './types';
