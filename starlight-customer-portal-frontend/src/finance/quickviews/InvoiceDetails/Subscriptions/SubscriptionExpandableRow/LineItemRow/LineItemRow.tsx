import React from 'react';
import { Layouts, Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { TableCell, TableRow } from '@root/core/common/TableTools';
import { useIntl } from '@root/core/i18n/useIntl';

import { ILineItemRow } from './types';

import styles from '../css/styles.scss';

const LineItemRow: React.FC<ILineItemRow> = ({ lineItem }) => {
  const { formatCurrency, formatDateTime } = useIntl();

  return (
    <TableRow className={styles.subscriptionRow}>
      <TableCell>
        <Layouts.Padding left='2'>
          <Typography>
            {lineItem.periodSince && lineItem.periodTo
              ? `${formatDateTime(lineItem.periodSince).date} - ${
                  formatDateTime(lineItem.periodTo).date
                }`
              : formatDateTime(lineItem.serviceDate!).date}
          </Typography>
        </Layouts.Padding>
      </TableCell>

      <TableCell>
        <Typography>{lineItem.serviceName}</Typography>
      </TableCell>

      <TableCell right>
        <Typography>{formatCurrency(lineItem.price)}</Typography>
      </TableCell>

      <TableCell right>
        <Typography>{lineItem.quantity}</Typography>
      </TableCell>

      <TableCell right>
        <Typography>{formatCurrency(lineItem.totalPrice)}</Typography>
      </TableCell>
    </TableRow>
  );
};

export default observer(LineItemRow);
