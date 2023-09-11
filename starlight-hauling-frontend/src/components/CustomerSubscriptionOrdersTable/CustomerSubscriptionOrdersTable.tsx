import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams, useRouteMatch } from 'react-router';
import { observer } from 'mobx-react-lite';

import { Table, TableBody, TableInfiniteScroll, TableTools } from '@root/common/TableTools';
import { SubscriptionOrderFilters } from '@root/common/TableTools/TableFilter/types';
import { Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useCleanup, useStores, useSubscriptionSelectedTab } from '@root/hooks';
import CustomerSubscriptionNonServiceOrderEditQuickView from '@root/quickViews/SubscriptionNonServiceOrderEditQuickView/CustomerSubscriptionNonServiceOrderEditQuickView';
import CustomerSubscriptionOrderDetails from '@root/quickViews/SubscriptionOrderDetails/CustomerSubscriptionOrderDetails';
import CustomerSubscriptionOrderEditQuickView from '@root/quickViews/SubscriptionOrderEdit/CustomerSubscriptionOrderEditQuickView';
import CustomerSubscriptionOrderQuickView from '@root/quickViews/SubscriptionOrderQuickView/CustomerSubscriptionOrderQuickView';
import SubscriptionWorkOrderEditQuickView from '@root/quickViews/SubscriptionWorkOrderEditQuickView/SubscriptionWorkOrderEditQuickView';
import SubscriptionWorkOrderQuickView from '@root/quickViews/SubscriptionWorkOrderQuickView/SubscriptionWorkOrderQuickView';
import { RequestOptionsBySubscriptionId } from '@root/stores/subscriptionOrder/types';
import { SubscriptionOrderStatusEnum } from '@root/types';

import CustomerSubscriptionNavigation from '../PageLayouts/CustomerSubscriptionLayout/components/CustomerSubscriptionNavigation/CustomerSubscriptionNavigation';
import { CustomerSubscriptionParams } from '../PageLayouts/CustomerSubscriptionLayout/types';

import SubscriptionOrderRow from './components/SubscriptionOrderRow/SubscriptionOrderRow';
import SubscriptionOrdersFilter from './components/SubscriptionOrdersFilter/SubscriptionOrdersFilter';
import { TableHeader } from './components/TableHeader/TableHeader';
// TODO rename module to CustomerSubscriptionOrdersTable

