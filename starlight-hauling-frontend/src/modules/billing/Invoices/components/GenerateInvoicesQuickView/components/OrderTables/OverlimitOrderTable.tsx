import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useIntl } from '@root/i18n/useIntl';

import { Typography } from '../../../../../../../common';
import { TableCheckboxCell } from '../../../../../../../common/TableTools';
import { Routes } from '../../../../../../../consts';
import { addressFormat } from '../../../../../../../helpers';
import { useBusinessContext } from '../../../../../../../hooks';

import { OrderTable } from './styles';
import { type OverlimitTableProps } from './types';

const columns = ['Order', 'JobSite', 'Overlimit'];
const I18NPath = 'pages.Invoices.RunInvoicingMenu.';

const OverlimitOrderTable: React.FC<OverlimitTableProps> = props => {
  const { businessUnitId } = useBusinessContext();
  const { formatCurrency, currencySymbol } = useIntl();
  const { t } = useTranslation();

  const overlimitOrders = Object.values(props.currentCustomer.overlimitOrders);
  const isAllChecked =
    overlimitOrders.length === props.selectedOrders?.length && props.selectedOrders.length > 0;

  return (
    <OrderTable>
      <thead>
        <tr>
          {props.withCheckboxes ? (
            <TableCheckboxCell
              name="allOrders"
              value={isAllChecked}
              onChange={props.onAllChecked}
            />
          ) : null}
          {columns.map((column, i) => (
            <th key={column}>
              <Typography
                textAlign={i === columns.length - 1 ? 'right' : 'left'}
                variant="headerFive"
                color="secondary"
                textTransform="uppercase"
              >
                {t(`${I18NPath}${column}`, {
                  currency: column === 'Overlimit' ? `, ${currencySymbol}` : '',
                })}
              </Typography>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {props.currentCustomer.drafts.orders.flatMap(draft =>
          draft.orders.map(order => {
            const overlimitOrder = props.currentCustomer.overlimitOrders[order.id];

            if (!overlimitOrder) {
              return null;
            }

            return (
              <tr key={order.id}>
                {props.withCheckboxes ? (
                  <TableCheckboxCell
                    name={overlimitOrder.id.toString()}
                    value={props.selectedOrders.includes(overlimitOrder.id)}
                    onChange={() => props.onOrderChecked(overlimitOrder.id)}
                  />
                ) : null}
                <td>
                  <Link
                    replace
                    target="_blank"
                    to={`/${Routes.BusinessUnits}/${businessUnitId}/${Routes.Customer}/${props.currentCustomer.id}/job-sites/${order.jobSite.id}/open-orders/${order.id}`}
                  >
                    <Typography textAlign="left" color="information" cursor="pointer">
                      {order.id}
                    </Typography>
                  </Link>
                </td>
                <td>
                  <Typography textAlign="left">{addressFormat(order.jobSite.address)}</Typography>
                </td>
                <td>
                  <Typography textAlign="right" color="alert">
                    {formatCurrency(overlimitOrder.overlimitAmount)}
                  </Typography>
                </td>
              </tr>
            );
          }),
        )}
      </tbody>
    </OrderTable>
  );
};

export default OverlimitOrderTable;
