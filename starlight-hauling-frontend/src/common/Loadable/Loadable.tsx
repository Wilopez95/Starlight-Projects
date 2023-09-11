import React from 'react';
import cx from 'classnames';

import { ILoadable } from './types';

import styles from './css/styles.scss';

export const Loadable: React.FC<ILoadable> = ({
  className,
  height = '16px',
  width = '100%',
  tag: Tag = 'span',
}) => (
  <Tag
    className={cx(styles.skeleton, className)}
    style={{
      width,
      height,
    }}
  />
);