const I18N_PATH = `components.CustomerSubscriptionOrdersTable.Text.`;
const CustomerSubscriptionOrdersTable: React.FC = () => {
  const { t } = useTranslation();
  const { subscriptionOrderStore, subscriptionWorkOrderStore } = useStores();
  const { subscriptionId, subscriptionOrderId, customerId } =
    useParams<CustomerSubscriptionParams>();

  const [filterState, setFilterState] = useState<SubscriptionOrderFilters>({});
  const history = useHistory();
  const { businessUnitId } = useBusinessContext();

  const isSubscriptionOrderDetailsOpen = subscriptionOrderStore.detailsOpen;
  const isWorkOrderEditViewOpen = subscriptionWorkOrderStore.isWorkOrderEditViewOpen;
  const selectedTab = useSubscriptionSelectedTab();

  const isOrderDetailsPath = !!useRouteMatch(Paths.CustomerSubscriptionModule.OrderDetails);

  useEffect(() => {
    if (isOrderDetailsPath && subscriptionOrderId) {
      subscriptionOrderStore.requestById(+subscriptionOrderId);

      const newPath = pathToUrl(Paths.CustomerSubscriptionModule.Orders, {
        customerId,
        businessUnit: businessUnitId,
        tab: selectedTab,
        subscriptionId,
        subscriptionOrderId: undefined,
      });

      history.replace(newPath);
    }
  }, [
    isOrderDetailsPath,
    subscriptionOrderId,
    subscriptionOrderStore,
    history,
    customerId,
    businessUnitId,
    selectedTab,
    subscriptionId,
  ]);

  const requestParams: RequestOptionsBySubscriptionId = useMemo(() => {
    const { filterByStatus, ...filters } = filterState;
    const filterNeedsApproval = !!filterByStatus?.some(
      status => status === SubscriptionOrderStatusEnum.needsApproval,
    );
    const filterCompleted = !!filterByStatus?.some(
      status => status === SubscriptionOrderStatusEnum.completed,
    );

    return {
      subscriptionId: +subscriptionId,
      filterData: {
        ...filters,
        ...((filterNeedsApproval || filterCompleted) && {
          needsApproval: filterNeedsApproval,
          completed: filterCompleted,
        }),
      },
    };
  }, [filterState, subscriptionId]);

  useEffect(() => {
    subscriptionOrderStore.cleanup();
    subscriptionOrderStore.requestBySubscriptionId(requestParams);
  }, [subscriptionOrderStore, requestParams]);

  useCleanup(subscriptionOrderStore);

  const handleFetchOrders = useCallback(() => {
    subscriptionOrderStore.requestBySubscriptionId(requestParams);
  }, [requestParams, subscriptionOrderStore]);

  const isDetailsViewOpen = subscriptionOrderStore.quickViewCondition;
  const isEditViewOpen = subscriptionOrderStore.editOpen;
  const isNonServiceEditOpen = subscriptionOrderStore.isNonServiceEditOpen;

  const tableContainerRef = useRef<HTMLTableElement>(null);
  const subscriptionNavigationRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <CustomerSubscriptionNavigation ref={subscriptionNavigationRef} filterable>
        <SubscriptionOrdersFilter onApply={setFilterState} />
      </CustomerSubscriptionNavigation>
      <TableTools.ScrollContainer ref={tableContainerRef}>
        <CustomerSubscriptionOrderQuickView
          tableContainerRef={tableContainerRef}
          condition={
            isDetailsViewOpen ||
            subscriptionOrderStore.isNonServiceEditOpen ||
            subscriptionWorkOrderStore.isWorkOrderEditViewOpen
          }
          store={subscriptionOrderStore}
          closeOnClick={
            subscriptionOrderStore.quickViewCondition
              ? !subscriptionWorkOrderStore.quickViewCondition
              : false
          }
          shouldDeselect={!isEditViewOpen ? !isSubscriptionOrderDetailsOpen : undefined}
        />
        <SubscriptionWorkOrderQuickView
          tableContainerRef={tableContainerRef}
          condition={subscriptionWorkOrderStore.quickViewCondition}
          store={subscriptionWorkOrderStore}
        />
        <CustomerSubscriptionOrderEditQuickView
          tbodyContainerRef={tableContainerRef}
          tableScrollContainerRef={tableContainerRef}
          condition={isEditViewOpen}
          store={subscriptionOrderStore}
        />
        <SubscriptionWorkOrderEditQuickView
          tbodyContainerRef={tableContainerRef}
          tableScrollContainerRef={tableContainerRef}
          condition={isWorkOrderEditViewOpen}
          store={subscriptionWorkOrderStore}
        />
        <CustomerSubscriptionNonServiceOrderEditQuickView
          tbodyContainerRef={tableContainerRef}
          tableScrollContainerRef={tableContainerRef}
          condition={isNonServiceEditOpen}
          store={subscriptionOrderStore}
        />
        <CustomerSubscriptionOrderDetails
          tableContainerRef={tableContainerRef}
          condition={isSubscriptionOrderDetailsOpen}
          store={subscriptionOrderStore}
        />
        <Table>
          <TableHeader requestOptions={requestParams} />
          <TableBody
            loading={subscriptionOrderStore.loading}
            noResult={subscriptionOrderStore.noResult}
            cells={8}
          >
            {subscriptionOrderStore.values.map(subscriptionOrder => (
              <SubscriptionOrderRow
                key={subscriptionOrder.id}
                subscriptionOrder={subscriptionOrder}
              />
            ))}
          </TableBody>
        </Table>

        <TableInfiniteScroll
          onLoaderReached={handleFetchOrders}
          loaded={subscriptionOrderStore.loaded}
          loading={subscriptionOrderStore.loading}
          initialRequest={false}
        >
          {t(`${I18N_PATH}LoadingOrders`)}
        </TableInfiniteScroll>
      </TableTools.ScrollContainer>
    </>
  );
};

export default observer(CustomerSubscriptionOrdersTable);
