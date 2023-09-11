import React from 'react';

import { IBaseComponent } from '@root/core/types';

import { TableCell } from '../TableCell';
import { TableRow } from '../TableRow/TableRow';

import styles from './css/styles.scss';

export const TableRowNoResult: React.FC<IBaseComponent> = ({
  className,
  children = 'No results',
}) => (
  <TableRow className={className}>
    <TableCell titleClassName={styles.title} colSpan={20}>
      {children}
    </TableCell>
  </TableRow>
);
