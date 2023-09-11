import React from 'react';
import { noop, startCase } from 'lodash-es';

import { useIntl } from '@root/i18n/useIntl';

import { Badge } from '../../../../../../../common';
import * as TableTools from '../../../../../../../common/TableTools';
import { formatPaymentType, getPaymentInvoicedStatusColor } from '../../../../../../../helpers';

import { IPaymentRow } from './types';

export const PaymentRow: React.FC<IPaymentRow> = ({
  payment,
  checked,
  disabled,
  onChange = noop,
}) => {
  const { formatDateTime, formatCurrency } = useIntl();
  const badgeColor = getPaymentInvoicedStatusColor(payment.invoicedStatus);

  return (
    <TableTools.TableRow>
      <TableTools.TableActionCell
        onChange={onChange}
        name={payment.id.toString()}
        disabled={disabled}
        value={checked}
        action="checkbox"
      />
      <TableTools.TableCell>{formatDateTime(payment.date).date}</TableTools.TableCell>
      <TableTools.TableCell>Payment</TableTools.TableCell>
      <TableTools.TableCell>{formatPaymentType(payment)}</TableTools.TableCell>
      <TableTools.TableCell>
        <Badge color={badgeColor}>{startCase(payment.invoicedStatus)}</Badge>
      </TableTools.TableCell>

      <TableTools.TableCell right>{formatCurrency(payment.unappliedAmount)}</TableTools.TableCell>
    </TableTools.TableRow>
  );
};
