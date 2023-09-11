import React from 'react';
import { Checkbox, Layouts, Typography } from '@starlightpro/shared-components';

import { TableCell } from '@root/common/TableTools';

import { TableRow as TableRowStyled } from '../styles';
import { IWorkOrdersDataTable } from '../types';

interface ITableRow {
  workOrder: IWorkOrdersDataTable;
  isSelected: boolean;
  disabled?: boolean;
  toggleCheckbox: (id: number) => void;
}

export const TableRow: React.FC<ITableRow> = ({
  workOrder,
  isSelected,
  disabled,
  toggleCheckbox,
}) => {
  const onCheckbox = () => {
    toggleCheckbox(workOrder.id);
  };

  return (
    <TableRowStyled>
      <TableCell>
        <Layouts.Margin right="2">
          <Checkbox name="item" disabled={disabled} value={isSelected} onChange={onCheckbox} />
        </Layouts.Margin>
        <Typography variant="bodyMedium">{workOrder.displayId}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="bodyMedium">{workOrder.serviceType}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="bodyMedium">{workOrder.materialType}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="bodyMedium">{workOrder.equipmentSize}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="bodyMedium">{workOrder.time}</Typography>
      </TableCell>
    </TableRowStyled>
  );
};
