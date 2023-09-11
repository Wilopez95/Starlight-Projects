import React, { useCallback } from 'react';
import { Checkbox, Layouts } from '@starlightpro/shared-components';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Badge, Typography } from '@root/common';
import { TableCell, TableRow } from '@root/common/TableTools';
import { useBusinessContext, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import { ISubscriptionWorkOrderRow } from './types';

const fallback = '-';

const SubscriptionWorkOrderRow: React.FC<ISubscriptionWorkOrderRow> = ({
  subscriptionWorkOrder,
  subscriptionOrder,
}) => {
  const { subscriptionWorkOrderStore, subscriptionStore, subscriptionOrderStore } = useStores();
  const { formatDateTime } = useIntl();
  const { businessUnitId } = useBusinessContext();

  const subscription = subscriptionStore.selectedEntity;

  const handleOnRowClick = useCallback(async () => {
    subscriptionOrderStore.selectEntity(subscriptionOrder, false);

    await subscriptionWorkOrderStore.requestById(subscriptionWorkOrder.id);
  }, [
    subscriptionOrderStore,
    subscriptionWorkOrderStore,
    subscriptionOrder,
    subscriptionWorkOrder,
  ]);

  return (
    <TableRow
      selected={subscriptionWorkOrderStore.selectedEntity?.id === subscriptionWorkOrder.id}
      onClick={handleOnRowClick}
    >
      <TableCell fallback="" />
      <TableCell>
        <Layouts.Padding left="2">
          <a
            target="_blank"
            href={`${process.env
              .ROUTE_PLANNER_FE_URL!}/business-units/${businessUnitId}/dispatch/work-orders/${
              subscriptionWorkOrder.sequenceId
            }`}
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
          >
            <Typography color="information">{subscriptionWorkOrder.sequenceId}</Typography>
          </a>
        </Layouts.Padding>
      </TableCell>
      <TableCell minWidth={180}>
        <Typography>{subscriptionWorkOrder.assignedRoute ?? fallback}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{subscriptionOrder.billableService.description}</Typography>
      </TableCell>
      <TableCell>{subscription?.jobSiteShortAddress}</TableCell>
      <TableCell>
        <Typography>{formatDateTime(subscriptionWorkOrder.serviceDate).date}</Typography>
      </TableCell>
      <TableCell center>
        <Checkbox name="Comment" value={false} disabled onChange={noop} />
      </TableCell>
      <TableCell>
        <Badge borderRadius={2} color={subscriptionWorkOrder.statusColor}>
          {subscriptionWorkOrder.statusLabel}
        </Badge>
      </TableCell>
    </TableRow>
  );
};

export default observer(SubscriptionWorkOrderRow);
