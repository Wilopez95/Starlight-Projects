import React from 'react';
import cx from 'classnames';

import { IBaseComponent } from '@root/core/types';

import styles from './css/styles.scss';

export const Subitem: React.FC<IBaseComponent> = ({ className, children }) => (
  <div className={cx(styles.subItem, className)}>{children}</div>
);
