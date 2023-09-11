import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Layouts, Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import {
  Table,
  TableBody,
  TableInfiniteScroll,
  TableScrollContainer,
} from '@root/core/common/TableTools';
import { SubscriptionTabRoutes } from '@root/core/consts';
import { useStores, useSubscriptionSelectedTab } from '@root/core/hooks';
import { SubscriptionQuickView } from '@root/customer/quickViews';

import { getSubscriptionStatusByTab } from '../../stores/subscription/helpers';
import { RequestOptions } from '../../stores/subscription/types';
import { CustomerSubscriptionsParams } from '../../types';
import DraftTableData from '../DraftTableData/DraftTableData';
import SubscriptionTableNavigation from '../Navigation/SubscriptionTableNavigation';
import TableData from '../TableData/TableData';
import TableSortableHeader from '../TableSortableHeader/TableSortableHeader';
import { SortableTableTitles } from '../TableSortableHeader/types';

const I18N_PATH = 'components.SubscriptionsGrid.';

const SubscriptionsGrid: React.ForwardRefRenderFunction<HTMLDivElement> = (props, ref) => {
  const { subscriptionStore, subscriptionDraftStore } = useStores();

  // const navigationRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const bodyContainerRef = useRef<HTMLTableSectionElement>(null);

  const { customerId } = useParams<CustomerSubscriptionsParams>();
  const selectedTab = useSubscriptionSelectedTab();
  const { t } = useTranslation();

  const isDraftTab = selectedTab === SubscriptionTabRoutes.Draft;

  const requestParams = useMemo(() => {
    const params: RequestOptions = {
      customerId,
    };

    if (selectedTab !== SubscriptionTabRoutes.Draft) {
      params.status = getSubscriptionStatusByTab(selectedTab);
    }

    return params;
  }, [customerId, selectedTab]);

  const store = isDraftTab ? subscriptionDraftStore : subscriptionStore;

  useEffect(() => {
    if (customerId) {
      subscriptionDraftStore.requestCount({
        customerId,
      });
      subscriptionStore.requestCustomerCount({
        customerId,
      });
    }
  }, [subscriptionStore, customerId, subscriptionDraftStore]);

  const loadMore = useCallback(() => {
    store.getAllCustomerSubscriptions(requestParams);
  }, [requestParams, store]);

  useEffect(() => {
    loadMore();

    return () => {
      store.cleanup();
    };
  }, [loadMore, store]);

  return (
    <>
      {!isDraftTab && (
        <SubscriptionQuickView
          tableScrollContainerRef={ref as React.MutableRefObject<HTMLDivElement | null>}
          tbodyContainerRef={bodyContainerRef}
          condition={subscriptionStore.quickViewCondition}
          store={subscriptionStore}
          shouldDeselect={!(subscriptionStore.detailsOpen || subscriptionStore.editOpen)}
        />
      )}
      <Layouts.Padding padding='3' bottom='2'>
        <Layouts.Flex justifyContent='space-between'>
          <Typography variant='headerThree'>{t(`${I18N_PATH}Subscriptions`)}</Typography>
        </Layouts.Flex>
      </Layouts.Padding>
      <SubscriptionTableNavigation mine={false} />

      <TableScrollContainer
        ref={tableContainerRef as React.MutableRefObject<HTMLDivElement | null>}
      >
        <Table>
          <TableSortableHeader
            tableRef={tableContainerRef}
            requestOptions={requestParams}
            relatedStore={store}
            sortableTableTitle={SortableTableTitles.customerSubscriptions}
          />
          <TableBody
            ref={bodyContainerRef}
            loading={store.loading}
            noResult={store.noResult}
            cells={7}
          >
            {isDraftTab ? <DraftTableData /> : <TableData />}
          </TableBody>
        </Table>
        {/** Same */}
        {!store.search && !!store.getCounts(false) && (
          <TableInfiniteScroll
            onLoaderReached={loadMore}
            loaded={store.loaded}
            loading={store.loading}
          >
            {t(`${I18N_PATH}LoadingSubscriptions`)}
          </TableInfiniteScroll>
        )}
      </TableScrollContainer>
    </>
  );
};

export default observer(SubscriptionsGrid, {
  forwardRef: true,
});
