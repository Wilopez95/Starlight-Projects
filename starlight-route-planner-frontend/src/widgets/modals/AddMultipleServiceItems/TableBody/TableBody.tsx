import React from 'react';

import { TableBody as BaseTableBody } from '@root/common/TableTools';

import { TableTitle } from '../styles';
import { IServiceItemsDataTable } from '../types';

import { TableRow } from './TableRow';

interface ITableBody {
  serviceItems: IServiceItemsDataTable[];
  selectedRows: number[];
  disabled?: boolean;
  title?: string;
  toggleCheckbox(id: number): void;
}

export const TableBody: React.FC<ITableBody> = ({
  selectedRows,
  serviceItems,
  disabled,
  title,
  toggleCheckbox,
}) => {
  return (
    <BaseTableBody loading={false} cells={7}>
      {title && (
        <tr>
          <td>
            <TableTitle variant="caption" textTransform="uppercase" color="secondary" shade="light">
              {title}
            </TableTitle>
          </td>
        </tr>
      )}
      {serviceItems.map(serviceItem => (
        <TableRow
          key={serviceItem.id}
          serviceItem={serviceItem}
          isSelected={disabled ? false : selectedRows.includes(serviceItem.id)}
          disabled={disabled}
          toggleCheckbox={toggleCheckbox}
        />
      ))}
    </BaseTableBody>
  );
};
