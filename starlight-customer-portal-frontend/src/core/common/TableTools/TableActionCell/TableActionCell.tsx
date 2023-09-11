import React from 'react';
import { Checkbox, RadioButton } from '@starlightpro/shared-components';
import cx from 'classnames';

import { TableCell } from '../TableCell';
import { TableHeadCell } from '../TableHeadCell/TableHeadCell';

import { ITableActionCell } from './types';

import styles from './css/styles.scss';

export const TableActionCell: React.FC<ITableActionCell> = ({
  value,
  name,
  onChange,
  className,
  indeterminate,
  titleClassName,
  header,
  disabled,
  action = 'checkbox',
  ...cellProps
}) => {
  const CellTag = header ? TableHeadCell : TableCell;

  const InputComponent = action === 'checkbox' ? Checkbox : RadioButton;

  return (
    <CellTag
      tag={header ? 'th' : 'td'}
      titleClassName={cx(titleClassName, styles.checkboxCellWrapper)}
      className={cx(className, styles.checkboxCell)}
      {...cellProps}
    >
      <InputComponent
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
