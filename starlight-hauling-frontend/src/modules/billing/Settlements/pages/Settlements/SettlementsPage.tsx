import React, { useCallback, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { addWeeks } from 'date-fns';
import { observer } from 'mobx-react-lite';

import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';

import { useRangeCalendar } from '../../../../../common/RangeCalendar/useRangeCalendar';
import {
  TableInfiniteScroll,
  TablePageContainer,
  TableTools,
} from '../../../../../common/TableTools';
import { useBusinessContext, useCleanup, usePermission, useStores } from '../../../../../hooks';
import { PageHeader, SettlementQuickView, SettlementTable } from '../../components';

const initialRangeValue = {
  from: addWeeks(new Date(), -2),
  to: new Date(),
};

const SettlementsPage: React.FC = () => {
  const { businessUnitId } = useBusinessContext();
  const { settlementStore } = useStores();
  const { t } = useTranslation();

  const [rangeValue, rangeProps] = useRangeCalendar(initialRangeValue);

  useCleanup(settlementStore, 'DATE', 'desc');

  const canAccessSettlements = usePermission('billing:settlements:full-access');

  const loadMore = useCallback(() => {
    if (!canAccessSettlements) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
      settlementStore.markLoaded();

      return;
    }

    settlementStore.request({ ...rangeValue, businessUnitId: Number(businessUnitId) });
  }, [canAccessSettlements, settlementStore, rangeValue, businessUnitId]);

  useEffect(() => {
    settlementStore.cleanup();
    loadMore();
  }, [settlementStore, loadMore]);

  const tableBodyContainerRef = useRef<HTMLTableSectionElement>(null);

  return (
    <>
      <Helmet title={t('Titles.CreditCardSettlements')} />
      <TablePageContainer>
        <SettlementQuickView
          isOpen={settlementStore.isOpenQuickView}
          clickOutContainers={tableBodyContainerRef}
        />
        <PageHeader rangeCalendarProps={rangeProps} />
        <TableTools.ScrollContainer>
          <SettlementTable tableBodyContainer={tableBodyContainerRef} onSort={loadMore} />
          <TableInfiniteScroll
            onLoaderReached={loadMore}
            loaded={settlementStore.loaded}
            loading={settlementStore.loading}
            initialRequest={false}
          >
            Loading Settlements
          </TableInfiniteScroll>
        </TableTools.ScrollContainer>
      </TablePageContainer>
    </>
  );
};

export default observer(SettlementsPage);
