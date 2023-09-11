import React from 'react';
import cx from 'classnames';

import { TableCell } from '../TableCell';

import { ITableHeadCell } from './types';

import styles from './css/styles.scss';

export const TableHeadCell: React.FC<ITableHeadCell> = ({ children, className, ...props }) => (
  <TableCell {...props} tag="th" className={cx(styles.noSelect, className)} fallback="">
    {children}
  </TableCell>
);
