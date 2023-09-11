import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Badge, Typography } from '@root/common';
import { Paths, SubscriptionTabRoutes } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useIntl } from '@root/i18n/useIntl';
import {
  getSubscriptionOrderStatusColor,
  getSubscriptionOrderStatusLabel,
} from '@root/stores/subscriptionOrder/helpers';
import { useBusinessContext } from '@hooks';

import { OrderTable } from './styles';
import { type BaseOrderTable } from './types';

const columns = ['Subscription', 'Order', 'ServiceDate', 'Status'];
const I18NPath = 'pages.Invoices.RunInvoicingMenu.';

const UnFinalizedOrdersTable: React.FC<BaseOrderTable> = props => {
  const { businessUnitId } = useBusinessContext();
  const { formatDateTime } = useIntl();
  const { t } = useTranslation();

  const orders = useMemo(
    () => props.currentCustomer.unfinalizedOrders ?? [],
    [props.currentCustomer.unfinalizedOrders],
  );

  return (
    <OrderTable>
      <thead>
        <tr>
          {columns.map((column, i) => (
            <th key={column}>
              <Typography
                textAlign={i === columns.length - 1 ? 'right' : 'left'}
                variant="headerFive"
                color="secondary"
                textTransform="uppercase"
              >
                {t(`${I18NPath}${column}`)}
              </Typography>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {orders.map(order => {
          const link = (
            <Link
              replace
              target="_blank"
              to={pathToUrl(Paths.CustomerSubscriptionModule.OrderDetails, {
                customerId: props.currentCustomer.id,
                businessUnit: businessUnitId,
                tab: SubscriptionTabRoutes.Active,
                subscriptionId: order.subscriptionId,
                subscriptionOrderId: order.orderId,
              })}
            >
              <Typography textAlign="left" color="information" cursor="pointer">
                {order.orderId}
              </Typography>
            </Link>
          );

          return (
            <tr key={order.orderId}>
              <td>{order.subscriptionId}</td>
              <td>{link}</td>
              <td>
                <Typography>{formatDateTime(order.serviceDate).date}</Typography>
              </td>
              <td align="right">
                <Badge color={getSubscriptionOrderStatusColor(order.status)}>
                  {t(
                    `consts.SubscriptionOrderStatuses.${getSubscriptionOrderStatusLabel(
                      order.status,
                    )}`,
                  )}
                </Badge>
              </td>
            </tr>
          );
        })}
      </tbody>
    </OrderTable>
  );
};

export default UnFinalizedOrdersTable;
