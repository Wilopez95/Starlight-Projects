import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

import { useIntl } from '@root/i18n/useIntl';

import { Typography } from '../../../../../common';
import {
  Table,
  TableBody,
  TableCell,
  TableCheckboxCell,
  TableRow,
} from '../../../../../common/TableTools';
import { hasDataAttribute, isModal } from '../../../../../helpers';
import { useStores } from '../../../../../hooks';
import { getBadgeByStatus } from '../../helpers/getBadgeByStatus';

import { InvoicePreview } from './InvoicePreview/InvoicePreview';
import InvoiceTableHeader from './InvoiceTableHeader/InvoiceTableHeader';
import { IInvoiceTable } from './types';

import styles from './css/styles.scss';

const InvoiceTable: React.FC<IInvoiceTable> = ({
  showCustomer,
  tableBodyContainer,
  selectable,
  onSelect,
  onSort,
}) => {
  const { invoiceStore, customerStore } = useStores();
  const customer = customerStore.selectedEntity;
  const { formatCurrency, formatDateTime } = useIntl();
  const { t } = useTranslation();

  let cellsAmount = showCustomer ? 9 : 7;

  if (selectable) {
    cellsAmount = cellsAmount + 1;
  }

  return (
    <Table className={styles.table}>
      <Helmet title={t('Titles.CustomerInvoices', { customerName: customer?.name ?? '' })} />
      <InvoiceTableHeader showCustomer={showCustomer} selectable={selectable} onSort={onSort} />
      <TableBody
        loading={invoiceStore.loading}
        cells={cellsAmount}
        ref={tableBodyContainer}
        noResult={invoiceStore.noResult}
      >
        {invoiceStore.values.map(invoice => (
          <TableRow
            selected={invoice.id === invoiceStore.selectedEntity?.id}
            key={invoice.id}
            onClick={e => {
              if (hasDataAttribute(e, 'skipEvent') || isModal(e)) {
                return;
              }

              if (onSelect) {
                onSelect(invoice);
              } else {
                invoiceStore.selectEntity(invoice);
              }
            }}
          >
            {selectable ? (
              <TableCheckboxCell
                name={`invoice-${invoice.id}`}
                onChange={invoice.check}
                value={invoice.checked}
              />
            ) : null}

            <TableCell>
              <Typography>{formatDateTime(invoice.createdAt as Date).date}</Typography>
            </TableCell>
            <TableCell>
              <Typography>{invoice.id}</Typography>
            </TableCell>
            <TableCell>
              <Typography>{getBadgeByStatus(invoice.status)}</Typography>
            </TableCell>
            <TableCell>
              <Typography>
                {invoice.dueDate ? formatDateTime(invoice.dueDate).date : null}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography>{invoice.businessLines.map(val => val.shortName).join(', ')}</Typography>
            </TableCell>
            <TableCell>
              <Typography>{invoice.businessLines.map(val => val.shortName).join(', ')}</Typography>
            </TableCell>
            {showCustomer ? (
              <>
                <TableCell>
                  <Typography>{invoice.customer?.name}</Typography>
                </TableCell>
                <TableCell>
                  <Typography>{invoice.customer?.onAccount ? 'On Account' : 'Prepaid'}</Typography>
                </TableCell>
              </>
            ) : null}
            <TableCell fallback="" className={styles.previewCell}>
              {invoice.pdfUrl ? <InvoicePreview invoice={invoice} /> : null}
            </TableCell>

            <TableCell right>
              <Typography fontWeight="bold">{formatCurrency(invoice.total)}</Typography>
            </TableCell>
            <TableCell right>
              <Typography fontWeight="bold">{formatCurrency(invoice.balance)}</Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default observer(InvoiceTable);
