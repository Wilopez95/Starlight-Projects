import React, { useCallback, useEffect } from 'react';
import { Checkbox, Layouts } from '@starlightpro/shared-components';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Badge, Typography } from '@root/common';
import { TableCell, TableRow, TableSkeleton } from '@root/common/TableTools';
import { ArrowIcon } from '@root/common/TableTools/TableNavigationHeader/styles';
import { BillableItemActionEnum } from '@root/consts';
import { useStores, useToggle } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import SubscriptionWorkOrderRow from '../SubscriptionWorkOrderRow/SubscriptionWorkOrderRow';

import { ISubscriptionOrderRow } from './types';

const SubscriptionOrderRow: React.FC<ISubscriptionOrderRow> = ({
  subscriptionOrder,
  subscriptionOrder: {
    id: subscriptionOrderId,
    serviceDate,
    comments,
    assignedRoute,
    statusLabel,
    statusColor,
    workOrdersCount,
  },
}) => {
  const { subscriptionStore, subscriptionOrderStore, subscriptionWorkOrderStore } = useStores();
  const { formatDateTime } = useIntl();

  const [toggle, handleToggle] = useToggle(false);
  const subscription = subscriptionStore.selectedEntity;

  const subscriptionWorkOrders =
    subscriptionWorkOrderStore.valuesBySubscriptionOrderId(subscriptionOrderId);

  const requestWorkOrders = useCallback(() => {
    if (subscription?.id) {
      subscriptionWorkOrderStore.request({
        subscriptionId: subscription.id,
        subscriptionOrderId,
      });
    }
  }, [subscriptionOrderId, subscription?.id, subscriptionWorkOrderStore]);

  useEffect(() => {
    if (toggle && workOrdersCount && !subscriptionWorkOrders.length) {
      requestWorkOrders();
    }
  }, [
    subscriptionOrderId,
    toggle,
    subscriptionWorkOrders.length,
    workOrdersCount,
    requestWorkOrders,
  ]);

  const handleToggleClick = useCallback(
    (e: React.MouseEvent<HTMLOrSVGElement, MouseEvent>) => {
      e.stopPropagation();

      return !!workOrdersCount && handleToggle();
    },
    [handleToggle, workOrdersCount],
  );

  const handleOnRowClick = useCallback(async () => {
    const order = await subscriptionOrderStore.requestById(subscriptionOrder.id);

    order && subscriptionOrderStore.selectEntity(order);
  }, [subscriptionOrder, subscriptionOrderStore]);

  return (
    <>
      <TableRow
        selected={subscriptionOrderId === subscriptionOrderStore.selectedEntity?.id}
        onClick={handleOnRowClick}
      >
        <TableCell fallback="">
          {workOrdersCount ? (
            <Layouts.Padding
              padding="1"
              onClick={event => {
                handleToggleClick(event);
                event.preventDefault();
              }}
            >
              <ArrowIcon $active={!toggle} />
            </Layouts.Padding>
          ) : null}
        </TableCell>
        <TableCell minWidth={120}>
          <Typography color="information" fontWeight="bold">
            {subscriptionOrder.sequenceId}
          </Typography>
        </TableCell>
        <TableCell minWidth={180}>
          <Typography>{assignedRoute}</Typography>
        </TableCell>
        <TableCell>
          <Typography>
            {subscriptionOrder.billableService.action === BillableItemActionEnum.nonService
              ? 'No Service'
              : subscriptionOrder.billableService.description}
          </Typography>
        </TableCell>
        <TableCell>{subscription?.jobSiteShortAddress}</TableCell>
        <TableCell>
          <Typography>{formatDateTime(serviceDate).date}</Typography>
        </TableCell>
        <TableCell center>
          <Checkbox name="Comment" value={comments} disabled onChange={noop} />
        </TableCell>
        <TableCell>
          <Badge borderRadius={2} color={statusColor}>
            {statusLabel}
          </Badge>
        </TableCell>
      </TableRow>
      {toggle && !subscriptionWorkOrders.length ? (
        <TableSkeleton cells={8} rows={workOrdersCount} />
      ) : null}
      {toggle
        ? subscriptionWorkOrders.map(item => (
            <SubscriptionWorkOrderRow
              key={item.id}
              subscriptionOrder={subscriptionOrder}
              subscriptionWorkOrder={item}
            />
          ))
        : null}
    </>
  );
};

export default observer(SubscriptionOrderRow);
