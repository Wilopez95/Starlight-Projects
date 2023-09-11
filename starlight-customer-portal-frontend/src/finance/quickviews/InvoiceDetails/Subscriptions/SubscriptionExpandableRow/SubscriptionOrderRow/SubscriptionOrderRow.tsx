import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Typography } from '@starlightpro/shared-components';
import cx from 'classnames';
import { observer } from 'mobx-react-lite';

import { TableCell, TableRow } from '@root/core/common/TableTools';
import { useIntl } from '@root/core/i18n/useIntl';
import { ReservedServiceNames } from '@root/finance/types/entities';

import LineItemRow from '../LineItemRow/LineItemRow';

import { ISubscriptionOrderRow } from './types';

import styles from '../css/styles.scss';

const I18N_PATH = 'modules.finance.quickviews.InvoiceDetails.Subscriptions.';

const SubscriptionOrderRow: React.FC<ISubscriptionOrderRow> = ({
  subscriptionOrder: { serviceDate, serviceName, price, quantity, subOrderLineItems },
}) => {
  const { t } = useTranslation();
  const { formatCurrency, formatDateTime } = useIntl();

  return (
    <>
      {price > 0 && (
        <TableRow className={styles.subscriptionRow}>
          <TableCell>
            <Layouts.Padding left='2'>
              <Typography>{formatDateTime(serviceDate).date}</Typography>
            </Layouts.Padding>
          </TableCell>

          <TableCell>
            <Typography>
              {serviceName === ReservedServiceNames.notService ? t(`${8}NotAService`) : serviceName}
            </Typography>
          </TableCell>

          <TableCell right>
            <Typography>{formatCurrency(price)}</Typography>
          </TableCell>

          <TableCell right>
            <Typography>{quantity}</Typography>
          </TableCell>

          <TableCell right>
            <Typography>{formatCurrency(price * quantity)}</Typography>
          </TableCell>
        </TableRow>
      )}
      {!!subOrderLineItems?.length && (
        <>
          <TableRow className={cx(styles.subscriptionRow, styles.titleRow)}>
            <TableCell colSpan={5}>
              <Layouts.Padding left='2'>
                <Typography fontWeight='medium'>{t(`${I18N_PATH}LineItems`)}</Typography>
              </Layouts.Padding>
            </TableCell>
          </TableRow>
          {subOrderLineItems.map((lineItem, lineItemIndex) => (
            <LineItemRow
              lineItem={{
                ...lineItem,
                serviceDate,
                totalPrice: lineItem.price * lineItem.quantity,
              }}
              key={`${lineItem.id}-${lineItemIndex}`}
            />
          ))}
        </>
      )}
    </>
  );
};

export default observer(SubscriptionOrderRow);
