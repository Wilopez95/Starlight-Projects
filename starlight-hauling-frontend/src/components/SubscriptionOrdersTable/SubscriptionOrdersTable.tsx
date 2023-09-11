import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router';
import { camelCase, isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import {
  Table,
  TableBody,
  TableInfiniteScroll,
  TablePageContainer,
  TableTools,
} from '@root/common/TableTools';
import { type SubscriptionOrderFilters } from '@root/common/TableTools/TableFilter/types';
import { Paths, SubscriptionOrderTabRoutes } from '@root/consts';
import { NotificationHelper, pathToUrl } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import {
  useBoolean,
  useBusinessContext,
  useCleanup,
  useStores,
  useSubscriptionOrderAvailableStatuses,
} from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';
import SubscriptionNonServiceOrderEditQuickView from '@root/quickViews/SubscriptionNonServiceOrderEditQuickView/SubscriptionNonServiceOrderEditQuickView';
import SubscriptionOrderDetails from '@root/quickViews/SubscriptionOrderDetails/SubscriptionOrderDetails';
import SubscriptionOrderEditQuickView from '@root/quickViews/SubscriptionOrderEdit/SubscriptionOrderEditQuickView';
import SubscriptionOrderQuickView from '@root/quickViews/SubscriptionOrderQuickView/SubscriptionOrderQuickView';
import { RequestOptions } from '@root/stores/subscriptionOrder/types';
import {
  IApproveOrFinalizeMultipleSubscriptionOrdersRequest,
  SubscriptionOrderStatusEnum,
} from '@root/types';

import { SubscriptionOrder } from '../../stores/subscriptionOrder/SubscriptionOrder';
import ChangeSubscriptionOrdersStatusModal from './components/ChangeSubscriptioOrdersStatusModal/ChangeSubscriptionOrdersStatusModal';
import { Filters, Header, Navigation, SubscriptionOrderRow, TableHeader } from './components';

const I18N_PATH = buildI18Path('components.SubscriptionOrdersTable.');

const SubscriptionOrdersTable: React.FC = () => {
  const { businessUnitId } = useBusinessContext();
  const pageContainer = useRef<HTMLDivElement>(null);

  const subscriptionOrdersContainerRef = useRef<HTMLTableSectionElement>(null);
  const { t } = useTranslation();
  const { tab } = useParams<{ tab: SubscriptionOrderTabRoutes }>();
  const [invalidCount, setInvalidCount] = useState(0);
  const [isChangeStatusOpen, openChangeStatus, closeChangeStatus] = useBoolean();

  const subscriptionOrderAvailableStatuses = useSubscriptionOrderAvailableStatuses();
  const canViewOrders = !isEmpty(subscriptionOrderAvailableStatuses);

  const subscriptionOrderStatus = SubscriptionOrderStatusEnum[tab];
  const isSelectable = [
    SubscriptionOrderStatusEnum.approved,
    SubscriptionOrderStatusEnum.completed,
  ].includes(subscriptionOrderStatus);

  const history = useHistory();

  const status: SubscriptionOrderStatusEnum = useMemo(() => {
    let currentStatus: SubscriptionOrderStatusEnum = SubscriptionOrderStatusEnum[tab];

    if (
      !isEmpty(subscriptionOrderAvailableStatuses) &&
      !subscriptionOrderAvailableStatuses.includes(currentStatus)
    ) {
      // eslint-disable-next-line prefer-destructuring
      currentStatus = subscriptionOrderAvailableStatuses[0];
      history.replace(
        pathToUrl(Paths.SubscriptionModule.SubscriptionOrders, {
          businessUnit: businessUnitId,
          tab: camelCase(currentStatus),
        }),
      );
    }

    return currentStatus;
  }, [businessUnitId, history, subscriptionOrderAvailableStatuses, tab]);

  const { subscriptionOrderStore } = useStores();

  const subscriptionOrderSort: SubscriptionOrder[] = [...subscriptionOrderStore.values];

  const isSubscriptionOrderDetailsOpen = subscriptionOrderStore.detailsOpen;
  const isSubscriptionNonServiceEditOpen = subscriptionOrderStore.isNonServiceEditOpen;

  const [search, setSearch] = useState<string>();
  const [filterData, setFilterData] = useState<SubscriptionOrderFilters>({});

  const requestOptions: RequestOptions = useMemo(() => {
    const {
      filterByStatus,
      filterByBusinessLine,
      filterByServiceDateFrom,
      filterByServiceDateTo,
      ...filters
    } = filterData;
    const filterNeedsApproval = !!filterByStatus?.some(
      statusData => statusData === SubscriptionOrderStatusEnum.needsApproval,
    );
    const filterCompleted = !!filterByStatus?.some(
      statusData => statusData === SubscriptionOrderStatusEnum.completed,
    );

    return {
      filterData: {
        ...filters,
        ...((filterNeedsApproval || filterCompleted) && {
          needsApproval: filterNeedsApproval,
          completed: filterCompleted,
        }),
        filterByBusinessLine: filterByBusinessLine ? filterByBusinessLine : [],
        filterByServiceDateFrom,
        filterByServiceDateTo,
        status,
        businessUnitId,
      },
      search,
    };
  }, [businessUnitId, filterData, search, status]);

  const checkedCount = subscriptionOrderStore.checkedSubscriptionOrders.length;

  const nextStatus =
    status === SubscriptionOrderStatusEnum.completed
      ? SubscriptionOrderStatusEnum.approved
      : SubscriptionOrderStatusEnum.finalized;

  const updatedStatus =
    status === SubscriptionOrderStatusEnum.completed
      ? SubscriptionOrderStatusEnum.needsApproval
      : SubscriptionOrderStatusEnum.approved;

  const count =
    checkedCount > 0 ? checkedCount : subscriptionOrderStore.getCountByStatus(updatedStatus);
  const showValidOnly = count !== invalidCount;

  const handleAllChangeStatus = useCallback(async () => {
    // if (subscriptionOrderStore.getCountByStatus(updatedStatus) > 0) {
    // let count = 0;
    // const ids =
    //   subscriptionOrderStore.checkedSubscriptionOrders.length > 0
    //     ? subscriptionOrderStore.checkedSubscriptionOrders.map((item) => item.id)
    //     : [];
    // }

    let ids = [];

    const subscriptionOrderList =
      subscriptionOrderStore.getChecketCounts() > 0
        ? subscriptionOrderStore.checkedSubscriptionOrders
        : subscriptionOrderStore.values;

    ids = subscriptionOrderList?.map(subscriptionOrder => subscriptionOrder.id);
    const countNumber = await subscriptionOrderStore.validateMultipleToApproveOrFinalize({
      ids,
      options: requestOptions,
      businessUnitId: +businessUnitId,
      status: updatedStatus,
    });

    setInvalidCount(countNumber);
    if (countNumber > 0) {
      openChangeStatus();
    }
  }, [subscriptionOrderStore, openChangeStatus, requestOptions, businessUnitId, updatedStatus]);

  const handleChangeStatus = useCallback(
    async (validOnly: boolean) => {
      const ids =
        checkedCount > 0
          ? subscriptionOrderStore.checkedSubscriptionOrders.map(
              subscriptionOrder => subscriptionOrder.id,
            )
          : [];

      const payload: IApproveOrFinalizeMultipleSubscriptionOrdersRequest = {
        validOnly,
        ids,
        businessUnitId: +businessUnitId,
        status: nextStatus,
      };

      await subscriptionOrderStore.approveOrFinalizeMultiple(payload, requestOptions);
      closeChangeStatus();
    },
    [
      checkedCount,
      subscriptionOrderStore,
      businessUnitId,
      nextStatus,
      requestOptions,
      closeChangeStatus,
    ],
  );

  useEffect(() => {
    const {
      filterByStatus,
      _filterByBusinessLine,
      _filterByServiceDateFrom,
      _filterByServiceDateTo,
      ...filters
    } = filterData;

    if (tab !== SubscriptionOrderTabRoutes.completed && filterByStatus) {
      setFilterData(filters);
    }
  }, [tab, filterData]);

  const handleRequestMore = useCallback(() => {
    if (canViewOrders) {
      subscriptionOrderStore.request(requestOptions);
    }
  }, [canViewOrders, requestOptions, subscriptionOrderStore]);

  useEffect(() => {
    subscriptionOrderStore.cleanup();

    if (canViewOrders) {
      subscriptionOrderStore.requestCount(businessUnitId);
      subscriptionOrderStore.request(requestOptions);
    } else {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
      subscriptionOrderStore.markLoaded();
    }
  }, [businessUnitId, canViewOrders, requestOptions, subscriptionOrderStore]);

  useCleanup(subscriptionOrderStore);
  const isCompletedTab =
    SubscriptionOrderStatusEnum[tab] === SubscriptionOrderStatusEnum.completed ||
    SubscriptionOrderStatusEnum[tab] === SubscriptionOrderStatusEnum.approved;

  return (
    <TablePageContainer ref={pageContainer}>
      <Header tab={tab} onChangeStatus={handleAllChangeStatus} />

      <SubscriptionOrderQuickView
        tableContainerRef={subscriptionOrdersContainerRef}
        clickOutContainers={subscriptionOrdersContainerRef}
        isOpen={
          subscriptionOrderStore.quickViewCondition ? !isSubscriptionNonServiceEditOpen : null
        }
        shouldDeselect={
          !isSubscriptionOrderDetailsOpen && !subscriptionOrderStore.editOpen
            ? !subscriptionOrderStore.isNonServiceEditOpen
            : undefined
        }
      />
      <SubscriptionOrderEditQuickView isOpen={subscriptionOrderStore.editOpen} />
      <SubscriptionNonServiceOrderEditQuickView isOpen={isSubscriptionNonServiceEditOpen} />
      <SubscriptionOrderDetails
        isOpen={isSubscriptionOrderDetailsOpen}
        onClose={subscriptionOrderStore.closeDetails}
      />
      {isSelectable ? (
        <ChangeSubscriptionOrdersStatusModal
          invalidCount={invalidCount}
          isOpen={isChangeStatusOpen}
          onClose={closeChangeStatus}
          status={updatedStatus}
          handleChangeStatus={handleChangeStatus}
          showValidOnly={showValidOnly}
        />
      ) : null}
      <TableTools.ScrollContainer
        tableNavigation={
          <Navigation onSearch={setSearch}>
            <Filters onApply={setFilterData} isCompletedTab={isCompletedTab} />
          </Navigation>
        }
      >
        <Table>
          <TableHeader
            requestOptions={requestOptions}
            isSelectable={isSelectable}
            isCompletedTab={isCompletedTab}
          />
          <TableBody
            loading={subscriptionOrderStore.loading}
            noResult={subscriptionOrderStore.noResult}
            ref={subscriptionOrdersContainerRef}
            cells={isSelectable ? 9 : 8}
          >
            {subscriptionOrderSort
              .filter(
                subscriptionOrder =>
                  subscriptionOrder.status === status ||
                  (status === SubscriptionOrderStatusEnum.finalized &&
                    subscriptionOrder.status === SubscriptionOrderStatusEnum.canceled),
              )
              .map(subscriptionOrder => (
                <SubscriptionOrderRow
                  key={subscriptionOrder.id}
                  subscriptionOrder={subscriptionOrder}
                />
              ))}
          </TableBody>
        </Table>
        <TableInfiniteScroll
          onLoaderReached={handleRequestMore}
          loaded={subscriptionOrderStore.loaded}
          loading={subscriptionOrderStore.loading}
          initialRequest={false}
        >
          {t(`${I18N_PATH.Text}LoadingOrders`)}
        </TableInfiniteScroll>
      </TableTools.ScrollContainer>
    </TablePageContainer>
  );
};

export default observer(SubscriptionOrdersTable);
