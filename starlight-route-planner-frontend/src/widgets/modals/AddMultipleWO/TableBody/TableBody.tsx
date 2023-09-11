import React from 'react';

import { TableBody as BaseTableBody } from '@root/common/TableTools';

import { TableTitle } from '../styles';
import { TableRow } from '../TableRow';
import { IWorkOrdersDataTable } from '../types';

interface ITableBody {
  workOrders: IWorkOrdersDataTable[];
  selectedRows: number[];
  title?: string;
  disabled?: boolean;
  toggleCheckbox: (id: number) => void;
}

export const TableBody: React.FC<ITableBody> = ({
  workOrders,
  selectedRows,
  title,
  disabled,
  toggleCheckbox,
}) => {
  return (
    <BaseTableBody loading={false} cells={5}>
      {title && (
        <tr>
          <td>
            <TableTitle variant="caption" textTransform="uppercase" color="secondary" shade="light">
              {title}
            </TableTitle>
          </td>
        </tr>
      )}
      {workOrders.map(workOrder => (
        <TableRow
          key={workOrder.id}
          workOrder={workOrder}
          disabled={disabled}
          isSelected={disabled ? false : selectedRows.includes(workOrder.id)}
          toggleCheckbox={toggleCheckbox}
        />
      ))}
    </BaseTableBody>
  );
};
