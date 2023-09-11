import React from 'react';
import cx from 'classnames';

import { ITableHeader } from './types';

import styles from './css/styles.scss';

export const TableHeader: React.FC<ITableHeader> = ({ children, className, sticky = true }) => (
  <thead className={cx(styles.tableHead, { [styles.sticky]: sticky }, className)}>
    <tr>{children}</tr>
  </thead>
);
