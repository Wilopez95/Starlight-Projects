import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import cx from 'classnames';
import { findLastIndex } from 'lodash-es';

import { Slide } from './Slide/Slide';
import { type IBaseCarousel, type IBaseCarouselHandle } from './types';

import styles from './css/styles.scss';

const BaseCarouselComponent: React.ForwardRefRenderFunction<IBaseCarouselHandle, IBaseCarousel> = (
  { children, className },
  ref,
) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const slides = useRef<Array<false | number>>([]);

  const handleUpdate = useCallback((index: number, visible: false | number) => {
    slides.current[index] = visible;
  }, []);

  const handleNext = useCallback(() => {
    const currentSlides = slides.current;

    if (currentSlides.length === 0 || typeof currentSlides[currentSlides.length - 1] === 'number') {
      return;
    }

    const lastSlideIndex = findLastIndex(currentSlides, slide => typeof slide === 'number');

    const lastSlide = currentSlides[lastSlideIndex - 1] || 0;

    const goingToHitEnd =
      carouselRef.current!.scrollWidth - lastSlide < carouselRef.current!.offsetWidth;

    const newPosition = goingToHitEnd
      ? carouselRef.current!.scrollWidth - carouselRef.current!.offsetWidth
      : Math.ceil(lastSlide);

    carouselRef.current?.scrollTo({
      left: newPosition,
      behavior: 'smooth',
    });
  }, []);

  const handlePrev = useCallback(() => {
    const currentSlides = slides.current;

    if (currentSlides.length === 0 || typeof currentSlides[0] === 'number') {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const firstSlide = currentSlides.find(slide => typeof slide === 'number') || 0;

    let shift = firstSlide - carouselRef.current!.offsetWidth;

    shift = shift < 0 ? 0 : shift;

    carouselRef.current?.scrollTo({
      left: Math.ceil(shift),
      behavior: 'smooth',
    });
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
    return React.Children.map(children, (child, index) => (
      <Slide key={index} carouselRef={carouselRef} index={index} onUpdate={handleUpdate}>
        {child}
      </Slide>
    ));
  }, [children, handleUpdate]);

  return (
    <div ref={carouselRef} className={cx(styles.container, className)}>
      <div className={styles.wrapper}>{mappedChildren}</div>
    </div>
  );
};

export const BaseCarousel = forwardRef(BaseCarouselComponent);
export { type IBaseCarouselHandle } from './types';
