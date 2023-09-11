/* eslint-disable @typescript-eslint/unbound-method */
import React, { useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { Layouts } from '@starlightpro/shared-components';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { useIntl } from '@root/i18n/useIntl';

import { Typography } from '../../../../../common';
import {
  Table,
  TableBody,
  TableCell,
  TableCheckboxCell,
  TableRow,
} from '../../../../../common/TableTools';
import { Routes } from '../../../../../consts';
import { formatCreditCard, hasDataAttribute } from '../../../../../helpers';
import { useBusinessContext, useStores } from '../../../../../hooks';
import { Payment } from '../../../entities';
import { TypographyStyled } from '../../styles';

import DeferredPaymentsTableHeader from './DeferredPaymentsHeader/DeferredPaymentsHeader';
import { type IDeferredPaymentsTable } from './types';

const DeferredPaymentsTable: React.FC<IDeferredPaymentsTable> = ({
  tableBodyContainer,
  onSelect,
  onSort,
}) => {
  const { paymentStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const history = useHistory();
  const { formatDateTime, formatCurrency } = useIntl();
  const { t } = useTranslation();

  const handleDetailsClick = useCallback(
    (payment: Payment, index: number) => {
      const currentOrder = payment.orders?.[index];

      if (currentOrder?.id && currentOrder?.jobSite?.id && payment?.customer?.id) {
        const orderDetailsRoute = `/${Routes.BusinessUnits}/${businessUnitId}/${Routes.Customer}/${payment.customer.id}/job-sites/${currentOrder.jobSite.id}/open-orders/${currentOrder.id}`;

        history.push(orderDetailsRoute);
      }
    },
    [businessUnitId, history],
  );

  return (
    <Table>
      <Helmet title={t('Titles.DeferredPayments')} />
      <DeferredPaymentsTableHeader onSort={onSort} />
      <TableBody
        loading={paymentStore.loading}
        cells={8}
        ref={tableBodyContainer}
        noResult={paymentStore.noResult}
      >
        {paymentStore.values.map(payment => {
          return (
            <TableRow
              key={payment.id}
              selected={paymentStore.selectedEntity?.id === payment.id}
              onClick={e => {
                if (hasDataAttribute(e, 'skipEvent')) {
                  return;
                }
                onSelect(payment);
              }}
            >
              <TableCheckboxCell
                name={`payment-${payment.id}`}
                onChange={payment.check}
                value={payment.checked}
                disabled={payment.status !== 'deferred'}
              />

              <TableCell>{payment.customer?.name}</TableCell>
              <TableCell>
                {payment.orders?.map((order, index) => {
                  return (
                    <TypographyStyled
                      key={order.id}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleDetailsClick(payment, index);
                      }}
                      color="information"
                    >
                      {index + 1 < (payment.orders ?? []).length ? `${order.id}, ` : order.id}
                    </TypographyStyled>
                  );
                })}
              </TableCell>
              <TableCell>
                {formatDateTime(payment.orders?.[0].serviceDate ?? new Date()).date}
              </TableCell>
              {payment.deferredUntil ? (
                <TableCell>{formatDateTime(payment.deferredUntil).date}</TableCell>
              ) : null}
              {payment.creditCard ? (
                <TableCell>{formatCreditCard(payment.creditCard)}</TableCell>
              ) : null}
              <TableCell>
                <Layouts.Box
                  height="18px"
                  backgroundColor={payment.status === 'deferred' ? 'grey' : 'primary'}
                  backgroundShade={payment.status === 'deferred' ? 'light' : 'desaturated'}
                >
                  <Layouts.Padding left="0.5" right="0.5">
                    <Typography
                      variant="bodySmall"
                      color={payment.status === 'deferred' ? 'secondary' : 'primary'}
                      shade={payment.status === 'deferred' ? 'light' : 'standard'}
                    >
                      {startCase(payment.status)}
                    </Typography>
                  </Layouts.Padding>
                </Layouts.Box>
              </TableCell>
              <TableCell right>
                <Typography fontWeight="bold">{formatCurrency(payment.amount)}</Typography>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default observer(DeferredPaymentsTable);
