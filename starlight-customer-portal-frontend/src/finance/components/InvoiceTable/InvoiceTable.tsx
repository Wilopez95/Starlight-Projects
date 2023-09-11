import React from 'react';
import { Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import {
  Table,
  TableBody,
  TableCell,
  TableCheckboxCell,
  TableRow,
} from '@root/core/common/TableTools';
import { hasDataAttribute, isModal } from '@root/core/helpers';
import { useStores } from '@root/core/hooks';
import { useIntl } from '@root/core/i18n/useIntl';
import { getBadgeByStatus } from '@root/finance/components/InvoiceTable/helpers';
import InvoiceTableHeader from '@root/finance/components/InvoiceTable/InvoiceTableHeader/InvoiceTableHeader';
import { IInvoiceTable } from '@root/finance/components/InvoiceTable/types';

import { InvoicePreview } from './InvoicePreview/InvoicePreview';

import styles from './css/styles.scss';

const InvoiceTable: React.FC<IInvoiceTable> = ({
  tableBodyContainer,
  selectable,
  onSelect,
  ...tableHeaderProps
}) => {
  const { invoiceStore } = useStores();
  const { formatCurrency, formatDateTime } = useIntl();

  let cellsAmount = 7;

  if (selectable) {
    cellsAmount = cellsAmount + 1;
  }

  return (
    <Table>
      <InvoiceTableHeader selectable={selectable} {...tableHeaderProps} />
      <TableBody
        loading={invoiceStore.loading}
        cells={cellsAmount}
        ref={tableBodyContainer}
        noResult={invoiceStore.noResult}
      >
        {invoiceStore.values.map((invoice) => (
          <TableRow
            selected={invoice.id === invoiceStore.selectedEntity?.id}
            key={invoice.id}
            onClick={(e) => {
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
            {selectable && (
              <TableCheckboxCell
                name={`invoice-${invoice.id}`}
                onChange={invoice.check}
                value={invoice.checked}
              />
            )}

            <TableCell>
              <Typography>{formatDateTime(invoice.createdAt).date}</Typography>
            </TableCell>
            <TableCell>
              <Typography>{invoice.id}</Typography>
            </TableCell>
            <TableCell>
              <Typography>{getBadgeByStatus(invoice.status)}</Typography>
            </TableCell>
            <TableCell>
              <Typography>{invoice.dueDate && formatDateTime(invoice.dueDate).date}</Typography>
            </TableCell>
            <TableCell>
              <Typography>{invoice?.businessLines?.map((val) => val.name).join(', ')}</Typography>
            </TableCell>
            <TableCell fallback='' className={styles.previewCell}>
              {invoice.pdfUrl && <InvoicePreview invoice={invoice} showSendEmail={false} />}
            </TableCell>
            <TableCell right>
              <Typography fontWeight='bold'>{formatCurrency(invoice.total)}</Typography>
            </TableCell>
            <TableCell right>
              <Typography fontWeight='bold'>{formatCurrency(invoice.balance)}</Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default observer(InvoiceTable);
