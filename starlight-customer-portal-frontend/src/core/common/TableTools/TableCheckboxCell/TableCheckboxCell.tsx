import React from 'react';
import { Checkbox } from '@starlightpro/shared-components';
import cx from 'classnames';

import { TableCell } from '../TableCell';
import { TableHeadCell } from '../TableHeadCell/TableHeadCell';

import { ITableCheckboxCell } from './types';

import styles from './css/styles.scss';

export const TableCheckboxCell: React.FC<ITableCheckboxCell> = ({
  value,
  name,
  onChange,
  className,
  indeterminate,
  titleClassName,
  header,
  disabled,
  ...cellProps
}) => {
  const CellTag = header ? TableHeadCell : TableCell;

  return (
    <CellTag
      tag={header ? 'th' : 'td'}
      titleClassName={cx(titleClassName, styles.checkboxCellWrapper)}
      className={cx(className, styles.checkboxCell)}
      {...cellProps}
    >
      <Checkbox
        name={name}
        onChange={onChange}
        value={value}
        disabled={disabled}
        labelClass={styles.checkbox}
        indeterminate={indeterminate}
      />
    </CellTag>
  );
};
