import React from 'react';
import { Checkbox, Layouts, Typography } from '@starlightpro/shared-components';

import { DaysStatusPreview } from '@root/common';
import { TableCell } from '@root/common/TableTools';

import { TableRow as TableRowStyled } from '../styles';
import { IServiceItemsDataTable } from '../types';

interface IProps {
  isSelected: boolean;
  serviceItem: IServiceItemsDataTable;
  disabled?: boolean;
  toggleCheckbox(id: number): void;
}

export const TableRow: React.FC<IProps> = ({
  serviceItem,
  isSelected,
  disabled,
  toggleCheckbox,
}) => {
  const handleCheckbox = () => {
    toggleCheckbox(serviceItem.id);
  };

  return (
    <TableRowStyled key={serviceItem.id}>
      <TableCell>
        <Layouts.Margin right="2">
          <Checkbox name="item" disabled={disabled} value={isSelected} onChange={handleCheckbox} />
        </Layouts.Margin>
        <Typography variant="bodyMedium">{serviceItem.id}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="bodyMedium">{serviceItem.serviceType}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="bodyMedium">{serviceItem.materialType}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="bodyMedium">{serviceItem.equipmentSize}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="bodyMedium">{serviceItem.frequency}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="bodyMedium">
          <DaysStatusPreview serviceDaysOfWeek={serviceItem.serviceDaysOfWeek} />
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="bodyMedium">{serviceItem.time}</Typography>
      </TableCell>
    </TableRowStyled>
  );
};
