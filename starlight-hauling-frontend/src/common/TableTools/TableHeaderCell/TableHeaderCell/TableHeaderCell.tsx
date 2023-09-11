import React from 'react';

import { Typography } from '@root/common/Typography/Typography';

import { ITableHeaderCell } from '../types';

import * as Styles from './styles';

export const TableHeaderCell: React.FC<ITableHeaderCell> = ({
  children,
  titleClassName,
  ...props
}) => {
  return (
    <Styles.StyledTableHeaderCell {...props} tag="th" fallback="">
      <Typography variant="bodyMedium" color="secondary" shade="light" className={titleClassName}>
        {children}
      </Typography>
    </Styles.StyledTableHeaderCell>
  );
};
