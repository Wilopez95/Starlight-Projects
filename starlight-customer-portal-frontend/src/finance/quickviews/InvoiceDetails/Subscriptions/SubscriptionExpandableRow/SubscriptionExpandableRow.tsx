import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Typography, useToggle } from '@starlightpro/shared-components';
import cx from 'classnames';
import { observer } from 'mobx-react-lite';

import { TableCell, TableRow } from '@root/core/common/TableTools';
import { ArrowIcon } from '@root/core/common/TableTools/TableNavigationHeader/styles';
import { useIntl } from '@root/core/i18n/useIntl';

import LineItemRow from './LineItemRow/LineItemRow';
import SubscriptionOrderRow from './SubscriptionOrderRow/SubscriptionOrderRow';
import { ISubscriptionExpandableRow } from './types';

import styles from './css/styles.scss';

const I18N_PATH = 'modules.finance.quickviews.InvoiceDetails.Subscriptions.';

const SubscriptionExpandableRow: React.FC<ISubscriptionExpandableRow> = ({ subscription }) => {
  const { t } = useTranslation();
  const { formatCurrency, formatDateTime } = useIntl();

  const [toggle, handleToggle] = useToggle(false);
  const handleToggleClick = useCallback(
    (e: React.MouseEvent<HTMLOrSVGElement, MouseEvent>) => {
      e.stopPropagation();

      return handleToggle();
    },
    [handleToggle],
  );

  return (
    <>
      <TableRow
        className={styles.subscriptionRow}
        onClick={(event: React.MouseEvent<HTMLOrSVGElement, MouseEvent>) => {
          handleToggleClick(event);
          event.preventDefault();
        }}
        selected={toggle}
      >
        <TableCell colSpan={4}>
          <ArrowIcon active={!toggle} />
          <Layouts.Padding padding='1'>
            <Typography>{t(`${I18N_PATH}Subscription`, { id: subscription.id })}</Typography>
          </Layouts.Padding>
        </TableCell>
        <TableCell right>
          <Typography>{formatCurrency(subscription.totalPriceForSubscription)}</Typography>
        </TableCell>
      </TableRow>

      {toggle &&
        subscription.serviceItems.map((serviceItem, serviceItemIndex) => (
          <React.Fragment key={`${serviceItem.serviceName}-${serviceItemIndex}`}>
            <TableRow className={cx(styles.subscriptionRow, styles.titleRow)}>
              <TableCell colSpan={5}>
                <Typography fontWeight='medium'>
                  {t(`${I18N_PATH}Service#`, { id: serviceItemIndex + 1 })}
                </Typography>
              </TableCell>
            </TableRow>

            {serviceItem.serviceItems.map((concreteServiceItem, concreteServiceItemIndex) => (
              <TableRow
                className={styles.subscriptionRow}
                key={`${concreteServiceItem.id}-${concreteServiceItemIndex}`}
              >
                <TableCell>
                  <Layouts.Padding left='2'>
                    <Typography>
                      {`${formatDateTime(concreteServiceItem.periodSince).date} - ${
                        formatDateTime(concreteServiceItem.periodTo).date
                      }`}
                    </Typography>
                  </Layouts.Padding>
                </TableCell>

                <TableCell>
                  <Typography>{serviceItem.serviceName}</Typography>
                </TableCell>

                <TableCell right>
                  <Typography>{formatCurrency(concreteServiceItem.price)}</Typography>
                </TableCell>

                <TableCell right>
                  <Typography>{concreteServiceItem.quantity}</Typography>
                </TableCell>

                <TableCell right>
                  <Typography>{formatCurrency(concreteServiceItem.totalPrice)}</Typography>
                </TableCell>
              </TableRow>
            ))}

            {serviceItem.lineItems.length > 0 && (
              <TableRow className={cx(styles.subscriptionRow, styles.titleRow)}>
                <TableCell colSpan={5}>
                  <Layouts.Padding left='2'>
                    <Typography fontWeight='medium'>{t(`${I18N_PATH}LineItems`)}</Typography>
                  </Layouts.Padding>
                </TableCell>
              </TableRow>
            )}
            {serviceItem.lineItems.map((lineItem, lineItemIndex) => (
              <LineItemRow lineItem={lineItem} key={`${lineItem.id}-${lineItemIndex}`} />
            ))}
            {serviceItem.subscriptionOrders.map((subscriptionOrder, subscriptionOrderIndex) => (
              <React.Fragment key={`${subscriptionOrder.id}-${subscriptionOrderIndex}`}>
                <TableRow className={cx(styles.subscriptionRow, styles.titleRow)}>
                  <TableCell colSpan={5}>
                    <Layouts.Padding left='2'>
                      <Typography fontWeight='medium'>
                        {t(`${I18N_PATH}SubscriptionOrder#`, { id: subscriptionOrder.id })}
                      </Typography>
                    </Layouts.Padding>
                  </TableCell>
                </TableRow>
                <SubscriptionOrderRow subscriptionOrder={subscriptionOrder} />
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}

      {toggle &&
        subscription.linkedSubscriptionOrder?.map((subscriptionOrder, index) => (
          <React.Fragment key={`${subscriptionOrder.id}-${index}`}>
            <TableRow className={cx(styles.subscriptionRow, styles.titleRow)}>
              <TableCell colSpan={5}>
                <Typography fontWeight='medium'>
                  {t(`${I18N_PATH}SubscriptionOrder#`, { id: subscriptionOrder.id })}
                </Typography>
              </TableCell>
            </TableRow>
            <SubscriptionOrderRow subscriptionOrder={subscriptionOrder} />
          </React.Fragment>
        ))}

      {toggle &&
        subscription.nonServiceOrder?.map((nonServiceOrder, index) => (
          <React.Fragment key={`${nonServiceOrder.id}-${index}`}>
            <TableRow className={cx(styles.subscriptionRow, styles.titleRow)}>
              <TableCell colSpan={5}>
                <Typography fontWeight='medium'>
                  {t(`${I18N_PATH}NonServiceOrder#`, { id: nonServiceOrder.id })}
                </Typography>
              </TableCell>
            </TableRow>

            {nonServiceOrder.subOrderLineItems?.map((item, index) => (
              <LineItemRow
                key={`${item.id}-${index}`}
                lineItem={{
                  ...item,
                  serviceDate: nonServiceOrder.serviceDate,
                  totalPrice: item.price * item.quantity,
                }}
              />
            ))}
          </React.Fragment>
        ))}
    </>
  );
};

export default observer(SubscriptionExpandableRow);
