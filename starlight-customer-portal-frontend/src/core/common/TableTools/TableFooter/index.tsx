import React from 'react';
import cx from 'classnames';

import { ITableFooter } from './types';

import styles from './css/styles.scss';

export const TableFooter: React.FC<ITableFooter> = ({ children, className, sticky = true }) => (
  <tfoot className={cx(styles.tableFooter, { [styles.sticky]: sticky }, className)}>
    {children}
  </tfoot>
);
