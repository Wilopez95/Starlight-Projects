import React from 'react';
import { Checkbox } from '@starlightpro/shared-components';

import baseStyles from '@root/css/base.scss';

import { TableCell } from '../TableCell';
import { TableHeaderCell } from '../TableHeaderCell';

import { ITableCheckboxCell } from './types';

import styles from './css/styles.scss';

export const TableCheckboxCell: React.FC<ITableCheckboxCell> = ({
  value,
  name,
  onChange,
  indeterminate,
  header,
  disabled,
  label,
  ...cellProps
}) => {
  const CellTag = header ? TableHeaderCell : TableCell;

  return (
    <CellTag width={40} {...cellProps}>
      <Checkbox
        name={name}
        onChange={onChange}
        value={value}
        disabled={disabled}
        labelClass={styles.checkbox}
        indeterminate={indeterminate}
      >
        {label ? <span className={baseStyles.visuallyHidden}>{label}</span> : null}
      </Checkbox>
    </CellTag>
  );
};
