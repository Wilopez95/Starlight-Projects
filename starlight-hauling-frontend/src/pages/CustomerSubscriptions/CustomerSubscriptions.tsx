import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Protected, Shadow, Typography } from '@root/common';
import { Table, TableBody, TableInfiniteScroll, TableTools } from '@root/common/TableTools';
import { Paths, SubscriptionTabRoutes } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores, useSubscriptionSelectedTab } from '@root/hooks';
import { getSubscriptionStatusByTab } from '@root/stores/subscription/helpers';
import { RequestOptions } from '@root/stores/subscription/types';

import DraftTableData from './components/DraftTableData/DraftTableData';
import CustomerSubscriptionTableNavigation from './components/Navigation/CustomerSubscriptionTableNavigation';
import TableData from './components/TableData/TableData';
import { CustomerSubscriptionsParams } from './types';

const I18N_PATH = 'pages.CustomerSubscriptions.CustomerSubscriptions.Text.';

const CustomerSubscriptions: React.FC = () => {
  const { customerStore, subscriptionStore, subscriptionDraftStore } = useStores();
  const { t } = useTranslation();

  const { businessUnitId } = useBusinessContext();
  const subscriptionsContainerRef = useRef<HTMLTableSectionElement>(null);
  const { customerId } = useParams<CustomerSubscriptionsParams>();
  const selectedTab = useSubscriptionSelectedTab();

  const selectedCustomer = customerStore.selectedEntity;

  const isDraftTab = selectedTab === SubscriptionTabRoutes.Draft;

  const requestParams = useMemo(() => {
    const params: RequestOptions = {
      customerId,
      businessUnitId,
    };

    if (selectedTab !== SubscriptionTabRoutes.Draft) {
      params.status = getSubscriptionStatusByTab(selectedTab);
    }

    return params;
  }, [businessUnitId, customerId, selectedTab]);

  const store = isDraftTab ? subscriptionDraftStore : subscriptionStore;

  const loadMore = useCallback(() => {
    store.getAllCustomerSubscriptions(requestParams);
  }, [requestParams, store]);

  useEffect(() => {
    loadMore();

    return () => {
      store.cleanup();
    };
  }, [loadMore, store]);

  const handleSortChange = useCallback(() => {
    if (!store.search) {
      store.cleanup();
      store.request(requestParams);
    }
  }, [store, requestParams]);

  return (
    <Layouts.Box as={Shadow} width="100%" variant="light" backgroundColor="white">
      <Layouts.Flex as={Layouts.Box} height="100%" direction="column">
        <Layouts.Padding padding="3" bottom="2">
          <Layouts.Flex justifyContent="space-between">
            <Typography fontWeight="bold" variant="headerThree">
              {t(`${I18N_PATH}Subscriptions`)}
            </Typography>
            <Protected permissions="subscriptions:place-new:perform">
              <Button
                disabled={selectedCustomer?.status === 'inactive'}
                variant="primary"
                to={pathToUrl(`${Paths.RequestModule.Request}?customerId=${customerId}`, {
                  businessUnit: businessUnitId,
                })}
              >
                {t(`${I18N_PATH}CreateNewSubscription`)}
              </Button>
            </Protected>
          </Layouts.Flex>
        </Layouts.Padding>

        <TableTools.ScrollContainer tableNavigation={<CustomerSubscriptionTableNavigation />}>
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
                    sortKey="serviceFrequency"
                  >
                    Service Frequency
                  </TableTools.SortableHeaderCell>
                  <TableTools.SortableHeaderCell
                    store={subscriptionStore}
                    onSort={handleSortChange}
                    sortKey="jobSiteId"
                  >
                    Job Site
                  </TableTools.SortableHeaderCell>

                  <TableTools.SortableHeaderCell
                    store={subscriptionDraftStore}
                    onSort={handleSortChange}
                    sortKey="nextServiceDate"
                  >
                    Next Service Date
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
                  ref={subscriptionsContainerRef}
                  loading={subscriptionDraftStore.loading}
                  noResult={subscriptionDraftStore.noResult}
                  cells={7}
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
                    sortKey="serviceFrequency"
                  >
                    Service Frequency
                  </TableTools.SortableHeaderCell>

                  <TableTools.SortableHeaderCell
                    store={subscriptionStore}
                    onSort={handleSortChange}
                    sortKey="jobSiteId"
                  >
                    Job Site
                  </TableTools.SortableHeaderCell>
                  <TableTools.SortableHeaderCell
                    store={subscriptionStore}
                    onSort={handleSortChange}
                    sortKey="nextServiceDate"
                  >
                    Next Service Date
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
                  ref={subscriptionsContainerRef}
                  loading={subscriptionStore.loading}
                  noResult={subscriptionStore.noResult}
                  cells={7}
                >
                  <TableData />
                </TableBody>
              </>
            )}
          </Table>
          {/** Same */}
          {!store.search && !!store.getCounts(false) ? (
            <TableInfiniteScroll
              onLoaderReached={loadMore}
              loaded={store.loaded}
              loading={store.loading}
            >
              {t(`${I18N_PATH}LoadingSubscriptions`)}
            </TableInfiniteScroll>
          ) : null}
        </TableTools.ScrollContainer>
      </Layouts.Flex>
    </Layouts.Box>
  );
};

export default observer(CustomerSubscriptions);
