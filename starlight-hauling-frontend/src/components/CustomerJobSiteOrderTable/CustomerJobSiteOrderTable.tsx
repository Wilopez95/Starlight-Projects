/* eslint-disable @typescript-eslint/unbound-method */
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import {
  AdditionalOrderData,
  useAdditionalOrderData,
} from '@starlightpro/recycling/hooks/useAdditionalOrderData';
import { Checkbox } from '@starlightpro/shared-components';
import { TFunctionResult } from 'i18next';
import { noop, startCase } from 'lodash-es';
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
import { MediaType } from '@root/components/OrderTable/components/MediaSection/types';
import {
  getColorByStatus,
  hasDataAttribute,
  isModal,
  NotificationHelper,
  pathToUrl,
} from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { mathRound2 } from '@root/helpers/rounding';
import {
  useBoolean,
  useBusinessContext,
  useCleanup,
  useIsRecyclingFacilityBU,
  usePermission,
  useStores,
} from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import {
  CustomerOrderDetailsQuickView,
  OrderDetails,
  OrderEdit,
  OrderHistoryQuickView,
} from '@root/quickViews';
import { type Order } from '@root/stores/entities';

import { IOrdersPageParams, IOrderTable } from './types';

import styles from './css/styles.scss';

const I18N_BASE = 'components.PageLayouts.CustomerLayout.CustomerJobSiteOrdersTable.Text.';

