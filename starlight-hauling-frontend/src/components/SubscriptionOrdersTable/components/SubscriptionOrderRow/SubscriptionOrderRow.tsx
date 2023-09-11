import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { Checkbox } from '@starlightpro/shared-components';
import { noop } from 'lodash';

import { Badge, Typography } from '@root/common';
import { TableCell, TableCheckboxCell, TableRow } from '@root/common/TableTools';
import {
  BillableItemActionEnum,
  Paths,
  SubscriptionOrderTabRoutes,
  SubscriptionTabRoutes,
} from '@root/consts';
import { addressFormat, hasDataAttribute, isModal, pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { SubscriptionOrder } from '@root/stores/subscriptionOrder/SubscriptionOrder';
import { SubscriptionOrderStatusEnum } from '@root/types';

export const SubscriptionOrderRow: React.FC<{ subscriptionOrder: SubscriptionOrder }> = ({
  subscriptionOrder,
}) => {
  const { subscriptionOrderStore, subscriptionStore } = useStores();
  const { formatDateTime } = useIntl();
  const { t } = useTranslation();
  const { tab } = useParams<{ tab: SubscriptionOrderTabRoutes }>();
  const { businessUnitId } = useBusinessContext();

  const handleOnRowClick = useCallback(
    (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
      if (hasDataAttribute(e, 'skipEvent') || isModal(e)) {
        return;
      }
      subscriptionOrderStore.selectEntity(subscriptionOrder);
      subscriptionStore.requestById(subscriptionOrder.subscriptionServiceItem.subscriptionId);
    },
    [subscriptionOrder, subscriptionOrderStore, subscriptionStore],
  );

  const isNeedsApproval = subscriptionOrder.status === SubscriptionOrderStatusEnum.needsApproval;
  const statusColor = subscriptionOrder.statusColor;

  const subscriptionOrderStatus = SubscriptionOrderStatusEnum[tab];
  const isSelectable = [
    SubscriptionOrderStatusEnum.approved,
    SubscriptionOrderStatusEnum.completed,
  ].includes(subscriptionOrderStatus);
  const disabledCheckBox =
    subscriptionOrder.status === SubscriptionOrderStatusEnum.completed ||
    subscriptionOrder.status === SubscriptionOrderStatusEnum.approved;

  return (
    <TableRow
      selected={subscriptionOrder.id === subscriptionOrderStore.selectedEntity?.id}
      onClick={handleOnRowClick}
    >
      {isSelectable ? (
        <TableCheckboxCell
          name={`subscriptionOder-${subscriptionOrder.id}`}
          onChange={subscriptionOrder.check}
          value={subscriptionOrder.checked}
          disabled={!disabledCheckBox}
        />
      ) : null}
      <TableCell>
        <Typography>{formatDateTime(subscriptionOrder.serviceDate).date}</Typography>
      </TableCell>
      <TableCell minWidth={120}>
        <Link
          to={pathToUrl(Paths.CustomerSubscriptionModule.OrderDetails, {
            businessUnit: businessUnitId,
            subscriptionId: subscriptionOrder.subscriptionServiceItem.subscriptionId,
            customerId: subscriptionOrder.customer?.originalId,
            tab: subscriptionStore?.selectedEntity?.status ?? SubscriptionTabRoutes.Active,
            subscriptionOrderId: subscriptionOrder.id,
          })}
        >
          <Typography color="information">{subscriptionOrder.sequenceId}</Typography>
        </Link>
      </TableCell>
      <TableCell>
        <Typography>{subscriptionOrder.businessLine?.name}</Typography>
      </TableCell>
      <TableCell>
        <Badge
          borderRadius={2}
          color={statusColor}
          bgColor={isNeedsApproval ? 'grey' : statusColor}
          shade={isNeedsApproval ? 'light' : 'standard'}
          bgShade={isNeedsApproval ? 'light' : 'desaturated'}
        >
          {t(`consts.SubscriptionOrderStatuses.${subscriptionOrder.statusLabel}`)}
        </Badge>
      </TableCell>
      <TableCell>
        {subscriptionOrder.jobSite?.address
          ? addressFormat(subscriptionOrder.jobSite.address)
          : null}
      </TableCell>
      <TableCell>
        <Typography>
          {subscriptionOrder.billableService.action === BillableItemActionEnum.nonService
            ? 'No Service'
            : subscriptionOrder.billableService.description}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography>{subscriptionOrder.customer?.name}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{subscriptionOrder.assignedRoute}</Typography>
      </TableCell>
      <TableCell right>
        <Typography fontWeight="bold">${subscriptionOrder.price}</Typography>
      </TableCell>
      <TableCell center>
        <Checkbox name="Comment" value={subscriptionOrder.comments} disabled onChange={noop} />
      </TableCell>
    </TableRow>
  );
};
