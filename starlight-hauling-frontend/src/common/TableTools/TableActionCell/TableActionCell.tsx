import React from 'react';
import { Checkbox } from '@starlightpro/shared-components';
import cx from 'classnames';

import { RadioButton } from '../../RadioButton/RadioButton';
import { TableCell } from '../TableCell';
import { TableHeaderCell } from '../TableHeaderCell';

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
  const CellTag = header ? TableHeaderCell : TableCell;

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
