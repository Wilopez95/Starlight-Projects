import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

import { useIntl } from '@root/i18n/useIntl';

import { TableCheckboxCell, TableTools } from '../../../../../../common/TableTools';
import { useStores } from '../../../../../../hooks';

import { IInvoiceTableHeader } from './types';

const i18nPath = 'pages.Invoices.Text.';

const InvoiceTableHeader: React.FC<IInvoiceTableHeader> = ({
  showCustomer,
  selectable,
  onSort,
}) => {
  const { invoiceStore } = useStores();
  const { currencySymbol } = useIntl();
  const { t } = useTranslation();

  const handleCheckAll = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      invoiceStore.checkAll(e.target.checked);
    },
    [invoiceStore],
  );

  const isAllChecked = invoiceStore.isAllChecked;
  const checkedInvoices = invoiceStore.checkedInvoices;
  const indeterminate = !isAllChecked && checkedInvoices.length > 0;

  return (
    <TableTools.Header>
      {selectable ? (
        <TableCheckboxCell
          header
          name="AllInvoice"
          onChange={handleCheckAll}
          value={isAllChecked}
          indeterminate={indeterminate}
        />
      ) : null}
      <TableTools.SortableHeaderCell sortKey="CREATED_AT" onSort={onSort} store={invoiceStore}>
        {t(`${i18nPath}Created`)}
      </TableTools.SortableHeaderCell>

      <TableTools.SortableHeaderCell sortKey="ID" onSort={onSort} store={invoiceStore}>
        {t(`${i18nPath}Invoice#`)}
      </TableTools.SortableHeaderCell>

      <TableTools.SortableHeaderCell sortKey="STATUS" onSort={onSort} store={invoiceStore}>
        {t(`${i18nPath}Status`)}
      </TableTools.SortableHeaderCell>

      <TableTools.SortableHeaderCell sortKey="DUE_DATE" onSort={onSort} store={invoiceStore}>
        {t(`${i18nPath}DueDate`)}
      </TableTools.SortableHeaderCell>

      <TableTools.HeaderCell>{t(`${i18nPath}LineOfBusiness`)}</TableTools.HeaderCell>

      {showCustomer ? (
        <>
          <TableTools.SortableHeaderCell
            sortKey="CUSTOMER_NAME"
            onSort={onSort}
            store={invoiceStore}
          >
            {t(`${i18nPath}Customer`)}
          </TableTools.SortableHeaderCell>
          <TableTools.SortableHeaderCell
            sortKey="CUSTOMER_TYPE"
            onSort={onSort}
            store={invoiceStore}
          >
            {t(`${i18nPath}CustomerType`)}
          </TableTools.SortableHeaderCell>
        </>
      ) : null}

      <TableTools.HeaderCell>{t(`${i18nPath}Preview`)}</TableTools.HeaderCell>

      <TableTools.SortableHeaderCell sortKey="TOTAL" right onSort={onSort} store={invoiceStore}>
        {t(`${i18nPath}Total`, { currencySymbol })}
      </TableTools.SortableHeaderCell>

      <TableTools.SortableHeaderCell sortKey="BALANCE" right onSort={onSort} store={invoiceStore}>
        {t(`${i18nPath}RemainingBalance`, { currencySymbol })}
      </TableTools.SortableHeaderCell>
    </TableTools.Header>
  );
};

export default observer(InvoiceTableHeader);
