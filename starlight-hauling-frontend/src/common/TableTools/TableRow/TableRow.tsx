import React from 'react';
import cx from 'classnames';

import { handleEnterOrSpaceKeyDown } from '@root/helpers';

import { ITableRow } from './types';

import styles from './css/styles.scss';

export const TableRow: React.FC<ITableRow> = ({
  onClick,
  children,
  className,
  selected = false,
  ...baseTableRowProps
}) => {
  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLOrSVGElement> | React.MouseEvent<HTMLTableRowElement, MouseEvent>,
  ) => {
    if (handleEnterOrSpaceKeyDown(e as React.KeyboardEvent<HTMLOrSVGElement>)) {
      if (onClick) {
        onClick(e as React.MouseEvent<HTMLTableRowElement, MouseEvent>);
      }
    }
  };

  return (
    <tr
      tabIndex={0}
      onKeyUp={handleKeyPress}
      className={cx(styles.row, { [styles.selected]: selected }, className)}
      onClick={onClick}
      {...baseTableRowProps}
    >
      {children}
    </tr>
  );
};
