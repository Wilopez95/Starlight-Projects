import React from 'react';
import cx from 'classnames';

import { ISection } from './types';

import styles from './css/styles.scss';

export const Section: React.FC<ISection> = ({
  children,
  className,
  borderless,
  dashed,
  direction = 'column',
}) => (
  <div
    className={cx({ [styles.section]: !borderless }) ?? className}
    style={{
      flexDirection: direction,
      borderStyle: borderless ? undefined : dashed ? 'dashed' : 'solid',
    }}
  >
    {children}
  </div>
);
