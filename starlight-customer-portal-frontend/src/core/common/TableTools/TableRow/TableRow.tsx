import React from 'react';
import cx from 'classnames';

import { ITableRow } from './types';

import styles from './css/styles.scss';

export const TableRow: React.FC<ITableRow> = ({
  onClick,
  children,
  className,
  selected = false,
}) => {
  return (
    <tr className={cx(styles.row, { [styles.selected]: selected }, className)} onClick={onClick}>
      {children}
    </tr>
  );
};
