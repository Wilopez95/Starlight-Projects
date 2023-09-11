import React from 'react';
import { Link } from 'react-router-dom';

import { useIntl } from '@root/i18n/useIntl';

import { Typography } from '../../../../../../../common';
import { Paths } from '../../../../../../../consts';
import { pathToUrl } from '../../../../../../../helpers';
import { useBusinessContext } from '../../../../../../../hooks';

import { OrderTable } from './styles';
import { type IDraftOrderTable } from './types';

const columns = ['Order#', 'Date', 'Service', 'Amount, $'];

const DraftOrderTable: React.FC<IDraftOrderTable> = ({ currentCustomer, orders }) => {
  const { businessUnitId } = useBusinessContext();
  const { formatCurrency, formatDateTime } = useIntl();

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
                {column}
              </Typography>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {orders.map(order => (
          <tr key={order.id}>
            <td>
              <Link
                replace
                target="_blank"
                to={pathToUrl(Paths.CustomerJobSiteModule.OpenOrders, {
                  businessUnit: businessUnitId,
                  customerId: currentCustomer.id,
                  jobSiteId: order.jobSite.id,
                  id: order.id,
                })}
              >
                <Typography textAlign="left" color="information" cursor="pointer">
                  {order.id}
                </Typography>
              </Link>
            </td>
            <td>
              <Typography textAlign="left">{formatDateTime(order.serviceDate).date}</Typography>
            </td>
            <td>
              <Typography textAlign="left">
                {order.billableService?.description ?? 'N/S'}
              </Typography>
            </td>
            <td>
              <Typography textAlign="right">{formatCurrency(order.grandTotal)}</Typography>
            </td>
          </tr>
        ))}
      </tbody>
    </OrderTable>
  );
};

export default DraftOrderTable;
