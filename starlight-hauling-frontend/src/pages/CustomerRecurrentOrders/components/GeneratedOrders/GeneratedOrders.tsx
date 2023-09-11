import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router';
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
import { MediaSection } from '@root/components/OrderTable/components';
import { Paths } from '@root/consts';
import {
  getColorByStatus,
  hasDataAttribute,
  isModal,
  NotificationHelper,
  pathToUrl,
} from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { useCleanup, usePermission, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { type Order } from '@root/stores/entities';

const I18N_PATH = 'pages.CustomerRecurrentOrders.tables.GeneratedOrders.Text.';

const CustomerGeneratedOrders: React.FC = () => {
  const { orderStore, recurrentOrderStore } = useStores();
  const { formatCurrency, formatDateTime } = useIntl();
  const { t } = useTranslation();
  const history = useHistory();
  const { id } = useParams<{ id: string }>();

  const selectedRecurrentOrder = recurrentOrderStore.selectedEntity;

  const canViewOrders = usePermission('orders:view-all:perform');

  useCleanup(orderStore);

  useEffect(() => {
    if (id && !selectedRecurrentOrder?.id) {
      recurrentOrderStore.requestById(+id);
    }
  }, [id, recurrentOrderStore, selectedRecurrentOrder?.id]);

  const loadMore = useCallback(() => {
    if (!canViewOrders) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
      orderStore.markLoaded();

      return;
    }
    orderStore.requestGeneratedOrders(+id);
  }, [canViewOrders, id, orderStore]);

  useEffect(() => {
    if (!canViewOrders) {
      return;
    }

    if (id) {
      orderStore.requestGeneratedOrders(+id);
    } else {
      orderStore.unSelectEntity();
    }
  }, [orderStore, id, canViewOrders]);

  useEffect(() => {
    loadMore();
  }, [loadMore]);

  const handleSortChange = useCallback(() => {
    orderStore.requestGeneratedOrders(+id);
  }, [id, orderStore]);

  const handleRowClick = useCallback(
    (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>, order: Order) => {
      if (hasDataAttribute(e, 'skipEvent') || isModal(e)) {
        return;
      }

      const path = pathToUrl(Paths.CustomerJobSiteModule.OpenOrders, {
        businessUnit: selectedRecurrentOrder?.businessUnit.id,
        customerId: selectedRecurrentOrder?.customer.originalId,
        jobSiteId: selectedRecurrentOrder?.jobSite.originalId,
        id: order.id,
      });

      history.push(path);
    },
    [
      history,
      selectedRecurrentOrder?.businessUnit.id,
      selectedRecurrentOrder?.customer.originalId,
      selectedRecurrentOrder?.jobSite.originalId,
    ],
  );

  return (
    <TableTools.ScrollContainer>
      <Table>
        <TableTools.Header>
          <TableTools.SortableHeaderCell
            sortKey="serviceDate"
            onSort={handleSortChange}
            store={orderStore}
          >
            {t(`${I18N_PATH}ServiceDate`)}
          </TableTools.SortableHeaderCell>
          <TableTools.HeaderCell>{t(`${I18N_PATH}Order`)}</TableTools.HeaderCell>
          <TableTools.HeaderCell>{t(`${I18N_PATH}WO`)}</TableTools.HeaderCell>
          <TableTools.HeaderCell>{t(`${I18N_PATH}Status`)}</TableTools.HeaderCell>
          <TableTools.HeaderCell>{t(`${I18N_PATH}Ticket`)}</TableTools.HeaderCell>
          <TableTools.HeaderCell>{t(`${I18N_PATH}Service`)}</TableTools.HeaderCell>
          <TableTools.HeaderCell>{t(`${I18N_PATH}Material`)}</TableTools.HeaderCell>

          <TableTools.HeaderCell right>{t(`${I18N_PATH}Total`)}, $</TableTools.HeaderCell>
        </TableTools.Header>
        <TableBody loading={orderStore.loading} noResult={orderStore.noResult} cells={8}>
          {orderStore.values.map(order => (
            <TableRow
              selected={order.id === orderStore.selectedEntity?.id}
              key={order.id}
              onClick={e => handleRowClick(e, order)}
            >
              <TableCell>
                <Typography>{formatDateTime(order.serviceDate).date}</Typography>
              </TableCell>
              <TableCell>
                <Typography color="information">{order.id}</Typography>
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
              <TableCell fallback="">
                {order.mediaFilesCount !== 0 ? <MediaSection order={order} /> : null}
              </TableCell>
              <TableCell>{order.billableService?.description}</TableCell>
              <TableCell>{order.material?.description}</TableCell>
              <TableCell right>
                <Typography fontWeight="bold">{formatCurrency(order.grandTotal)}</Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TableInfiniteScroll
        onLoaderReached={loadMore}
        loaded={orderStore.loaded}
        loading={orderStore.loading}
        initialRequest={false}
      >
        {t(`${I18N_PATH}LoadingGeneratedOrders`)}
      </TableInfiniteScroll>
    </TableTools.ScrollContainer>
  );
};

export default observer(CustomerGeneratedOrders);
