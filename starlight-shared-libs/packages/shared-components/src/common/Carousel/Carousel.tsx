import React, { useCallback, useRef } from 'react';
import cx from 'classnames';
import { noop } from 'lodash-es';

import { ArrowIcon } from '../../assets';

import { BaseCarousel, IBaseCarouselHandle } from './BaseCarousel/BaseCarousel';
import { ICarousel } from './types';

import styles from './css/styles.scss';

export const Carousel: React.FC<ICarousel> = ({ children }) => {
  const carouselRef = useRef<IBaseCarouselHandle>({
    next: noop,
    prev: noop,
  });

  const handleNext = useCallback(() => {
    carouselRef.current.next();
  }, []);

  const handlePrev = useCallback(() => {
    carouselRef.current.prev();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.arrowContainer} onClick={handlePrev}>
        <ArrowIcon />
      </div>
      <BaseCarousel ref={carouselRef}>{children}</BaseCarousel>
      <div className={cx(styles.arrowContainer, styles.right)} onClick={handleNext}>
        <ArrowIcon />
      </div>
    </div>
  );
};
