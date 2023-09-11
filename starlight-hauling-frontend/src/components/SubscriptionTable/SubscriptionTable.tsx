import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { isEqual } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import {
  Table,
  TableBody,
  TableInfiniteScroll,
  TablePageContainer,
  TableTools,
} from '@root/common/TableTools';
import { AppliedFilterState } from '@root/common/TableTools/TableFilter';
import { Paths, SubscriptionTabRoutes } from '@root/consts';
import { NotificationHelper, pathToUrl } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { SubscriptionQuickView } from '@root/quickViews';
import { getSubscriptionStatusByTab } from '@root/stores/subscription/helpers';
import { RequestOptions } from '@root/stores/subscription/types';
import {
  useBusinessContext,
  useCrudPermissions,
  useStores,
  useSubscriptionSelectedTab,
  useSubscriptionStatusValidation,
} from '@hooks';

import { DraftTableData, Header, SubscriptionFilters, TableData } from './components';
import { baseRoutingConfig } from './navigationConfig';
import { ISubscriptionTable, SubscriptionsRouteParams } from './types';

const I18N_PATH = 'components.SubscriptionTable.Text.';

const SubscriptionTable: React.FC<ISubscriptionTable> = ({ mine = false }) => {
  const [filterState, setFilterState] = useState<AppliedFilterState>({});
  const { subscriptionStore, subscriptionDraftStore } = useStores();
  const { subscriptionId } = useParams<SubscriptionsRouteParams>();

  const selectedTab = useSubscriptionSelectedTab();
  const { businessUnitId } = useBusinessContext();
  const { t } = useTranslation();
  const [canViewAllSubscriptions] = useCrudPermissions('subscriptions', 'all');
  const [canViewOwnSubscriptions] = useCrudPermissions('subscriptions', 'own');
  const canViewCurrentTab = mine ? canViewOwnSubscriptions : canViewAllSubscriptions;

  const pageContainer = useRef<HTMLDivElement>(null);

  const isDraftTab = selectedTab === SubscriptionTabRoutes.Draft;
  const isActiveTab = selectedTab === SubscriptionTabRoutes.Active;

  const bodyContainerRef = useRef<HTMLTableSectionElement>(null);

  const store = isDraftTab ? subscriptionDraftStore : subscriptionStore;

  const routingNavigationConfig = baseRoutingConfig.map(route => {
    const baseRoute = mine
      ? Paths.SubscriptionModule.MySubscriptions
      : Paths.SubscriptionModule.Subscriptions;

    const currentSize: number = canViewCurrentTab
      ? route.value === SubscriptionTabRoutes.Draft
        ? subscriptionDraftStore.getCounts(mine)?.total ?? 0
        : subscriptionStore.getCountByStatus(route.status, mine)
      : 0;

    return {
      content: `${route.label}・${currentSize}`,
      to: pathToUrl(baseRoute, {
        businessUnit: businessUnitId,
        tab: route.value,
      }),
    };
  });

  useSubscriptionStatusValidation(mine);

  const requestParams = useMemo(() => {
    const params: RequestOptions = {
      mine,
      businessUnitId,
      filterData: filterState,
    };

    if (selectedTab !== SubscriptionTabRoutes.Draft) {
      params.status = getSubscriptionStatusByTab(selectedTab);
    }

    return params;
  }, [businessUnitId, mine, filterState, selectedTab]);

  const handleSearch = useCallback(
    (search: string) => {
      store.requestSearch(search, requestParams);
    },
    [store, requestParams],
  );

  const loadMore = useCallback(() => {
    if (canViewCurrentTab) {
      store.request(requestParams);
    } else {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
      store.markLoaded();
    }
  }, [store, requestParams, canViewCurrentTab]);

  useEffect(() => {
    if (canViewCurrentTab && subscriptionId) {
      subscriptionStore.requestById(+subscriptionId);
    }
  }, [canViewCurrentTab, subscriptionStore, subscriptionId]);

  useEffect(() => {
    store.cleanup();
    loadMore();

    return () => {
      store.cleanup();
    };
  }, [store, loadMore]);

  useEffect(() => {
    store.getAllAvailableFilters(businessUnitId);
  }, [store, businessUnitId]);

  const handleFiltersApply = (filters: AppliedFilterState) => {
    if (!isEqual(filterState, filters)) {
      setFilterState(filters);
    }
  };
  const handleSortChange = useCallback(() => {
    if (!store.search) {
      store.cleanup();
      store.request(requestParams);
    } else {
      handleSearch(store.search);
    }
  }, [store, requestParams]);

  return (
    <TablePageContainer ref={pageContainer}>
      <Header mine={mine} />

      {!isDraftTab ? (
        <SubscriptionQuickView
          mine={mine}
          tableScrollContainerRef={pageContainer}
          tbodyContainerRef={bodyContainerRef}
          condition={subscriptionStore.quickViewCondition}
          store={subscriptionStore}
          shouldDeselect={!(subscriptionStore.detailsOpen || subscriptionStore.editOpen)}
        />
      ) : null}
      <TableTools.ScrollContainer
        tableNavigation={
          <TableTools.HeaderNavigation
            routes={routingNavigationConfig}
            placeholder={t(`${I18N_PATH}SearchSubscriptions`)}
            onSearch={handleSearch}
            filterable
          >
            <SubscriptionFilters relatedStore={store} onApply={handleFiltersApply} />
          </TableTools.HeaderNavigation>
        }
      >
        <Table>
          {isDraftTab ? (
            <>
              <TableTools.Header>
                <TableTools.SortableHeaderCell
                  store={subscriptionDraftStore}
                  onSort={handleSortChange}
                  sortKey="startDate"
                >
                  Start Date
                </TableTools.SortableHeaderCell>
                <TableTools.SortableHeaderCell
                  store={subscriptionDraftStore}
                  onSort={handleSortChange}
                  sortKey="id"
                >
                  #
                </TableTools.SortableHeaderCell>
                <TableTools.SortableHeaderCell
                  store={subscriptionDraftStore}
                  onSort={handleSortChange}
                  sortKey="businessLine"
                >
                  Line of Business
                </TableTools.SortableHeaderCell>
                <TableTools.SortableHeaderCell
                  store={subscriptionDraftStore}
                  onSort={handleSortChange}
                  sortKey="service"
                >
                  Service
                </TableTools.SortableHeaderCell>
                <TableTools.SortableHeaderCell
                  store={subscriptionDraftStore}
                  onSort={handleSortChange}
                  sortKey="serviceFrequency"
                >
                  Service Frequency
                </TableTools.SortableHeaderCell>
                {isActiveTab ? (
                  <TableTools.SortableHeaderCell
                    store={subscriptionDraftStore}
                    onSort={handleSortChange}
                    sortKey="nextServiceDate"
                  >
                    Next Service Date
                  </TableTools.SortableHeaderCell>
                ) : null}
                <TableTools.SortableHeaderCell
                  store={subscriptionDraftStore}
                  onSort={handleSortChange}
                  sortKey="customerName"
                >
                  Customer
                </TableTools.SortableHeaderCell>
                <TableTools.SortableHeaderCell
                  store={subscriptionDraftStore}
                  onSort={handleSortChange}
                  sortKey="billingCyclePrice"
                >
                  Price Per Billing Cycle, $
                </TableTools.SortableHeaderCell>
                <TableTools.SortableHeaderCell
                  store={subscriptionDraftStore}
                  onSort={handleSortChange}
                  sortKey="billingCycle"
                >
                  Billing Cycle
                </TableTools.SortableHeaderCell>
              </TableTools.Header>
              <TableBody
                ref={bodyContainerRef}
                loading={subscriptionDraftStore.loading}
                noResult={subscriptionDraftStore.noResult}
                cells={isActiveTab ? 9 : 8}
              >
                <DraftTableData />
              </TableBody>
            </>
          ) : (
            <>
              <TableTools.Header>
                <TableTools.SortableHeaderCell
                  store={subscriptionStore}
                  onSort={handleSortChange}
                  sortKey="startDate"
                >
                  Start Date
                </TableTools.SortableHeaderCell>
                <TableTools.SortableHeaderCell
                  store={subscriptionStore}
                  onSort={handleSortChange}
                  sortKey="id"
                >
                  #
                </TableTools.SortableHeaderCell>
                <TableTools.SortableHeaderCell
                  store={subscriptionStore}
                  onSort={handleSortChange}
                  sortKey="businessLine"
                >
                  Line of Business
                </TableTools.SortableHeaderCell>
                <TableTools.SortableHeaderCell
                  store={subscriptionStore}
                  onSort={handleSortChange}
                  sortKey="service"
                >
                  Service
                </TableTools.SortableHeaderCell>
                <TableTools.SortableHeaderCell
                  store={subscriptionStore}
                  onSort={handleSortChange}
                  sortKey="serviceFrequency"
                >
                  Service Frequency
                </TableTools.SortableHeaderCell>
                {isActiveTab ? (
                  <TableTools.SortableHeaderCell
                    store={subscriptionStore}
                    onSort={handleSortChange}
                    sortKey="nextServiceDate"
                  >
                    Next Service Date
                  </TableTools.SortableHeaderCell>
                ) : null}
                <TableTools.SortableHeaderCell
                  store={subscriptionStore}
                  onSort={handleSortChange}
                  sortKey="customerName"
                >
                  Customer
                </TableTools.SortableHeaderCell>
                <TableTools.SortableHeaderCell
                  store={subscriptionStore}
                  onSort={handleSortChange}
                  sortKey="billingCyclePrice"
                >
                  Price Per Billing Cycle, $
                </TableTools.SortableHeaderCell>
                <TableTools.SortableHeaderCell
                  store={subscriptionStore}
                  onSort={handleSortChange}
                  sortKey="billingCycle"
                >
                  Billing Cycle
                </TableTools.SortableHeaderCell>
              </TableTools.Header>
              <TableBody
                ref={bodyContainerRef}
                loading={subscriptionStore.loading}
                noResult={subscriptionStore.noResult}
                cells={isActiveTab ? 9 : 8}
              >
                <TableData />
              </TableBody>
            </>
          )}
        </Table>
        {!store.search && !!store.getCounts(mine) ? (
          <TableInfiniteScroll
            onLoaderReached={loadMore}
            loaded={store.loaded}
            loading={store.loading}
            initialRequest={false}
          >
            {t(`${I18N_PATH}LoadingSubscriptions`)}
          </TableInfiniteScroll>
        ) : null}
      </TableTools.ScrollContainer>
    </TablePageContainer>
  );
};

export default observer(SubscriptionTable);
