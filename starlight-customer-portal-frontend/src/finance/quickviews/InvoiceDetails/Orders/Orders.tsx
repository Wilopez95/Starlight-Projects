import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import {
  Table,
  TableBody,
  TableCell,
  TableHeadCell,
  TableHeader,
  TableRow,
} from '@root/core/common/TableTools';
import { useStores } from '@root/core/hooks';
import { useIntl } from '@root/core/i18n/useIntl';
import { IInvoiceOrder, InvoiceType } from '@root/finance/types/entities';

import { getOrderService } from './helpers';

const I18N_PATH = 'modules.finance.quickviews.InvoiceDetails.OrdersTab.';

const OrdersTab: React.FC = () => {
  const { invoiceStore } = useStores();
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
      <TableHeader>
        <TableHeadCell>
          <Typography variant='bodyMedium' color='secondary' shade='desaturated'>
            {t(`${I18N_PATH}ServiceDate`)}
          </Typography>
        </TableHeadCell>
        <TableHeadCell>
          <Typography variant='bodyMedium' color='secondary' shade='desaturated'>
            {t(`${I18N_PATH}Order#`)}
          </Typography>
        </TableHeadCell>
        <TableHeadCell>
          <Typography variant='bodyMedium' color='secondary' shade='desaturated'>
            {t(`${I18N_PATH}Service`)}
          </Typography>
        </TableHeadCell>
        <TableHeadCell right>
          <Typography variant='bodyMedium' color='secondary' shade='desaturated'>
            {t(`${I18N_PATH}Amount`)}
          </Typography>
        </TableHeadCell>
      </TableHeader>
      <TableBody loading={loading} cells={4} noResult={orders?.length === 0}>
        {orders?.map((order) => (
          <TableRow key={order.id}>
            <TableCell>{formatDateTime(order.serviceDate).date}</TableCell>
            <TableCell>{order.id}</TableCell>
            <TableCell>{getOrderService(order)}</TableCell>
            <TableCell right>{formatCurrency(order.grandTotal)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default observer(OrdersTab);
