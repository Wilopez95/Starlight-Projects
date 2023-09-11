import React, { useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Badge, Typography } from '@root/common';
import {
  Table,
  TableBody,
  TableCell,
  TableInfiniteScroll,
  TableRow,
  TableTools,
} from '@root/common/TableTools';
import { Paths } from '@root/consts';
import {
  addressFormat,
  hasDataAttribute,
  isModal,
  NotificationHelper,
  pathToUrl,
} from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { useCleanup, usePermission, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { type RecurrentOrder } from '@root/stores/recurrentOrder/RecurrentOrder';

import { getColorByStatus } from '../../helper';
import { RequestOptions } from '../../types';

const CustomerRecurrentOrders: React.FC<RequestOptions> = ({
  customerId,
  businessUnitId,
  query,
}) => {
  const { recurrentOrderStore } = useStores();
  const { formatDateTime, formatCurrency } = useIntl();
  const history = useHistory();

  const canViewOrders = usePermission('orders:view-all:perform');

  const loadMore = useCallback(
    () => recurrentOrderStore.requestByCustomer(+customerId, { query }),
    [recurrentOrderStore, customerId, query],
  );

  const handleSortChange = useCallback(() => {
    recurrentOrderStore.requestByCustomer(+customerId, { query });
  }, [customerId, query, recurrentOrderStore]);

  const handleRowClick = useCallback(
    (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>, order: RecurrentOrder) => {
      if (hasDataAttribute(e, 'skipEvent') || isModal(e)) {
        return;
      }

      const path = pathToUrl(Paths.CustomerRecurrentOrderModule.MainInformation, {
        businessUnit: businessUnitId,
        customerId,
        id: order.id,
      });

      recurrentOrderStore.selectEntity(order);

      history.push(path);
    },
    [businessUnitId, customerId, history, recurrentOrderStore],
  );

  useCleanup(recurrentOrderStore, 'id', 'desc');

  useEffect(() => {
    if (!canViewOrders) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
      recurrentOrderStore.markLoaded();

      return;
    }

    recurrentOrderStore.cleanup();
    recurrentOrderStore.requestByCustomer(+customerId, { query });
    recurrentOrderStore.requestCount(+customerId, { query });
  }, [canViewOrders, customerId, query, recurrentOrderStore]);

  return (
    <TableTools.ScrollContainer>
      <Table>
        <TableTools.Header>
          <TableTools.SortableHeaderCell
            sortKey="startDate"
            store={recurrentOrderStore}
            onSort={handleSortChange}
          >
            Start Date
          </TableTools.SortableHeaderCell>
          <TableTools.SortableHeaderCell
            sortKey="id"
            store={recurrentOrderStore}
            onSort={handleSortChange}
          >
            #
          </TableTools.SortableHeaderCell>
          <TableTools.SortableHeaderCell
            sortKey="status"
            store={recurrentOrderStore}
            onSort={handleSortChange}
          >
            Status
          </TableTools.SortableHeaderCell>
          <TableTools.HeaderCell>Job Site</TableTools.HeaderCell>
          <TableTools.HeaderCell>Frequency</TableTools.HeaderCell>
          <TableTools.SortableHeaderCell
            sortKey="nextServiceDate"
            store={recurrentOrderStore}
            onSort={handleSortChange}
          >
            Next Service Date
          </TableTools.SortableHeaderCell>
          <TableTools.SortableHeaderCell
            sortKey="grandTotal"
            store={recurrentOrderStore}
            onSort={handleSortChange}
            right
          >
            Price Per Order, $
          </TableTools.SortableHeaderCell>
        </TableTools.Header>
        <TableBody
          loading={recurrentOrderStore.loading}
          noResult={recurrentOrderStore.noResult}
          cells={7}
        >
          {recurrentOrderStore.values.map(order => (
            <TableRow
              selected={order.id === recurrentOrderStore.selectedEntity?.id}
              key={order.id}
              onClick={e => handleRowClick(e, order)}
            >
              <TableCell>
                <Typography>{formatDateTime(order.startDate).date}</Typography>
              </TableCell>
              <TableCell>
                <Typography color="information">{order.id}</Typography>
              </TableCell>
              <TableCell>
                <Badge borderRadius={2} color={getColorByStatus(order.status)}>
                  {startCase(order.status)}
                </Badge>
              </TableCell>
              <TableCell>
                <Typography color="information">{addressFormat(order.jobSite.address)}</Typography>
              </TableCell>
              <TableCell>
                <Typography>{startCase(order.frequencyType)}</Typography>
              </TableCell>

              <TableCell>{formatDateTime(order.nextServiceDate).date}</TableCell>
              <TableCell right>
                <Typography fontWeight="bold">{formatCurrency(order.grandTotal)}</Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TableInfiniteScroll
        onLoaderReached={loadMore}
        loaded={recurrentOrderStore.loaded}
        loading={recurrentOrderStore.loading}
        initialRequest={false}
      >
        Loading Recurrent Orders
      </TableInfiniteScroll>
    </TableTools.ScrollContainer>
  );
};

export default observer(CustomerRecurrentOrders);