const CustomerJobSiteOrderTable: React.FC<IOrderTable> = ({ onRequest, basePath }) => {
  const { orderStore } = useStores();
  const { formatCurrency, formatDateTime } = useIntl();
  const { t } = useTranslation();
  const [isOrderHistoryOpen, openOrderHistory, closeOrderHistory] = useBoolean();

  const isRecyclingBU = useIsRecyclingFacilityBU();
  const { businessUnitId } = useBusinessContext();
  const { id: orderId, jobSiteId, customerId } = useParams<IOrdersPageParams>();

  const currentOrder = orderStore.selectedEntity;

  useCleanup(orderStore, 'id', 'desc');

  const handleAdditionalOrderData = (data?: AdditionalOrderData[]) => {
    orderStore.setAdditionalRecyclingValues(data ?? []);
  };

  const fetchRecyclingQuery = useAdditionalOrderData({
    onOrdersResponse: handleAdditionalOrderData,
  });
  const fetchAdditionalOrderData = isRecyclingBU ? fetchRecyclingQuery : undefined;

  useEffect(() => {
    if (jobSiteId) {
      orderStore.cleanup();
    }
  }, [jobSiteId, orderStore]);

  const canViewOrders = usePermission('orders:view-all:perform');

  useEffect(() => {
    if (!canViewOrders) {
      return;
    }

    if (orderId) {
      orderStore.requestDetails({
        orderId: +orderId,
        edit: true,
        shouldOpenQuickView: true,
      });
    } else {
      orderStore.unSelectEntity();
    }
  }, [orderStore, orderId, canViewOrders]);

  useEffect(() => {
    if (!canViewOrders) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
      orderStore.markLoaded();

      return;
    }

    onRequest(fetchAdditionalOrderData);
  }, [canViewOrders, fetchAdditionalOrderData, onRequest, orderStore]);

  const handleSortChange = useCallback(() => {
    onRequest(fetchAdditionalOrderData);
  }, [fetchAdditionalOrderData, onRequest]);

  const handleLoaderReached = useCallback(
    () => onRequest(fetchAdditionalOrderData),
    [onRequest, fetchAdditionalOrderData],
  );

  const handleRowClick = useCallback(
    (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>, order: Order) => {
      if (hasDataAttribute(e, 'skipEvent') || isModal(e)) {
        return;
      }

      orderStore.selectEntity(order);
    },
    [orderStore],
  );

  const handleCloseOrderHistory = useCallback(() => {
    closeOrderHistory();
    orderStore.toggleQuickView(true);
  }, [closeOrderHistory, orderStore]);

  const woNumber = useCallback(
    (order: Order): number | TFunctionResult => {
      if (order.workOrder?.woNumber === -1 && !order.recyclingWONumber) {
        return t('Text.Pending');
      }

      return isRecyclingBU ? order.recyclingWONumber : order.workOrder?.woNumber;
    },
    [isRecyclingBU, t],
  );

  return (
    <TableTools.ScrollContainer className={styles.tableContainer}>
      <CustomerOrderDetailsQuickView
        isOpen={
          orderStore.isOpenQuickView ||
          orderStore.editOpen ||
          orderStore.detailsOpen ||
          isOrderHistoryOpen
        }
        onOpenHistory={openOrderHistory}
        openUrl={pathToUrl(basePath, {
          businessUnit: businessUnitId,
          customerId,
          jobSiteId,
          id: currentOrder?.id,
        })}
        closeUrl={pathToUrl(basePath, {
          businessUnit: businessUnitId,
          customerId,
          jobSiteId,
        })}
      />
      <OrderHistoryQuickView
        isOpen={isOrderHistoryOpen}
        onClose={handleCloseOrderHistory}
        orderId={currentOrder?.id}
      />
      <OrderEdit
        isOpen={orderStore.editOpen}
        shouldDeselect={false}
        onClose={orderStore.closeCustomerDetails}
      />
      <OrderDetails
        isOpen={orderStore.detailsOpen}
        onClose={orderStore.closeCustomerDetails}
        shouldDeselect={false}
        shouldRemoveOrderFromStore={false}
      />
      <Table>
        <TableTools.Header>
          <TableTools.SortableHeaderCell
            store={orderStore}
            sortKey="serviceDate"
            onSort={handleSortChange}
          >
            {t(`${I18N_BASE}ServiceDate`)}
          </TableTools.SortableHeaderCell>
          <TableTools.SortableHeaderCell store={orderStore} sortKey="id" onSort={handleSortChange}>
            {t(`${I18N_BASE}OrderNumber`)}
          </TableTools.SortableHeaderCell>
          {!isRecyclingBU ? (
            <TableTools.SortableHeaderCell
              store={orderStore}
              sortKey="lineOfBusiness"
              onSort={handleSortChange}
            >
              {t(`${I18N_BASE}LineOfBusiness`)}
            </TableTools.SortableHeaderCell>
          ) : null}
          <TableTools.SortableHeaderCell
            store={orderStore}
            sortKey="woNumber"
            onSort={handleSortChange}
          >
            {t(`${I18N_BASE}WONumber`)}
          </TableTools.SortableHeaderCell>
          <TableTools.SortableHeaderCell
            store={orderStore}
            sortKey="status"
            onSort={handleSortChange}
          >
            {t(`${I18N_BASE}Status`)}
          </TableTools.SortableHeaderCell>
          {!isRecyclingBU ? (
            <TableTools.HeaderCell>{t(`${I18N_BASE}Media`)}</TableTools.HeaderCell>
          ) : null}
          <TableTools.SortableHeaderCell
            store={orderStore}
            sortKey="service"
            onSort={handleSortChange}
          >
            {t(`${I18N_BASE}Service`)}
          </TableTools.SortableHeaderCell>
          {isRecyclingBU ? (
            <TableTools.HeaderCell>{t(`${I18N_BASE}NetWeight`)}</TableTools.HeaderCell>
          ) : null}
          <TableTools.SortableHeaderCell
            store={orderStore}
            sortKey="material"
            onSort={handleSortChange}
          >
            {t(`${I18N_BASE}Material`)}
          </TableTools.SortableHeaderCell>
          {isRecyclingBU ? (
            <>
              <TableTools.HeaderCell>{t(`${I18N_BASE}Graded`)}</TableTools.HeaderCell>
              <TableTools.HeaderCell>{t(`${I18N_BASE}TicketNumber`)}</TableTools.HeaderCell>
            </>
          ) : null}

          <TableTools.SortableHeaderCell
            store={orderStore}
            sortKey="total"
            onSort={handleSortChange}
            right
          >
            {t(`${I18N_BASE}Total`)}
          </TableTools.SortableHeaderCell>
        </TableTools.Header>
        <TableBody loading={orderStore.loading} noResult={orderStore.noResult} cells={9}>
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
              {!isRecyclingBU ? (
                <TableCell>
                  <Typography color="information">{order?.businessLine?.name}</Typography>
                </TableCell>
              ) : null}
              <TableCell>
                <Typography>{woNumber(order)}</Typography>
              </TableCell>
              <TableCell>
                <Badge borderRadius={2} color={getColorByStatus(order.status)}>
                  {startCase(order.status)}
                </Badge>
              </TableCell>
              {!isRecyclingBU ? (
                <TableCell fallback="" titleClassName={styles.ticketCell}>
                  {order.mediaFilesCount > 0 ? <MediaSection order={order} /> : null}
                </TableCell>
              ) : null}
              <TableCell>{order.billableService?.description}</TableCell>
              {isRecyclingBU ? <TableCell>{mathRound2(order.netWeight ?? 0)}</TableCell> : null}
              <TableCell>{order.material?.description}</TableCell>
              {isRecyclingBU ? (
                <>
                  <TableCell>
                    {order.graded ? (
                      <Checkbox name="graded" value={order.graded} onChange={noop} disabled />
                    ) : null}
                  </TableCell>
                  <TableCell fallback="" titleClassName={styles.ticketCell}>
                    {order.hasWeightTicket ? (
                      <MediaSection order={order} mediaType={MediaType.Ticket} />
                    ) : null}
                  </TableCell>
                </>
              ) : null}
              <TableCell right>
                <Typography fontWeight="bold">{formatCurrency(order.grandTotal)}</Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TableInfiniteScroll
        onLoaderReached={handleLoaderReached}
        loaded={orderStore.loaded}
        loading={orderStore.loading}
        initialRequest={false}
      >
        {t(`${I18N_BASE}LoadingOrders`)}
      </TableInfiniteScroll>
    </TableTools.ScrollContainer>
  );
};

export default observer(CustomerJobSiteOrderTable);
