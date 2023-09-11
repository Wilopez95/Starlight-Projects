import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { observer } from 'mobx-react-lite';

import { RoutingNavigationItem } from '@root/common/RoutingNavigation';
import {
  Table,
  TableBody,
  TableInfiniteScroll,
  TablePageContainer,
  TableTools,
} from '@root/common/TableTools';
import { AppliedFilterState } from '@root/common/TableTools/TableFilter';
import { OrderStatusRoutes, Paths } from '@root/consts';
import { NotificationHelper, pathToUrl } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import {
  InvoicingStatusModal,
  RunInvoicingQuickView,
} from '@root/modules/billing/Invoices/components';
import { type GenerateInvoicesRequest } from '@root/modules/billing/types';
import { OrderDetails, OrderEdit, OrderQuickView } from '@root/quickViews';
import { RequestOptions } from '@root/stores/order/types';
import { ReminderTypes } from '@root/types';
import {
  useBoolean,
  useBusinessContext,
  useCleanup,
  useCrudPermissions,
  usePermission,
  useStores,
} from '@hooks';

import { Header, OrderFilters, OrderRow, TableHeader } from './components';
import { isSelectableStatus, validateOrderStatusParams } from './helpers';
import { ChangeStatusModal } from './modals';
import { baseRoutingConfig } from './navigationConfig';
import { IOrderTable, IOrderTableParams } from './types';

import styles from './css/styles.scss';

