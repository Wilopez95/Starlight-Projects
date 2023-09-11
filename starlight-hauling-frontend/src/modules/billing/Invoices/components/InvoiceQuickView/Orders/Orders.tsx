import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { OrderStatusRoutes, Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useIntl } from '@root/i18n/useIntl';

import { Typography } from '../../../../../../common';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableTools,
} from '../../../../../../common/TableTools';
import { useBusinessContext, useStores } from '../../../../../../hooks';
import { IInvoiceOrder, InvoiceType } from '../../../types';

import { getOrderService } from './helpers';

const I18N_PATH = 'pages.Invoices.components.InvoiceQuickView.components.Orders.';

const OrdersTab: React.FC = () => {
  const { invoiceStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const { formatCurrency, formatDateTime } = useIntl();
  const { t } = useTranslation();
  const loading = invoiceStore.quickViewLoading;

  const currentInvoice = invoiceStore.selectedEntity!;
  const orders = (currentInvoice.invoicedEntityList as IInvoiceOrder[]) || null;

  if (currentInvoice.type !== InvoiceType.orders) {
    return null;
  }

  return (
    <Table>
      <TableTools.Header>
        <TableTools.HeaderCell>{t(`${I18N_PATH}ServiceDate`)}</TableTools.HeaderCell>
        <TableTools.HeaderCell>{t(`${I18N_PATH}Order`)}#</TableTools.HeaderCell>
        <TableTools.HeaderCell>{t(`${I18N_PATH}Service`)}</TableTools.HeaderCell>
        <TableTools.HeaderCell right>{t(`${I18N_PATH}Amount`)}</TableTools.HeaderCell>
      </TableTools.Header>
      <TableBody loading={loading} cells={4} noResult={orders?.length === 0}>
        {orders?.map(order => (
          <TableRow key={order.id}>
            <TableCell>{formatDateTime(order.serviceDate).date}</TableCell>
            <TableCell>
              <Link
                to={`${pathToUrl(Paths.OrderModule.Orders, {
                  businessUnit: businessUnitId,
                  subPath: OrderStatusRoutes.Invoiced,
                  orderId: order.id,
                })}`}
              >
                <Typography color="information">{order.id}</Typography>
              </Link>
            </TableCell>
            <TableCell>{getOrderService(order) ?? 'N/S'}</TableCell>
            <TableCell right>{formatCurrency(order.grandTotal)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default observer(OrdersTab);
