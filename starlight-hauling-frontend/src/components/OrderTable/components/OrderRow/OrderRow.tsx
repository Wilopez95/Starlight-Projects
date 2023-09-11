import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Badge, Typography } from '@root/common';
import { TableCell, TableCheckboxCell, TableRow } from '@root/common/TableTools';
import { Paths } from '@root/consts';
import { getColorByStatus, hasDataAttribute, isModal, pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { Order } from '@root/stores/entities';

import MediaSection from '../MediaSection/MediaSection';

import styles from '../../css/styles.scss';

const OrderRow: React.FC<{ order: Order; isSelectable: boolean }> = ({ order, isSelectable }) => {
  const { orderStore } = useStores();
  const { formatDateTime, formatCurrency } = useIntl();
  const { t } = useTranslation();
  const { businessUnitId } = useBusinessContext();
  let url = '';

  if (order.customer && order.jobSite) {
    url = pathToUrl(
      order.status === 'invoiced'
        ? Paths.CustomerJobSiteModule.InvoicedOrders
        : Paths.CustomerJobSiteModule.OpenOrders,
      {
        businessUnit: businessUnitId,
        customerId: order.customer?.originalId,
        jobSiteId: order.jobSite?.originalId,
        id: order.id,
      },
    );
  }

  return (
    <TableRow
      selected={order.id === orderStore.selectedEntity?.id}
      key={order.id}
      onClick={e => {
        if (hasDataAttribute(e, 'skipEvent') || isModal(e)) {
          return;
        }
        orderStore.selectEntity(order);
      }}
    >
      {isSelectable ? (
        <TableCheckboxCell
          name={`order-${order.id}`}
          onChange={order.check}
          value={order.checked}
        />
      ) : null}
      <TableCell>
        <Typography>{formatDateTime(order.serviceDate).date}</Typography>
      </TableCell>
      <TableCell>
        <Link to={url}>
          <Typography color="information">{order.id}</Typography>
        </Link>
      </TableCell>
      <TableCell>
        <Typography>{order?.businessLine?.name}</Typography>
      </TableCell>
      <TableCell>
        <Typography>
          {order.workOrder?.woNumber === -1 ? t('Text.Pending') : order.workOrder?.woNumber}
        </Typography>
      </TableCell>
      <TableCell>
        <Badge borderRadius={2} color={getColorByStatus(order.status)}>
          {startCase(order.status)}
        </Badge>
      </TableCell>
      <TableCell fallback="" titleClassName={styles.ticketCell}>
        {order.mediaFilesCount > 0 ? <MediaSection order={order} /> : null}
      </TableCell>
      <TableCell>{order.jobSiteShortAddress}</TableCell>
      <TableCell>
        {order.billableServiceDescription === 'undefined'
          ? t('Text.NoBillableService')
          : order.billableServiceDescription}
      </TableCell>
      <TableCell>{order.customerName}</TableCell>
      <TableCell right>
        <Typography fontWeight="bold">{formatCurrency(order.grandTotal)}</Typography>
      </TableCell>
    </TableRow>
  );
};

export default observer(OrderRow);
