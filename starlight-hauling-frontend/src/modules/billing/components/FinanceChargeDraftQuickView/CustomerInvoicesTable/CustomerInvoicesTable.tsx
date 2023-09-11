import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { differenceInCalendarDays, format } from 'date-fns';

import { substituteLocalTimeZoneInsteadUTC } from '@root/helpers';
import { useIntl } from '@root/i18n/useIntl';
import { IInvoice } from '@root/modules/billing/types';

import { FilePreviewModal, Typography } from '../../../../../common';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableTools,
} from '../../../../../common/TableTools';
import { useBoolean } from '../../../../../hooks';

import { ICustomerInvoicesTable } from './types';

const I18N_PATH = 'quickViews.FinanceChargeDraftQuickView.CustomerInvoicesTable.';

export const CustomerInvoicesTable: React.FC<ICustomerInvoicesTable> = ({ invoices }) => {
  const { dateFormat, formatCurrency, currencySymbol } = useIntl();
  const [currentInvoice, setCurrentInvoice] = useState<IInvoice>(invoices[0]);
  const [isInvoicePreviewModalOpen, openInvoicePreviewModal, closeInvoicePreviewModal] =
    useBoolean();

  const { t } = useTranslation();

  const handleShowInvoicePreview = useCallback(
    (invoice: IInvoice) => {
      setCurrentInvoice(invoice);
      openInvoicePreviewModal();
    },
    [openInvoicePreviewModal],
  );

  return (
    <>
      <FilePreviewModal
        isOpen={isInvoicePreviewModalOpen}
        onClose={closeInvoicePreviewModal}
        timestamp={currentInvoice.dueDate}
        fileName={t(`${I18N_PATH}InvoicePreview`)}
        category={t(`${I18N_PATH}Invoice`)}
        isPdf={false}
        author={currentInvoice.csrName}
        src={currentInvoice.pdfUrl!}
        withMeta
        downloadSrc={currentInvoice.pdfUrl!}
      />
      <Table>
        <TableTools.Header>
          <TableTools.HeaderCell>{t(`${I18N_PATH}Invoice`)}#</TableTools.HeaderCell>
          <TableTools.HeaderCell>{t(`${I18N_PATH}InvoiceDue`)}</TableTools.HeaderCell>
          <TableTools.HeaderCell>{t(`${I18N_PATH}InvoicePaid`)}</TableTools.HeaderCell>
          <TableTools.HeaderCell>{t(`${I18N_PATH}Overdue`)}</TableTools.HeaderCell>
          <TableTools.HeaderCell right>
            {t(`${I18N_PATH}Balance`, { currencySymbol })}
          </TableTools.HeaderCell>
          <TableTools.HeaderCell right>
            {t(`${I18N_PATH}Charge`, { currencySymbol })}
          </TableTools.HeaderCell>
        </TableTools.Header>
        <TableBody cells={6} loading={false}>
          {invoices.map(invoice => (
            <TableRow key={invoice.id}>
              <TableCell>
                <Typography
                  variant="bodyMedium"
                  color="information"
                  cursor="pointer"
                  onClick={() => handleShowInvoicePreview(invoice)}
                >
                  {invoice.id}
                </Typography>
              </TableCell>
              <TableCell>
                {invoice.dueDate
                  ? format(substituteLocalTimeZoneInsteadUTC(invoice.dueDate), dateFormat.date)
                  : null}
              </TableCell>
              <TableCell>
                {format(substituteLocalTimeZoneInsteadUTC(invoice.updatedAt), dateFormat.date)}{' '}
              </TableCell>
              <TableCell>
                {invoice.dueDate && invoice.endStatementDate
                  ? t(`${I18N_PATH}Days`, {
                      daysCount: differenceInCalendarDays(
                        substituteLocalTimeZoneInsteadUTC(invoice.endStatementDate),
                        substituteLocalTimeZoneInsteadUTC(invoice.dueDate),
                      ),
                    })
                  : '-'}
              </TableCell>
              <TableCell right>{formatCurrency(invoice.balance)}</TableCell>
              <TableCell right>{formatCurrency(invoice.fine)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};
