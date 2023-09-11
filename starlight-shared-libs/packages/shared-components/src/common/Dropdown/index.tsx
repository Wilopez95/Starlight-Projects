import React from 'react';
import cx from 'classnames';

import { IBaseComponent } from '../../types/base';

import styles from './css/styles.scss';

export const Dropdown: React.FC<IBaseComponent> = ({ children, className }) => {
  return <div className={cx(styles.container, className)}>{children}</div>;
};

export * from './components';