const OrderTable: React.FC<IOrderTable> = ({ mine = false }) => {
  const { orderStore, customerGroupStore, customerStore, reminderStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const history = useHistory();
  const { subPath: currentStatus, orderId } = useParams<IOrderTableParams>();

  const [isOpenInvoiceView, openInvoiceView, closeInvoiceView] = useBoolean();
  const [isChangeStatusOpen, openChangeStatus, closeChangeStatus] = useBoolean();
  const [isInvoicingSummaryOpen, openInvoicingSummary, closeInvoicingSummary] = useBoolean();

  const [invalidCount, setInvalidCount] = useState(0);
  const [filterState, setFilterState] = useState<AppliedFilterState>({});
  const [search, setSearch] = useState<string>();
  const [invoicingRequestData, setInvoicingRequestData] = useState<GenerateInvoicesRequest>();

  const pageContainer = useRef<HTMLDivElement>(null);

  const ordersContainerRef = useRef<HTMLTableSectionElement>(null);

  useCleanup(customerStore);
  useCleanup(orderStore, 'id', 'desc');

  const counts = orderStore.getCounts(mine);
  const isSelectable = isSelectableStatus(currentStatus);

  const canViewAllOrders = usePermission('orders:view-all:perform');
  const canViewOwnOrders = usePermission('orders:view-own:perform');
  const canCompleteOrders = usePermission('orders:complete:perform');
  const canApproveOrders = usePermission('orders:approve:perform');

  const [canViewCustomerGroups] = useCrudPermissions('configuration', 'customer-groups');
  const canViewCustomers = usePermission('customers:view:perform');
  const canViewCurrentTab = mine ? canViewOwnOrders : canViewAllOrders;
  const order = orderStore.selectedEntity!;

  useLayoutEffect(() => {
    if (!validateOrderStatusParams(currentStatus, false)) {
      const basePath = mine ? Paths.OrderModule.MyOrders : Paths.OrderModule.Orders;

      const path = pathToUrl(basePath, {
        businessUnit: businessUnitId,
        subPath: OrderStatusRoutes.InProgress,
      });

      history.push(path);
    }
  }, [businessUnitId, currentStatus, history, mine]);

  const requestParams: RequestOptions = useMemo(
    () => ({
      businessUnitId,
      mine,
      filterData: filterState,
      query: search,
      status: currentStatus,
    }),
    [businessUnitId, mine, filterState, search, currentStatus],
  );

  useEffect(() => {
    orderStore.cleanup();

    if (canViewCurrentTab) {
      orderStore.request(requestParams);
      orderStore.requestCount(requestParams);
    } else {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
      orderStore.markLoaded();
    }
  }, [canViewCurrentTab, mine, orderStore, requestParams]);

  useEffect(() => {
    if (
      currentStatus === 'finalized' &&
      canViewCustomers &&
      canViewCustomerGroups &&
      canViewCurrentTab
    ) {
      customerGroupStore.request();
      customerStore.request({ businessUnitId });
    }
  }, [
    currentStatus,
    customerGroupStore,
    customerStore,
    businessUnitId,
    canViewCustomers,
    canViewCustomerGroups,
    canViewCurrentTab,
  ]);

  useEffect(() => {
    if (order?.id) {
      (async () => {
        await reminderStore.getReminderScheduleBy(order.id, ReminderTypes.OrderAnnualEventReminder);
      })();
    }
  }, [reminderStore, order?.id]);

  useEffect(() => {
    if (canViewCurrentTab && orderId) {
      orderStore.requestById(+orderId);
    }
  }, [canViewCurrentTab, orderStore, orderId]);

  const loadMore = useCallback(() => {
    if (canViewCurrentTab) {
      orderStore.request(requestParams);
    }
  }, [canViewCurrentTab, orderStore, requestParams]);

  const handleUnapproveMultiple = useCallback(() => {
    if (orderStore.checkedOrders.length > 0) {
      orderStore.unapproveMultiple(
        orderStore.checkedOrders.map(orderInfo => orderInfo.id),
        requestParams,
      );
    }
  }, [orderStore, requestParams]);

  const handleChangeStatus = useCallback(async () => {
    if (orderStore.getTabSize(currentStatus, mine) > 0) {
      let count = 0;
      const ids =
        orderStore.checkedOrders.length > 0
          ? orderStore.checkedOrders.map(orderInfo => orderInfo.id)
          : null;

      if (currentStatus === 'completed') {
        count = await orderStore.validateAndApproveMultiple(ids, requestParams);
      } else if (currentStatus === 'approved') {
        count = await orderStore.validateAndFinalizeMultiple(ids, requestParams);
      }
      setInvalidCount(count);
      if (count > 0) {
        openChangeStatus();
      }
    }
  }, [orderStore, currentStatus, mine, openChangeStatus, requestParams]);

  const handleInvoicesGenerated = useCallback(() => {
    orderStore.cleanup();
    if (canViewCurrentTab) {
      Promise.all([orderStore.requestCount(requestParams), orderStore.request(requestParams)]);
    }
  }, [canViewCurrentTab, orderStore, requestParams]);

  const handleInvoicesSave = useCallback(
    (data: GenerateInvoicesRequest) => {
      setInvoicingRequestData(data);
      openInvoicingSummary();
    },
    [openInvoicingSummary],
  );

  const handleInvoicingSummaryClose = useCallback(() => {
    setInvoicingRequestData(undefined);
    closeInvoicingSummary();
  }, [closeInvoicingSummary]);

  const routingNavigationConfig = baseRoutingConfig.map<RoutingNavigationItem>(route => {
    const currentSize = orderStore.getTabSize(route.value, mine);
    const baseRoute = mine ? Paths.OrderModule.MyOrders : Paths.OrderModule.Orders;

    return {
      content: `${route.label}・${currentSize}`,
      to: pathToUrl(baseRoute, {
        businessUnit: businessUnitId,
        subPath: route.value,
      }),
    };
  });

  return (
    <TablePageContainer ref={pageContainer}>
      <Header
        onChangeStatus={handleChangeStatus}
        onInvoiceAll={openInvoiceView}
        onUnapproveMultiple={handleUnapproveMultiple}
        requestParams={requestParams}
      />
      {(currentStatus === 'completed' && canCompleteOrders) ||
      (currentStatus === 'approved' && canApproveOrders) ? (
        <ChangeStatusModal
          invalidCount={invalidCount}
          isOpen={isChangeStatusOpen}
          onClose={closeChangeStatus}
          status={currentStatus}
          requestOptions={requestParams}
        />
      ) : null}
      {currentStatus === 'finalized' && invoicingRequestData ? (
        <InvoicingStatusModal
          data={invoicingRequestData}
          onInvoicesGenerated={handleInvoicesGenerated}
          isOpen={isInvoicingSummaryOpen}
          onClose={handleInvoicingSummaryClose}
        />
      ) : null}
      <OrderDetails
        isOpen={orderStore.detailsOpen}
        onAfterClose={orderStore.openNextDetails}
        shouldRemoveOrderFromStore
      />
      <OrderEdit isOpen={orderStore.editOpen} />
      <OrderQuickView
        clickOutContainers={ordersContainerRef}
        isOpen={orderStore.isOpenQuickView}
        shouldDeselect={!(orderStore.detailsOpen || orderStore.editOpen)}
      />
      <RunInvoicingQuickView
        isOpen={isOpenInvoiceView}
        onClose={closeInvoiceView}
        onInvoicesSave={handleInvoicesSave}
      />
      <TableTools.ScrollContainer>
        <TableTools.HeaderNavigation
          placeholder="Search orders"
          onSearch={setSearch}
          routes={routingNavigationConfig}
          filterable
        >
          <OrderFilters onApply={setFilterState} />
        </TableTools.HeaderNavigation>
        <Table>
          <TableHeader selectable={isSelectable} requestOptions={requestParams} />
          <TableBody
            className={styles.rows}
            ref={ordersContainerRef}
            loading={orderStore.loading}
            noResult={orderStore.noResult}
            cells={isSelectable ? 11 : 10}
          >
            {orderStore.values.map(orderInfo => (
              <OrderRow key={orderInfo.id} order={orderInfo} isSelectable={isSelectable} />
            ))}
          </TableBody>
        </Table>
        {counts ? (
          <TableInfiniteScroll
            onLoaderReached={loadMore}
            loaded={orderStore.loaded}
            loading={orderStore.loading}
          >
            Loading Orders
          </TableInfiniteScroll>
        ) : null}
      </TableTools.ScrollContainer>
    </TablePageContainer>
  );
};

export default observer(OrderTable);
