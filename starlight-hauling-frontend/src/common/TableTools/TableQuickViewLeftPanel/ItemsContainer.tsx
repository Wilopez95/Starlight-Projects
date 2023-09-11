import React from 'react';
import cx from 'classnames';

import { IBaseComponent } from '@root/types';

import styles from './css/styles.scss';

export const ItemsContainer: React.FC<IBaseComponent> = ({ className, children }) => (
  <div className={cx(styles.itemsContainer, className)}>{children}</div>
);
