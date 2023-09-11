import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import {
  TableCheckboxCell,
  TableHeadCell,
  TableHeader,
  TableSortableHeadCell,
} from '@root/core/common/TableTools';
import { useStores } from '@root/core/hooks';
import { SortType } from '@root/core/types';
import { InvoiceSortType } from '@root/finance/stores/invoice/types';

import { IInvoiceTableHeader } from './types';

const InvoiceTableHeader: React.FC<IInvoiceTableHeader> = ({
  selectable,
  tableScrollContainer,
  onSort,
}) => {
  const { invoiceStore } = useStores();
  const { t } = useTranslation();
  const I18N_PATH = 'modules.finance.components.InvoiceTableHeader.';

  const handleCheckAll = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      invoiceStore.checkAll(e.target.checked);
    },
    [invoiceStore],
  );

  const handleChangeSort = useCallback(
    (sortBy: InvoiceSortType, sortOrder: SortType) => {
      invoiceStore.setSort(sortBy, sortOrder);
      onSort();
    },
    [invoiceStore, onSort],
  );

  const isAllChecked = invoiceStore.isAllChecked;
  const checkedInvoices = invoiceStore.checkedInvoices;
  const indeterminate = !isAllChecked && checkedInvoices.length > 0;

  return (
    <TableHeader>
      {selectable && (
        <TableCheckboxCell
          header
          name='AllInvoice'
          onChange={handleCheckAll}
          value={isAllChecked}
          indeterminate={indeterminate}
        />
      )}
      <TableSortableHeadCell
        sortKey='CREATED_AT'
        tableRef={tableScrollContainer}
        onSort={handleChangeSort}
        currentSortBy={invoiceStore.sortBy}
        sortOrder={invoiceStore.sortOrder}
      >
        <Typography variant='bodyMedium' color='secondary' shade='light'>
          {t(`${I18N_PATH}Created`)}
        </Typography>
      </TableSortableHeadCell>
      <TableSortableHeadCell
        sortKey='ID'
        tableRef={tableScrollContainer}
        onSort={handleChangeSort}
        currentSortBy={invoiceStore.sortBy}
        sortOrder={invoiceStore.sortOrder}
      >
        <Typography variant='bodyMedium' color='secondary' shade='light'>
          {t(`${I18N_PATH}InvoiceID`)}
        </Typography>
      </TableSortableHeadCell>
      <TableHeadCell>
        <Typography variant='bodyMedium' color='secondary' shade='light'>
          {t(`${I18N_PATH}Status`)}
        </Typography>
      </TableHeadCell>
      <TableSortableHeadCell
        sortKey='DUE_DATE'
        tableRef={tableScrollContainer}
        onSort={handleChangeSort}
        currentSortBy={invoiceStore.sortBy}
        sortOrder={invoiceStore.sortOrder}
      >
        <Typography variant='bodyMedium' color='secondary' shade='light'>
          {t(`${I18N_PATH}DueDate`)}
        </Typography>
      </TableSortableHeadCell>
      <TableHeadCell>
        <Typography variant='bodyMedium' color='secondary' shade='light'>
          {t(`${I18N_PATH}LineOfBusiness`)}
        </Typography>
      </TableHeadCell>
      <TableHeadCell>
        <Typography variant='bodyMedium' color='secondary' shade='light'>
          {t(`${I18N_PATH}Preview`)}
        </Typography>
      </TableHeadCell>
      <TableSortableHeadCell
        sortKey='TOTAL'
        tableRef={tableScrollContainer}
        onSort={handleChangeSort}
        currentSortBy={invoiceStore.sortBy}
        sortOrder={invoiceStore.sortOrder}
        right
      >
        <Typography variant='bodyMedium' color='secondary' shade='light'>
          {t(`${I18N_PATH}Total`)}, $
        </Typography>
      </TableSortableHeadCell>
      <TableSortableHeadCell
        sortKey='BALANCE'
        tableRef={tableScrollContainer}
        onSort={handleChangeSort}
        currentSortBy={invoiceStore.sortBy}
        sortOrder={invoiceStore.sortOrder}
        right
      >
        <Typography variant='bodyMedium' color='secondary' shade='light'>
          {t(`${I18N_PATH}RemainingBalance`)}, $
        </Typography>
      </TableSortableHeadCell>
    </TableHeader>
  );
};

export default observer(InvoiceTableHeader);
