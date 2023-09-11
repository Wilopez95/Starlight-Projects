import React from 'react';
import cx from 'classnames';

import { IBaseComponent } from '@root/core/types';

import styles from './css/styles.scss';

export const Panel: React.FC<IBaseComponent> = ({ className, children }) => (
  <section className={cx(styles.container, className)}>{children}</section>
);
