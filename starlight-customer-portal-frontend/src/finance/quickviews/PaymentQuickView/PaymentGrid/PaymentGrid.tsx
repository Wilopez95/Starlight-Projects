import React, { useRef } from 'react';
import { Layouts, FormInput, Typography } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';

import { Table, TableBody, TableCell, TableRow } from '@root/core/common/TableTools';
import { useStores } from '@root/core/hooks';
import { useIntl } from '@root/core/i18n/useIntl';
import { getBadgeByStatus } from '@root/finance/components/InvoiceTable/helpers';
import { INVOICE_STATUSES } from '@root/finance/layouts/InvoiceLayout/types';
import { NewUnappliedPayment, PaymentAmount } from '@root/finance/types/entities';

import { NoWrapTypography } from '../../styles';

import TableHeaderPayment from './TableHeader';

const PaymentGrid = () => {
  const { invoiceStore } = useStores();
  const { formatDateTime, formatCurrency } = useIntl();
  const tableBodyContainer = useRef<HTMLTableSectionElement>(null);
  const { values, setFieldValue } = useFormikContext<NewUnappliedPayment>();
  const handleChangeAmount = (e: React.SyntheticEvent, index: number, invoice: PaymentAmount) => {
    const target = e.target as HTMLInputElement;
    const value = target.value;

    if (+value > invoice.balance) {
      return setFieldValue(`applications[${index}].amount`, invoice.balance);
    } else {
      return setFieldValue(`applications[${index}].amount`, +value);
    }
  };

  return (
    <Table>
      <TableHeaderPayment />
      <TableBody
        loading={invoiceStore.loading}
        cells={7}
        ref={tableBodyContainer}
        noResult={invoiceStore.noResult}
      >
        {invoiceStore.checkedInvoices.reduce((acc, invoice, index) => {
          if (
            invoice.status === INVOICE_STATUSES.closed ||
            invoice.status === INVOICE_STATUSES.writeOff
          ) {
            return acc;
          }
          const amountDue = invoice.balance;
          const newBalance = amountDue - values.applications[index].amount;

          const node = (
            <TableRow selected={invoice.id === invoiceStore.selectedEntity?.id} key={invoice.id}>
              <TableCell>
                <NoWrapTypography>{formatDateTime(invoice.createdAt).date}</NoWrapTypography>
              </TableCell>
              <TableCell>
                <Typography>{invoice.id}</Typography>
              </TableCell>
              <TableCell>
                <Typography>{getBadgeByStatus(invoice.status)}</Typography>
              </TableCell>
              <TableCell right>
                <Typography fontWeight='bold'>{formatCurrency(invoice.total)}</Typography>
              </TableCell>
              <TableCell right>
                <Typography fontWeight='bold'>{formatCurrency(amountDue)}</Typography>
              </TableCell>
              <TableCell>
                <Layouts.Margin top='2' as={Layouts.Box} maxWidth='100px'>
                  <FormInput
                    name={`applications[${index}].amount`}
                    type='number'
                    value={values.applications[index]?.amount}
                    onChange={(e: React.SyntheticEvent<Element, Event>) =>
                      handleChangeAmount(e, index, invoice)
                    }
                  />
                </Layouts.Margin>
              </TableCell>
              <TableCell>
                <Typography>{formatCurrency(newBalance)}</Typography>
              </TableCell>
            </TableRow>
          );

          acc.push(node);

          return acc;
        }, [] as React.ReactNode[])}
      </TableBody>
    </Table>
  );
};

export default PaymentGrid;
