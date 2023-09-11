import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Layouts } from '@starlightpro/shared-components';

import { useIntl } from '@root/i18n/useIntl';

import { Badge, RadioButton, Typography } from '../../../../../../../common';
import { Routes } from '../../../../../../../consts';
import { addressFormat, formatPaymentType } from '../../../../../../../helpers';
import { useBusinessContext } from '../../../../../../../hooks';

import { OrderTable } from './styles';
import { type OverpaidTableProps } from './types';

const columns = ['Order', 'JobSite', 'PaymentType', 'Overpaid'];
const I18NPath = 'pages.Invoices.RunInvoicingMenu.';

const OverpaidOrderTable: React.FC<OverpaidTableProps> = props => {
  const { businessUnitId } = useBusinessContext();
  const { formatCurrency, currencySymbol } = useIntl();
  const { t } = useTranslation();

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
                {t(`${I18NPath}${column}`, {
                  currency: column === 'Overpaid' ? `, ${currencySymbol}` : '',
                })}
              </Typography>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {props.currentCustomer.drafts.orders.flatMap(draft =>
          draft.orders.map(order => {
            const overpaidOrder = props.currentCustomer.overpaidOrders[order.id];

            if (!overpaidOrder) {
              return null;
            }

            const refundablePayments = overpaidOrder.payments.filter(
              payment => Number(payment.amount) > 0,
            );

            const link = (
              <Link
                replace
                target="_blank"
                to={`/${Routes.BusinessUnits}/${businessUnitId}/${Routes.Customer}/${props.currentCustomer.id}/job-sites/${order.jobSite.id}/open-orders/${order.id}`}
              >
                <Typography textAlign="left" color="information" cursor="pointer">
                  {order.id}
                </Typography>
              </Link>
            );

            return (
              <tr key={order.id}>
                <td>
                  {props.withRadioButtons ? (
                    <RadioButton
                      name="orderId"
                      value={props.selectedOrder === order.id}
                      onChange={() => props.onOrderSelected(order.id)}
                    >
                      {link}
                    </RadioButton>
                  ) : (
                    link
                  )}
                </td>
                <td>
                  <Typography textAlign="left">{addressFormat(order.jobSite.address)}</Typography>
                </td>
                <td>
                  {refundablePayments.length === 1 ? (
                    <Typography textAlign="left">
                      {formatPaymentType(refundablePayments[0])}
                    </Typography>
                  ) : (
                    <Typography textAlign="left">
                      <Layouts.Flex>
                        <Layouts.Margin right="1">
                          <Badge borderRadius={8} color="secondary" shade="desaturated">
                            <Layouts.Padding right="1" left="1">
                              <Typography color="white">{refundablePayments.length}</Typography>
                            </Layouts.Padding>
                          </Badge>
                        </Layouts.Margin>
                        {t(`${I18NPath}Payments`)}
                      </Layouts.Flex>
                    </Typography>
                  )}
                </td>
                <td>
                  <Typography textAlign="right" color="primary">
                    {formatCurrency(overpaidOrder.overpaidAmount)}
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

export default OverpaidOrderTable;
