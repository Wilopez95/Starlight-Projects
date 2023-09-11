import React from 'react';
import { useTranslation } from 'react-i18next';

import { TableTools } from '@root/common/TableTools';
import { useStores } from '@root/hooks';

import { ILandfillOperationsTableHeader } from './types';

const I18N_PATH = 'pages.LandfillOperations.table.Text.';

export const LandfillOperationsTableHeader: React.FC<ILandfillOperationsTableHeader> = ({
  onSort,
}) => {
  const { landfillOperationStore } = useStores();
  const { t } = useTranslation();

  return (
    <TableTools.Header>
      <TableTools.SortableHeaderCell store={landfillOperationStore} sortKey="id" onSort={onSort}>
        {t(`${I18N_PATH}ID`)}
      </TableTools.SortableHeaderCell>

      <TableTools.SortableHeaderCell store={landfillOperationStore} sortKey="date" onSort={onSort}>
        {t(`${I18N_PATH}Date`)}
      </TableTools.SortableHeaderCell>

      <TableTools.SortableHeaderCell
        store={landfillOperationStore}
        sortKey="facility"
        onSort={onSort}
      >
        {t(`${I18N_PATH}Facility`)}
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell
        store={landfillOperationStore}
        sortKey="ticket"
        onSort={onSort}
      >
        {t(`${I18N_PATH}Ticket`)}
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell
        store={landfillOperationStore}
        sortKey="customer"
        onSort={onSort}
      >
        {t(`${I18N_PATH}Customer`)}
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell store={landfillOperationStore} sortKey="order" onSort={onSort}>
        {t(`${I18N_PATH}Order`)}
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell
        store={landfillOperationStore}
        sortKey="woNumber"
        onSort={onSort}
      >
        {t(`${I18N_PATH}WO`)}
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell store={landfillOperationStore} sortKey="truck" onSort={onSort}>
        {t(`${I18N_PATH}Truck`)}
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell
        store={landfillOperationStore}
        sortKey="timeIn"
        onSort={onSort}
      >
        {t(`${I18N_PATH}TimeIn`)}
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell
        store={landfillOperationStore}
        sortKey="timeOut"
        onSort={onSort}
      >
        {t(`${I18N_PATH}TimeOut`)}
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell
        store={landfillOperationStore}
        sortKey="netWeight"
        onSort={onSort}
        right
      >
        {t(`${I18N_PATH}NetWeight`)}
      </TableTools.SortableHeaderCell>
    </TableTools.Header>
  );
};
